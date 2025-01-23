import * as config from "$lib/config"

export class User {
    readonly identity: string
    apps = config.AppsData

    constructor(data: Partial<UserData> & {identity: string}) {
        Object.assign(this,data)
        this.identity = data.identity
    }
}

export interface UserData {
    readonly identity: string
    apps: { [K in keyof config.Apps]: config.Apps[K]["data"] }
}


