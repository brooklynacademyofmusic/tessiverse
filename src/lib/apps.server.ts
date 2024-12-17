import { UserLoaded, type Backend } from '$lib/azure'
import { type ActionFailure } from '@sveltejs/kit'
import { BaseApp, type App } from './apps'
import type { Apps } from './config'

export interface AppServer<In extends object, Out extends object> {
    data: App<In>
    // function to load and process data from the backend
    load(backend: Backend<any>): Promise<In>
    // function to save data to the backend
    save(backend: Backend<any>, data: Out): Promise<void | ActionFailure<any> | {form: any}>    
}

export abstract class BaseAppServer implements AppServer<any,any> {
    data = new BaseApp()
    key: keyof Apps

    constructor() {
        this.key = this.data.key as keyof Apps
    }

    async load(backend: UserLoaded): Promise<any> {
        Object.assign(this.data,backend.load({identity: backend.identity, app: this.key}))
        return this
    }

    async save(backend: UserLoaded, data: any): Promise<void | ActionFailure<any> | {form: any}> {
        return backend.save({identity: backend.identity, app: this.key}, data)
    }
}

