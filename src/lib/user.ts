import { Azure, type Backend, type BackendKey } from '$lib/azure'
import * as config from "$lib/config"
import type { App, AppNames } from '$lib/apps'

export class User implements Backend<User> {
    readonly identity: string
    firstname?: string
    apps = config.apps

    constructor(identity: string) {
        this.identity = identity
    }

    async load(key: {identity: string} = {identity: this.identity}): Promise<UserLoaded> {
        let backend = new Azure()
        return backend.load(key) 
    }

    async save(key: {identity: string} = {identity: this.identity}, data: User): Promise<void> {
        let backend = new Azure()
        this.firstname = data.apps.tessitura.firstname || data.firstname
        backend.save(key, this as User)
    }
}

class UserLoaded extends User implements Backend<User | App> {
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