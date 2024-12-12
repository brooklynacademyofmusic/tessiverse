import { type Handle, error } from '@sveltejs/kit';
import * as errors from "$lib/errors"

export type ClientPrincipal = {
    identityProvider: string,
    userId: string,
    userDetails: string,
    userRoles: string[]
} 

export const handle: Handle = async ({ event, resolve }) => {

    const header = Buffer.from(
        event.request.headers.get('x-ms-client-principal') || 
        event.cookies.get("StaticWebAppsAuthCookie") || 
        "", 'base64');
    
    let user = JSON.parse(header.toString('ascii') || "{}") as ClientPrincipal
    user = {identityProvider: "me", userId: "ssyzygy", userDetails: "ssyzygy", userRoles: ["admin"]}
    event.locals.user = user
    if (!event.locals.user.userId) {
        error(401, errors.AUTH)
    }
	const response = await resolve(event);
	return response;
};