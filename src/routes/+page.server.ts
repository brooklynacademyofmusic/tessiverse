import type { PageServerLoad, Actions } from './$types';
import { User } from '$lib/user';
import { error } from '@sveltejs/kit'
import * as errors from "$lib/errors"
import * as config from '$lib/config'

//Typescript magic!
function hasProperty<O extends object>(o: O, k: PropertyKey): k is keyof O {
    return k in o
}

export const load: PageServerLoad = async ( { locals }) => {
    if (!locals.user.userId) {
        error(401, errors.AUTH)
    }
    const userData = new User(locals.user.userDetails).load()
    const appData = Object.fromEntries(Object.entries(config.apps).map(
        ([key,app]) => [key, userData.then(
            (user): Promise<typeof app.data> => {
                if (hasProperty(user.apps,key)) {
                    return app.load(user.apps[key].data)
                } else {
                    throw("App "+key+" not found!")
                }
            })]
    ))
  
    return {userData: userData, appData: appData}
}


export const actions = 
    Object.fromEntries(
        Object.entries(config.apps).map(
            ([key,app]) => [key, app.save]
        )
    ) satisfies Actions