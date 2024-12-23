import type { AppServer } from "$lib/apps.server"
import { Apps } from "$lib/config"
import { UserLoaded, type BackendKey } from "$lib/azure"
import type { ActionFailure } from "@sveltejs/kit"

export abstract class BaseAppServer<Key extends string,In extends object,Out extends object> 
                implements AppServer<Key,In,Out> {
    data: In
    key: Key = "base" as Key

    constructor(data: In = {} as In) {
        this.data = data
    }

    async load(backend: UserLoaded, key: BackendKey = {identity: backend.identity, app: this.key}): Promise<any> {
        Object.assign(this.data,backend.load({identity: backend.identity, app: this.key as keyof Apps}))
        return this.data
    }

    async save(data: Out, backend: UserLoaded, key: BackendKey = {identity: backend.identity, app: this.key}): Promise<void | ActionFailure<any> | {form: any}> {
        Object.assign(this.data, data)
        return backend.save({identity: backend.identity, app: this.key as keyof Apps}, this.data)
    }
}
