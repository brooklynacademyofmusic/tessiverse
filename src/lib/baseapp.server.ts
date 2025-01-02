import type { AppServer } from "$lib/apps.server"
import { Apps } from "$lib/config"
import { UserLoaded, type BackendKey } from "$lib/azure"
import type { ActionFailure } from "@sveltejs/kit"
import { string } from "zod"

export abstract class BaseAppServer<Key extends string, Data extends object, Load extends object, Save extends object> implements AppServer<Key,Data,Load,Save> {
    data: Data
    key = "base" as Key

    constructor(data: Data) {
        this.data = data
    }

    // Loads data into this.data and also returns it
    async load(backend: UserLoaded, key: BackendKey = {identity: backend.identity, app: this.key}): Promise<any> {
        Object.assign(this.data,backend.load({identity: key.identity, app: key.app as keyof Apps}))
        return this.data
    }

    // Saves data into this.data and also to the backend
    async save(data: Save, backend: UserLoaded, key: BackendKey = {identity: backend.identity, app: this.key}): Promise<void | ActionFailure<any> | {form: any}> {
        Object.assign(this.data, data)
        return backend.save({identity: key.identity, app: key.app as keyof Apps}, this.data)
    }
}
