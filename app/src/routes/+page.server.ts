import type { PageServerLoad } from './$types';
import { UserConfig } from '$lib/userconfig';
import { error } from '@sveltejs/kit'
import * as errors from "$lib/errors"

type clientPrincipal = {
    identityProvider: string,
    userId: string,
    userDetails: string,
    userRoles: string[]
} 

export const load: PageServerLoad = async ( { request, cookies }) => {
    const header = Buffer.from(
                        request.headers.get('x-ms-client-principal') || 
                        cookies.get("StaticWebAppsAuthCookie") || 
                        "", 'base64');
    const user = JSON.parse(header.toString('ascii') || "{}") as clientPrincipal

    if (!user.userDetails) {
        error(401, errors.AUTH_ERROR)
    }

    const userConfig = new UserConfig(user.userDetails)

    return {
        config: userConfig.loadFromAzure()
    }
}