import { tq } from '$lib/tq'
import { error, type ActionFailure } from '@sveltejs/kit'
import { type App, AppBase } from '$lib/apps'
import Tessitura from '$lib/apps/tessitura/tessitura.svelte' 
import TessituraCard from '$lib/apps/tessitura/tessituraCard.svelte' 
import * as errors from '$lib/errors'
import { superValidate, message, fail, setError } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { tessituraSchema } from './tessitura.schema'
import { servers } from '$lib/config'
import type { Backend, BackendKey } from '$lib/azure'
import type { UserLoaded } from '$lib/user'
import type { Component } from 'svelte'

export class TessituraApp extends AppBase {
    title = "Tessitura Integration"
    key = "tessitura"
    card = TessituraCard
    form = Tessitura
    firstname?: string
    lastname?: string
    userid?: string
    inactive?: boolean
    locked?: boolean 
    constituentid?: number
    group?: string 
    tessiApiUrl: string = servers[0]["value"]
    location?: string
    servers?: any 
    groups?: any
    valid = false

    get auth(): string {
        return this.tessiApiUrl+"|"+this.userid+"|"+this.group+"|"+this.location
    }
  
    async tessiLoad(): Promise<typeof this> {
      return tq("get","users","",{"username":this.userid},this.auth).
          then((tessi) => {
              Object.assign(this, tessi)
              return this
          }).catch(() => 
              error(500, errors.TQ)
          )
    }

    async tessiPassword(password:string): Promise<void> {
        return tq("auth","add","",password)
        .catch(() => 
            error(500, errors.TQ))
    }

    async tessiValidate(): Promise<boolean> {
        return tq("auth","validate","",{},this.auth).
            then(() => true)
            .catch(() => false)
    }

    async tessiGroups(): Promise<string[]> {
        return tq("get","groups","",{},this.auth).
            then((tessi) => tessi)
            .catch(() => 
                error(500, errors.TQ)
            )
    }

    async tessiLocations(): Promise<string[]> {
        return tq("get","machineLocations","",{},this.auth).
            then((tessi) => tessi)
            .catch(() => 
                error(500, errors.TQ)
            )
    }

    async load(backend: UserLoaded): Promise<Partial<TessituraApp>> {
        await super.load(backend)
        this.servers = servers
        this.groups = servers
        if(this.userid && this.group && this.tessiApiUrl && this.location) {
            this.valid = await this.tessiValidate()
        }
        return JSON.parse(JSON.stringify(this))
    }

    async save(backend: UserLoaded, data: any) {
        const tessitura = new TessituraApp() 
    
        const form = await superValidate(data, zod(tessituraSchema));
        if (!form.valid) {
            return fail(400, {form})
        }
        
        this.tessiPassword(form.data.password)

        tessitura.tessiApiUrl = form.data.tessiApiUrl
        tessitura.userid = form.data.userid
        tessitura.group = form.data.group
        tessitura.location = (await this.tessiLocations())[0]

        let valid = await tessitura.tessiValidate()
        if (!valid) {
            return setError(form, "password", "Invalid login")
        }
        
        await tessitura.tessiLoad()
        await super.save(backend, this)
        return message(form, "Login updated successfully")
    }
} 

