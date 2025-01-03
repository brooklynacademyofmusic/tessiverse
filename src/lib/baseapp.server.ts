import type { AppServer } from "$lib/apps.server"
import type { App, AppLoad } from "$lib/apps"
import { UserLoaded, type BackendKey } from "$lib/azure"
import type { ActionFailure } from "@sveltejs/kit"
import type { Apps } from "./config"


export abstract class BaseAppServer<A extends App<keyof Apps,any,any>, Save extends object>  implements AppServer<A,Save> {
    data: A["data"]
    key = "base" as A["key"]

    constructor(data?: A["data"]) {
        this.data = data
    }

    // Assigns data into this.data and also returns it
    async load(backend: UserLoaded, key: BackendKey = {identity: backend.identity, app: this.key}): Promise<AppLoad<A>> {
        Object.assign(this.data,backend.load({identity: key.identity, app: this.key}))
        return this.data
    }

    // Assigns data into this.data and then saves it to the backend
    async save(data: Save, backend: UserLoaded, key: BackendKey = {identity: backend.identity, app: this.key}): Promise<void | ActionFailure<any> | {form: any}> {
        Object.assign(this.data, data)
        return backend.save({identity: key.identity, app: this.key}, this.data)
    }
}
