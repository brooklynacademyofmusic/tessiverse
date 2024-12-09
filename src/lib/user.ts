import { Azure, type Backend, type BackendKey } from '$lib/azure'
import * as config from "$lib/config"
import type { App, AppNames } from '$lib/apps'

export class User implements Backend<User> {
    readonly identity: string
    firstname: string = ""
    apps = config.apps

    constructor(identity: string) {
        this.identity = identity
    }

    async load(key: {identity: string} = {identity: this.identity}): Promise<User> {
        return new Azure().load(key)
    }

    async save(key: {identity: string} = {identity: this.identity}, data: Partial<User> = this): Promise<void> {
        Object.assign(this,data)
        this.firstname = this.apps.tessitura.firstname || this.firstname
        return new Azure().save(key, this as User)
    }
}

export class UserLoadedBackend implements Backend<User | App> {
    async load<T extends User | App>(key: BackendKey<T>): Promise<T> {
        if ("app" in key) {
            if (this.identity != key.identity) {
                throw("can't load data for "+key.identity+" from user "+this.identity)
            } else {
                return this.apps[key.app] as T
            }
        } else {
            return this as User as T
        } 
    }

    async save<T extends User | App>(key: BackendKey<T>, data: T) {
        if ("app" in key) {
            if (this.identity != key.identity) {
                throw("can't save data for "+key.identity+" with user "+this.identity)
            } else {
                ;(this.apps[key.app] as T) = data
                super.save({identity: this.identity}, this)
            }
        } else {
            super.save(key, this)
        }
    }
}