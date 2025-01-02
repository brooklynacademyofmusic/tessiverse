import { type Backend, type BackendKey } from '$lib/azure'
import { type ActionFailure } from '@sveltejs/kit'

export interface AppServer<Key extends string, Data extends object, Load extends object, Save extends object> {
    key: Key
    data: Data

    // function to load and process data from the backend
    load(backend: Backend<any>, key: BackendKey): Promise<Load>
    // function to save data to the backend
    save(data: Save, backend: Backend<any>, key: BackendKey): Promise<void | ActionFailure<any> | {form: any}>    
} 

