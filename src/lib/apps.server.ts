import { type Backend } from '$lib/azure'
import { type ActionFailure } from '@sveltejs/kit'

export interface AppServer<Key extends string, In extends object, Out extends object> {
    key: Key
    data: In
    // function to load and process data from the backend
    load(backend: Backend<any>): Promise<In>
    // function to save data to the backend
    save(backend: Backend<any>, data: Out): Promise<void | ActionFailure<any> | {form: any}>    
}


