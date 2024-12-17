import type { AppServer } from "$lib/apps.server"
import { Apps } from "$lib/config"
import { UserLoaded } from "$lib/azure"
import type { ActionFailure } from "@sveltejs/kit"

export abstract class BaseAppServer<In extends {key: string}, Out extends object> implements AppServer<In,Out> {
    data: In = {} as In
    key: string

    constructor(data: In = {} as In) {
        this.data = data
        this.key = this.data.key
    }

    async load(backend: UserLoaded): Promise<In> {
        Object.assign(this.data,backend.load({identity: backend.identity, app: this.key as keyof Apps}))
        return this.data
    }

    async save(backend: UserLoaded, data: In): Promise<void | ActionFailure<any> | {form: any}> {
        return backend.save({identity: backend.identity, app: this.key as keyof Apps}, data)
    }
}
