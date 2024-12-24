import { type Backend, type BackendKey } from '$lib/azure'
import { type ActionFailure } from '@sveltejs/kit'

export interface AppServer<Key extends string, In extends object, Out extends object> {
    key: Key
    data: In
    // function to load and process data from the backend
    load(backend: Backend<any>, key: BackendKey): Promise<In>
    // function to save data to the backend
    save(data: Out, backend: Backend<any>, key: BackendKey): Promise<void | ActionFailure<any> | {form: any}>    
}


