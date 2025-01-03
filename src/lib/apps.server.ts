import { type Backend, type BackendKey } from '$lib/azure'
import { type ActionFailure } from '@sveltejs/kit'
import { type App, type AppLoad } from '$lib/apps'

export interface AppServer<A extends App<string,any,any>,Save extends object> {
    key: A["key"]
    data: A["data"]

    // function to load and process data from the backend
    load(backend: Backend<any>, key?: BackendKey): Promise<AppLoad<A>>
    // function to save data to the backend
    save(data: Save, backend: Backend<any>, key?: BackendKey): Promise<void | ActionFailure<any> | {form: any}>    
} 

