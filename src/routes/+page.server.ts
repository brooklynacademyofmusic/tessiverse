import type { PageServerLoad } from './$types';
import { UserConfig } from '$lib/userconfig';
import { error } from '@sveltejs/kit'
import * as errors from "$lib/errors"

export const load: PageServerLoad = async ( { locals }) => {
    if (!locals.user.userId) {
        error(401, errors.AUTH)
    }

    const userConfig = new UserConfig(locals.user.userDetails)

    return {
        config: userConfig.loadFromAzure()
    }
}