import { type Component } from 'svelte'
import { type Backend, type BackendKey } from '$lib/azure'
import { error, type ActionFailure } from '@sveltejs/kit'
import { AUTH } from './errors'


// interface for establishing the contract between the main route and the individual cards/forms.
export interface AppComponents {
    // human readable name, will appear as the title of the card
    title: string 
    // a dashboard coard, which will be rendered inside of a <Card></Card>
    card: Component<any>
    // a form element triggered by the configuration button on the card
    form: Component<any>
}

export interface App {
    components: AppComponents
    // JSON serializable data
    data: any
    // machine readable name, must be the same as the key in `apps`
    key: string
    // function to load data from the backend, with optional preloaded data
    load(backend: Backend, key: BackendKey): any
    // function to save data to the backend
    save(backend: Backend, data: any, key: BackendKey): Promise<void | ActionFailure<any> | {form: any}>    
}

const ComponentStub: Component<any> = {} as Component<any>
export class AppBase implements App {
    key = "base"
    components = {title: "Base",
                  card: ComponentStub,
                  form: ComponentStub}
    data = {}

    async load(backend: Backend, key?: BackendKey): Promise<any> {
        if ("identity" in backend && typeof backend.identity === "string") 
            return backend.load({identity: backend.identity, app: this.key})
        if (!key)
            error(500, AUTH)
        Object.assign(this.data,backend.load(key))
    }

    async save(backend: Backend, data: any, key?: BackendKey): Promise<void | ActionFailure<any> | {form: any}> {
        if ("identity" in backend && typeof backend.identity === "string") 
            return backend.save({identity: backend.identity, app: this.key}, data)
        if (!key)
            error(500, AUTH)
        return backend.save(key, data)
    }
}

