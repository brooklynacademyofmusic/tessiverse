import { error, type Handle, redirect } from '@sveltejs/kit';
import * as errors from "$lib/errors"
import { env } from "$env/dynamic/private"
import jwt from "jsonwebtoken"
import jwks from "jwks-rsa"
import type { ClientPrincipalWithClaims } from 'svelte-adapter-azure-swa';

export const handle: Handle = async ({ event, resolve }) => {

    let user: App.Platform["clientPrincipal"]
    const token = event.request.headers.get("authorization")?.split(" ")[1]

    if (event.platform && event.platform.clientPrincipal){
        if (event.platform.clientPrincipal.userDetails) {
            user = event.platform.clientPrincipal
        } else {
            // This appears to be how Azure handles authentication internally ...
            let cp = (event.platform.clientPrincipal as ClientPrincipalWithClaims & {name_typ: string, role_typ: string, auth_typ: string})
            user = {
                identityProvider: cp.auth_typ,
                userId: cp.claims.filter((v) => v.typ == cp.name_typ)[0].val,
                userDetails: cp.claims.filter((v) => v.typ == cp.name_typ)[0].val,
                userRoles: ["authenticated", "anonymous"]
            }
        }
    } else if (env.DEV_USER) {
        user = JSON.parse(Buffer.from(env.DEV_USER, 'base64').toLocaleString())        
    } else if(token) {
        await new Promise<jwt.JwtPayload | string>((res,rej) => 
            // verify that it's a signed key, not expired, and it's meant for us...
            jwt.verify(token, getKey, {
                algorithms: ['RS256'],
                audience: env.AZURE_CLIENT_ID,
                issuer: `https://sts.windows.net/${env.AZURE_TENANT_ID}/`
            },(err,payload) => {
                if(err || !payload) rej(err)
                else res(payload)
            })).then((payload) => {
                if (typeof payload === "string")
                    payload = JSON.parse(payload) as jwt.JwtPayload
                    
                user = {
                    identityProvider: "bearer_token",
                    userId: payload.oid,
                    userDetails: payload.upn,
                    userRoles: ["authenticated", "anonymous"].concat(payload.roles)
                }
        }).catch(() => {}) // no-op
    } 

    if(!user) {
        user = {identityProvider: "", userId: "", userDetails: "", userRoles: ["anonymous"]}
    }

    user.userDetails = user.userDetails.toLowerCase()
    event.locals.user = user

    if (!("userRoles" in event.locals.user) || !event.locals.user.userRoles.includes("authenticated")) {
        if (!event.request.url.match(/\/login$/)) {
            redirect(302, "/login")
        } else {
            error(401, errors.LOGIN)
        }
    }
	const response = await resolve(event);
    response.headers.set("cache-control", "private")
	return response;
};

// Client for getting the JWT signing key
const client = new jwks.JwksClient({
    jwksUri: `https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/discovery/keys`
})

// Helper function to retrieve signing key from kid (key ID)
const getKey: jwt.GetPublicKeyOrSecret = (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
        if (err || !key) {
            return callback(err);
        }
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}