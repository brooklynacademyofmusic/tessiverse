import { tq } from '$lib/tq'
import { error } from '@sveltejs/kit'
import * as errors from '$lib/errors'
import { superValidate, message, fail, setError } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { tessituraSchema } from './tessitura.schema'
import { servers } from '$lib/config'
import { TessituraApp } from './tessitura'
import type { UserLoaded } from '$lib/azure'
import { BaseAppServer } from '$lib/apps.server'

export class TessituraAppServer extends BaseAppServer {
    data: TessituraApp
    valid = false

    constructor(data = new TessituraApp()) {
        super()
        this.data = data
    }
    
    get auth(): string {
        return [
            this.data.tessiApiUrl || "", 
            this.data.userid || "",
            this.data.group || "",
            this.data.location || ""].join("|")
    }

    async tessiLoad(): Promise<Partial<TessituraApp>> {
      return tq("get","users","",{"username":this.data.userid},this.auth).
          then((tessi) => {
              Object.assign(this.data, tessi)
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

    async load(backend: UserLoaded): Promise<this> {
        await super.load(backend)
        this.data.servers = servers
        this.data.groups = servers
        if(this.data.userid && this.data.group && this.data.tessiApiUrl && this.data.location) {
            this.valid = await this.tessiValidate()
        }
        return this
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

        let valid = await this.tessiValidate()
        if (!valid) {
            return setError(form, "password", "Invalid login")
        }
        
        await this.tessiLoad()
        await super.save(backend, this)
        return message(form, "Login updated successfully")
    }
} 

