import type { PageServerLoad, Actions, RequestEvent } from './$types';
import * as server from '$lib/config.server'
import { Azure, UserLoaded } from '$lib/azure';
import type { AppServer } from '$lib/apps.server';
import { error } from '@sveltejs/kit';
import * as errors from '$lib/errors'
import { User } from '$lib/user';
import { TessituraAppServer } from '$lib/apps/tessitura/tessitura.server';

let servers = new server.AppServers()

type AppPromises = {
    [K in keyof server.AppServers]: Promise<server.AppServers[K]["data"]>
}

function objectMap<I extends any,O extends any>(o: {[k: string]: I},f: (k: string, i: I) => O): {[k: string]: O} {
    return Object.fromEntries(Object.entries(o).map(([k,v]) => [k,f(k,v)]))
}

export const load: PageServerLoad = async ( { locals }) => {
    let backend = new Azure()
    let user = backend.load({identity: locals.user.userDetails})
    let appData = objectMap(servers, 
        (key, server: AppServer<string,any,any>) => 
            user.catch(() => new User(locals.user.userDetails) as UserLoaded)
                .then((user) => server.load(user, 
                        {identity: user.identity, app: key}))) as AppPromises
    return {userData: user, appData: appData}
}

const actionFactory = function(key: string,server: AppServer<any,any,any>) {
    return async ({request, locals}: RequestEvent) => {
        let formData = await request.formData()
        let backend = new Azure()
        let user = await backend.load({identity: locals.user.userDetails}).catch(() => new UserLoaded(locals.user.userDetails))
        return server.save(formData, user, {identity: locals.user.userDetails, app: key})
                    .catch(() => error(500, errors.AZURE_KEYVAULT))
}}

export const actions: Actions = objectMap(servers, (key, server) => actionFactory(key,server))