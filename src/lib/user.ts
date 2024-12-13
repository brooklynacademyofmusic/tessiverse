import { Azure, type Backend, type BackendKey } from '$lib/azure'
import * as config from "$lib/config"

export class User implements Backend {
    readonly identity: string
    firstname: string = ""
    apps = new config.Apps()

    constructor(identity: string) {
        this.identity = identity
    }

    async load(key: BackendKey = {identity: this.identity}, target: any = this): Promise<UserLoaded> {
        return new Azure().load(key) as Promise<UserLoaded> 
    }

    async save(key: {identity: string} = {identity: this.identity}, data: Partial<User> = this): Promise<void> {
        Object.assign(this,data)
        this.firstname = this.apps.tessitura.firstname || this.firstname
        return new Azure().save(key, this)
    }
}
//Typescript magic!
function hasProperty<O extends object>(o: O, k: PropertyKey): k is keyof O {
    return k in o
}
export class UserLoaded extends User implements Backend {
    async load(key: BackendKey): Promise<any> {
        if (key.app && hasProperty(this.apps, key.app)) {
            if (this.identity != key.identity) {
                throw("can't load data for "+key.identity+" from user "+this.identity)
            } else {
                return this.apps[key.app]
            }
        } else {
            return this
        } 
    }

    async save(key: BackendKey, data: any) {
        if (key.app && hasProperty(this.apps, key.app)) {
            if (this.identity != key.identity) {
                throw("can't save data for "+key.identity+" with user "+this.identity)
            } else {
                Object.assign(this.apps[key.app],data)
                super.save({identity: this.identity}, this)
            }
        } else {
            super.save(key, this)
        }
    }
}