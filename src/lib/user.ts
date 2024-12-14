import * as config from "$lib/config"
import type { Backend, BackendKey } from "$lib/azure"

export class User {
    readonly identity: string
    firstname: string = ""
    apps = config.Apps

    constructor(identity: string) {
        this.identity = identity
    }
}


