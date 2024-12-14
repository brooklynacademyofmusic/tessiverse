import type { PageServerLoad, Action, Actions } from './$types';
import * as server from '$lib/config.server'
import { Azure } from '$lib/azure';

let servers = new server.AppServers()

//Typescript magic!
function hasProperty<O extends object>(o: O, k: PropertyKey): k is keyof O {
    return k in o
}

export const load: PageServerLoad = async ( { locals }) => {
    let backend = new Azure()
    let user = backend.load({identity: locals.user.userDetails})
    let appData: any = {} 
    for(let key in servers) {
        if (hasProperty(servers,key))
        appData[key] = user.then((user) => servers[key].load(user) as any)
    }
    // const appData = objectMap(new config.Apps(),(app) => (app.load(user)))
    return {userData: user, appData: appData}
}

export const actions: Actions = {}
for(let key in servers) {
    if (hasProperty(servers,key))
        actions[key] = async ({request, locals}) => {
            let backend = new Azure()
            Promise.all([request.formData(), backend.load({identity: locals.user.userDetails})])
            .then(([data,user]) => servers[key].save(user, data))
            .then((failure) => failure)
        } 
    }


