import { error, type Handle, redirect } from '@sveltejs/kit';
import * as errors from "$lib/errors"
import { env } from "$env/dynamic/private"

export type ClientPrincipal = {
    identityProvider: string,
    userId: string,
    userDetails: string,
    userRoles: string[]
} 

export const handle: Handle = async ({ event, resolve }) => {

    const header = Buffer.from(
        event.request.headers.get('x-ms-client-principal') || 
        env.DEV_USER ||
//        event.cookies.get("StaticWebAppsAuthCookie") || 
        "", 'base64');
    
    let user = JSON.parse(header.toString('ascii') || "{}") as ClientPrincipal
    
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