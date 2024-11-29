import type { PageServerLoad, Actions } from './$types';
import { UserConfig } from '$lib/userconfig';
import { error } from '@sveltejs/kit'
import * as errors from "$lib/errors"
import * as config from '$lib/config'

export const load: PageServerLoad = async ( { locals }) => {
    if (!locals.user.userId) {
        error(401, errors.AUTH)
    }

    const userConfig = new UserConfig(locals.user.userDetails)

    return {
        config: userConfig.loadFromAzure()
    }
}

export const actions = 
    Object.fromEntries(
        Object.entries(config.apps).map(
            ([key, appConfig]) => [key, appConfig.action]
        )
    ) satisfies Actions