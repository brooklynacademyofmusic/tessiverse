import type { PageServerLoad, Actions, RequestEvent } from './$types';
import * as server from '$lib/config.server'
import * as config from '$lib/config'
import { Azure, UserLoaded } from '$lib/azure';
import type { AppServer } from '$lib/apps.server';
import { error } from '@sveltejs/kit';
import * as errors from '$lib/errors'

let servers = new server.AppServers() 

type AppPromises = {
    [K in keyof server.AppServers]: Promise<server.AppServers[K]["data"]>
}

function objectMap<I extends any,O extends any>(o: {[k: string]: I},f: (k: string, i: I) => O): {[k: string]: O} {
    return Object.fromEntries(Object.entries(o).map(([k,v]) => [k,f(k,v)]))
}

export const load: PageServerLoad = async ( { locals }) => {
    let backend = new Azure()
    let userData = backend.load({identity: locals.user.userDetails})
    let appData = objectMap(servers, 
        (_, server: AppServer<config.Apps[keyof config.Apps],any>) => 
            userData
                .then((user) => new UserLoaded(user))
                .catch(() => new UserLoaded({identity: locals.user.userDetails}))
                .then((backend) => server.load(backend))) as AppPromises
    return {userData: userData, appData: appData}
}

const actionFactory = function(_: string, server: AppServer<config.Apps[keyof config.Apps],any>) {
    return async ({request, locals}: RequestEvent) => {
        let formData = await request.formData()
        let backend = new Azure()
        return await backend.load({identity: locals.user.userDetails})
            .then((user) => new UserLoaded(user))
            .catch(() => new UserLoaded({identity: locals.user.userDetails}))
            .then((backend) => server.save(formData, backend))
            .catch(() => error(500, errors.AZURE_KEYVAULT))
}}

export const actions: Actions = objectMap(servers, (key, server) => actionFactory(key,server))