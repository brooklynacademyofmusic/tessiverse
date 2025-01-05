import { error, type Handle, redirect } from '@sveltejs/kit';
import * as errors from "$lib/errors"
import { env } from "$env/dynamic/private"
import jwt from "jsonwebtoken"
import jwks from "jwks-rsa"

export const handle: Handle = async ({ event, resolve }) => {

    let user: App.Platform["clientPrincipal"]
    const token = event.request.headers.get("authorization")?.split(" ")[1]

    if (event.platform && event.platform.clientPrincipal){
        user = event.platform.clientPrincipal
    } else if (event.request.headers.get("Api-Key") == env.API_KEY) {
        user = {
            identityProvider: "api_key",
            userId: event.request.headers.get("x-ms-workflow-id") || "apiUser",
            userDetails: event.request.headers.get("x-ms-workflow-name") || "apiUser",
            userRoles: ["authenticated", "anonymous", "admin"]
        }
    } else if (env.DEV_USER) {
        user = JSON.parse(Buffer.from(env.DEV_USER, 'base64').toLocaleString())        
    // } else if(token) {
    //     let payload = await new Promise((res,rej) => 
    //         jwt.verify(token, getKey, {
    //             algorithms: ['RS256'],
    //             audience: env.AZURE_CLIENT_ID,
    //             issuer: `https://sts.windows.net/${env.AZURE_TENANT_ID}/`
    //         },(e,p) => {
    //             if(e || !p) rej(e)
    //             else res(p)
    //         })).catch((e) => error(403,e)) as jwt.JwtPayload | string

    //     if (typeof payload === "string")
    //         payload = JSON.parse(payload) as jwt.JwtPayload
            
    //     user = {
    //         identityProvider: "bearer_token",
    //         userId: payload.oid,
    //         userDetails: payload.upn,
    //         userRoles: ["authenticated", "anonymous"].concat(payload.roles)
    //     }
    } 

    if(!user) {
        user = {identityProvider: "", userId: "", userDetails: "", userRoles: ["anonymous"]}
    }

    event.locals.user = user

    if (!("userRoles" in event.locals.user) || !event.locals.user.userRoles.includes("authenticated")) {
        if (!event.request.url.match(/\/login$/)) {
            redirect(302, "/login")
        } else {
            error(401, errors.LOGIN)
        }
    }
	const response = await resolve(event);
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