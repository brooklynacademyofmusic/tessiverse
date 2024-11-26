import type { Handle } from '@sveltejs/kit';

type clientPrincipal = {
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
    
    const user = JSON.parse(header.toString('ascii') || "{}") as clientPrincipal

    event.locals.user = user

	const response = await resolve(event);
	return response;
};