import { UserLoaded, type Backend } from '$lib/azure'
import { type ActionFailure } from '@sveltejs/kit'
import { BaseApp, type App } from './apps'
import type { Apps } from './config'

export interface AppServer<T> {
    // function to load and process data from the backend
    load(backend: Backend<any>): this | Promise<this>
    // function to save data to the backend
    save(backend: Backend<any>, data: T): Promise<void | ActionFailure<any> | {form: any}>    
}

export abstract class BaseAppServer implements AppServer<any> {
    data = new BaseApp()
    key: keyof typeof Apps

    constructor() {
        this.key = this.data.key as keyof typeof Apps
    }

    load(backend: UserLoaded): this | Promise<this> {
        Object.assign(this.data,backend.load({identity: backend.identity, app: this.key}))
        return this
    }

    async save(backend: UserLoaded, data: any): Promise<void | ActionFailure<any> | {form: any}> {
        return backend.save({identity: backend.identity, app: this.key}, data)
    }
}

