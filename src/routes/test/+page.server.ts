import type { PageServerLoad, Action, Actions } from './$types';
import { type App } from '$lib/apps'
import { User, UserLoaded } from '$lib/user';
import { error } from '@sveltejs/kit'
import * as errors from "$lib/errors"
import * as config from '$lib/config'
import { fail, message, type SuperValidated } from 'sveltekit-superforms';
import { Azure } from '$lib/azure';
import { TessituraApp } from '$lib/apps/tessitura/tessitura';

//Typescript magic!
function hasProperty<O extends object>(o: O, k: PropertyKey): k is keyof O {
    return k in o
}

function objectMap<In,Out>(o: Record<PropertyKey,In>, f: (a: In) => Out): Record<PropertyKey,Out> {
    return Object.fromEntries(Object.entries(o).map(([key,val]) => [key,f(val)]))
}

export const load: PageServerLoad = async ( { locals }) => {
    const user = new UserLoaded(locals.user.userDetails) 
    user.apps.tessitura.userid = 'ssyzygy'
    const appData = objectMap(config.apps,
        (app) => {
            console.log("loading "+app.key)
            if (hasProperty(config.apps, app.key)) {
                return app.load(user,{identity: user.identity, app: app.key})
            } else {
                error(500, "Don't know how to load app "+app.key)
            }
        })
    return {appData: appData}
}

export const actions = objectMap(config.apps,
    (app: App): Action => {
        let action: Action = async ({request, locals}) => {
            if (!locals.user.userId) {
                error(401, errors.AUTH)
            }
            if (hasProperty(config.apps, app.key)) {
                const user = new User(locals.user.userDetails).load()
                const data = await request.formData()
                console.log(data)
                app.save(await user, {identity: (await user).identity, app: app.key}, data)
                    .then((failure) => failure)
            } else {
                error(500, "Don't know how to save app "+app.key)
            }
        }
        return action
    }
) satisfies Actions


