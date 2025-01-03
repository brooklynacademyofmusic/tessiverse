import type { AppServer } from "$lib/apps.server"
import type { App } from "$lib/apps"
import { UserLoaded, type ValidBackendKeys } from "$lib/azure"
import type { ActionFailure } from "@sveltejs/kit"
import type { Apps } from "./config"


export abstract class BaseAppServer<A extends App<keyof Apps,any,any>, Save extends object> implements AppServer<A,Save> {
    data: A["data"]
    key = "base" as A["key"]

    constructor(data?: A["data"]) {
        this.data = data
    }

    // Assigns data into this.data and also returns it
    async load(backend: UserLoaded, key: ValidBackendKeys = {identity: backend.identity, app: this.key}): Promise<A["data"]> {
        Object.assign(this.data,backend.load({identity: key.identity, app: this.key}))
        return this.data
    }

    // Assigns data into this.data and then saves it to the backend
    async save(data: A["data"], backend: UserLoaded, key: ValidBackendKeys = {identity: backend.identity, app: this.key}): Promise<void | ActionFailure<any> | {form: any}> {
        // Get the freshest data from the backend first
        Object.assign(this.data, backend.load(key))
        Object.assign(this.data, data)
        return backend.save({identity: key.identity, app: this.key}, this.data)
    }
}
