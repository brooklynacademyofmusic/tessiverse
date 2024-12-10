import { tq } from '$lib/tq'
import { error, type ActionFailure } from '@sveltejs/kit'
import { type App } from '$lib/apps'
import Tessitura from '$lib/apps/tessitura/tessitura.svelte' 
import TessituraCard from '$lib/apps/tessitura/tessituraCard.svelte' 
import * as errors from '$lib/errors'
import { superValidate, message, fail, setError } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { tessituraSchema } from './tessitura.schema'
import { tessi_api_url } from '$lib/config'
import type { Backend, BackendKey } from '$lib/azure'

export class TessituraApp implements App {
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
    tessiApiUrl: string = tessi_api_url
    location?: string

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

    async tessiValidate(): Promise<boolean> {
        return tq("auth","validate","",{},this.auth).
            then(() => true)
            .catch(() => false)
    }

    async tessiGroups(): Promise<any> {
        return tq("get","groups","",{},this.auth).
            then((tessi) => tessi)
            .catch(() => 
                error(500, errors.TQ)
            )
    }

    async load(backend: Backend<App>, key: {identity: string, app: "tessitura"}): Promise<TessituraApp> {
        await backend.load(key, this)
        let valid = await this.tessiValidate()
        if (!valid) 
            throw(errors.TESSITURA)
        return this 
    }

    async save(backend: Backend<App>, key: BackendKey<App>, data: Partial<TessituraApp>) {
        const tessitura = new TessituraApp() 
    
        const form = await superValidate(data, zod(tessituraSchema));
        if (!form.valid) {
            return fail(400, {form})
        }
    
        Object.assign(tessitura, data)
        let valid = await tessitura.tessiValidate()
        if (!valid) {
            return setError(form, "password", "Invalid login")
        }
        await tessitura.tessiLoad()
        await backend.save(key, this)
        return message(form, "Login updated successfully")
    }
} 

