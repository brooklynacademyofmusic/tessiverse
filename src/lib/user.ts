import * as config from "$lib/config"
import type { Serializable } from "./apps"

export class User {
    readonly identity: string
    firstname: string = ""
    apps = new config.Apps()

    constructor(identity: string) {
        this.identity = identity
    }
}

export interface UserData {
    readonly identity: string
    firstname: string 
    apps: { [K in keyof config.Apps]: Serializable<config.Apps[K]> }
}


