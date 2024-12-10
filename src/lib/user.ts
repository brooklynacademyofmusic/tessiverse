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

    async load(key: BackendKey<User> = {identity: this.identity}, target: any = this): Promise<UserLoaded> {
        return new Azure().load(key,target) as Promise<UserLoaded> 
    }

    async save(key: {identity: string} = {identity: this.identity}, data: Partial<User> = this): Promise<void> {
        Object.assign(this,data)
        this.firstname = this.apps.tessitura.firstname || this.firstname
        return new Azure().save(key, this)
    }
}

export class UserLoaded extends User implements Backend<User | App> {
    async load<T extends User |  App>(key: BackendKey<T>, target: T): Promise<T> {
        if ("app" in key) {
            if (this.identity != key.identity) {
                throw("can't load data for "+key.identity+" from user "+this.identity)
            } else {
                return Object.assign(target,this.apps[key.app])
            }
        } else {
            return Object.assign(target,this)
        } 
    }

    async save<T extends User | App>(key: BackendKey<T>, data: Partial<T>) {
        if ("app" in key) {
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