import * as config from "$lib/config"

export class User {
    readonly identity: string
    firstname: string = ""
    apps = new config.Apps()

    constructor(data: Partial<UserData> & {identity: string}) {
        Object.assign(this,data)
        this.identity = data.identity
    }
}

export interface UserData {
    readonly identity: string
    firstname: string 
    apps: { [K in keyof config.Apps]: {data: config.Apps[K]["data"] } }
}


