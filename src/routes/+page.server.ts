import type { PageServerLoad, Action, Actions } from './$types';
import { type App } from '$lib/apps'
import { User } from '$lib/user';
import { error } from '@sveltejs/kit'
import * as errors from "$lib/errors"
import * as config from '$lib/config'
import { fail, message, type SuperValidated } from 'sveltekit-superforms';
import { Azure } from '$lib/azure';

//Typescript magic!
function hasProperty<O extends object>(o: O, k: PropertyKey): k is keyof O {
    return k in o
}

function objectMap<In,Out>(o: Record<PropertyKey,In>, f: (a: In) => Out): Record<PropertyKey,Out> {
    return Object.fromEntries(Object.entries(o).map(([key,val]) => [key,f(val)]))
}

export const load: PageServerLoad = async ( { locals }) => {
    const user = new User(locals.user.userDetails).load()
    const appData = objectMap(config.apps,async (app) => app.load(await user))
    return {userData: user, appData: appData}
}

export const actions = objectMap(config.apps,
    (app): Action => {
        let action: Action = async ({request, locals}) => {
            Promise.all([request.formData(), new User(locals.user.userDetails).load()])
            .then(([data,user]) => app.save(user, data))
            .then((failure) => failure)
        }
        return action
    }
) satisfies Actions


