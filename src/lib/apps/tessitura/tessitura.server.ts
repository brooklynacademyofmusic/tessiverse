import { tq } from '$lib/tq'
import { error } from '@sveltejs/kit'
import * as errors from '$lib/errors'
import { superValidate, message, fail, setError } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { tessituraSchema } from './tessitura.schema'
import { TessituraApp, type TessituraAppLoad, type TessituraAppSave } from './tessitura'
import type { UserLoaded } from '$lib/azure'
import { type AppServer } from '$lib/apps.server'
import { BaseAppServer } from '$lib/baseapp.server'
import { env } from '$env/dynamic/private'

export class TessituraAppServer extends 
                BaseAppServer<TessituraAppLoad,TessituraAppSave> implements 
                AppServer<TessituraAppLoad, TessituraAppSave> {
    
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
        return tq("auth","add","",password,this.auth)
        .catch(() => 
            error(500, errors.TQ))
    }

    async tessiValidate(): Promise<boolean> {
        return tq("auth","validate","",{},this.auth).
            then(() => true)
            .catch(() => false)
    }

    static async tessiGroups(): Promise<{value: string, label: string}[]> {
        return tq("get","usergroups","all",{},env.TQ_ADMIN_LOGIN).
            then((tessi: {Id: string, Name: string}[]) => 
                tessi.map((t) => ({value: t.Id.trim(), label: t.Name.trim()}))
            )
            .catch(() => 
                error(500, errors.TQ)
            )
    }

    async load(backend: UserLoaded): Promise<TessituraAppLoad & {password: string}> {
        await super.load(backend)
        let valid = false
        if(this.data.userid && this.data.group && this.data.tessiApiUrl && this.data.location) {
            valid = await this.tessiValidate()
        }
        return {...this.data, valid: valid, password: ""}
    }

    async save(backend: UserLoaded, data: any) {
        const form = await superValidate(data, zod(tessituraSchema));
        if (!form.valid) {
            return fail(400, {form})
        }
        
        this.tessiPassword(form.data.password)

        this.data.tessiApiUrl = form.data.tessiApiUrl
        this.data.userid = form.data.userid
        this.data.group = form.data.group
        this.data.location = (await TessituraAppServer.tessiLocations())[0]

        this.data.valid = await this.tessiValidate()
        if (!this.data.valid) {
            return setError(form, "password", "Invalid login")
        }

        await this.tessiLoad()
        await super.save(backend, this.data)
        return message(form, "Login updated successfully")
    }
} 

