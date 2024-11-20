import type { PageServerLoad } from './$types';
import { UserConfig } from '$lib/config';
import { User } from 'lucide-svelte';
import { error } from '@sveltejs/kit'

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
        error(401, 'User not logged in!?')
    }

    const userConfig = new UserConfig(user.userDetails)
    console.log(await userConfig.loadFromAzure())

    return {
        name: user.userDetails,
        config: null
    }
}