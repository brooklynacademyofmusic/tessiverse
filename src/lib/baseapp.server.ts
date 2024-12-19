import type { AppServer } from "$lib/apps.server"
import { Apps } from "$lib/config"
import { UserLoaded } from "$lib/azure"
import type { ActionFailure } from "@sveltejs/kit"

export abstract class BaseAppServer implements AppServer<string,any,any> {
    data: any
    key = "base"

    constructor(data: any = {}) {
        this.data = data
    }

    async load(backend: UserLoaded): Promise<any> {
        Object.assign(this.data,backend.load({identity: backend.identity, app: this.key as keyof Apps}))
        return this.data
    }

    async save(backend: UserLoaded, data: any): Promise<void | ActionFailure<any> | {form: any}> {
        Object.assign(this.data, data)
        return backend.save({identity: backend.identity, app: this.key as keyof Apps}, this.data)
    }
}
