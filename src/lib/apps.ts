import * as config from '$lib/config'
import { type Component } from 'svelte'
import { type Backend, type BackendKey } from '$lib/azure'
import type { ActionFailure } from '@sveltejs/kit'


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
    load(backend: Backend<App>, key: BackendKey<AppBase>): Promise<App>
    // function to save data to the backend
    save(backend: Backend<App>, key: BackendKey<AppBase>, data: any): Promise<void | ActionFailure<any> | {form: any}>
}

const ComponentStub: Component<{}> = {} as Component<{}>
export class AppBase implements App {
    title = "Base" 
    key = "base"
    card = ComponentStub
    form = ComponentStub
    async load(backend: Backend<AppBase>, key: BackendKey<AppBase>) {return backend.load(key, this)}
    async save(backend: Backend<AppBase>, key: BackendKey<AppBase>, data: any): Promise<void | ActionFailure<any> | {form: any}> {return backend.save(key, data)}
}


export type ConfiguredApps = typeof config.apps
export type AppNames = keyof ConfiguredApps
export type Apps = ConfiguredApps[AppNames]