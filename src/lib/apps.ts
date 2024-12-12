import * as config from '$lib/config'
import { type Component } from 'svelte'
import { type Backend, type BackendKey } from '$lib/azure'
import { error, type ActionFailure } from '@sveltejs/kit'
import type { UserLoaded } from './user'
import { AUTH } from './errors'


// interface for establishing the contract between the main route and the individual cards/forms.
export interface App {
    // human readable name, will appear as the title of the card
    title: string 
    // machine readable name, must be the same as the key in `apps`
    key: string
    // a dashboard coard, which will be rendered inside of a <Card></Card>
    card: Component<any>
    // a form element triggered by the configuration button on the card
    form: Component<any>
    // function to load data from the backend, with optional preloaded data
    load<T extends App>(backend: Backend<T>, key: BackendKey<T>): any
    // function to save data to the backend
    save<T extends App>(backend: Backend<T>, data: any, key: BackendKey<T>): Promise<void | ActionFailure<any> | {form: any}>
}

const ComponentStub: Component<any> = {} as Component<any>
export class AppBase implements App {
    title = "Base" 
    key = "base"
    card = ComponentStub
    form = ComponentStub
    async load(backend: Backend<AppBase>, key?: BackendKey<AppBase>): Promise<Partial<AppBase>> {
        if ("identity" in backend && typeof backend.identity === "string") 
            return backend.load({identity: backend.identity, app: this.key}, this as AppBase)
        if (!key)
            error(500, AUTH)
        return backend.load(key, this)
    }

    async save(backend: Backend<AppBase>, data: any, key?: BackendKey<AppBase>): Promise<void | ActionFailure<any> | {form: any}> {
        if ("identity" in backend && typeof backend.identity === "string") 
            return backend.save({identity: backend.identity, app: this.key}, data)
        if (!key)
            error(500, AUTH)
        return backend.save(key, data)
    }
}


export type ConfiguredApps = typeof config.apps
export type AppNames = keyof ConfiguredApps
export type Apps = ConfiguredApps[AppNames]