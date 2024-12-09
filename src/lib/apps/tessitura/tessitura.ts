import { tq } from '$lib/tq'
import { error, fail, type Action } from '@sveltejs/kit'
import { type App, AppBase } from '$lib/apps'
import Tessitura from '$lib/apps/tessitura/tessitura.svelte' 
import TessituraCard from '$lib/apps/tessitura/tessituraCard.svelte' 
import * as errors from '$lib/errors'
import { superValidate, message } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { tessituraSchema } from './tessitura.schema'
import { tessi_api_url } from '$lib/config'
import type { Backend, BackendKey } from '$lib/azure'

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
            .catch(() => 
                error(401, errors.TESSITURA)
            )
    }

    async tessiGroups(): Promise<any> {
        return tq("get","groups","",{},this.auth).
            then((tessi) => tessi)
            .catch(() => 
                error(500, errors.TQ)
            )
    }

    async load(backend: Backend<TessituraApp>, key: BackendKey<TessituraApp>): Promise<this> {
        Object.assign(this,await backend.load(key))
        await this.tessiValidate()
        return this 
    }

    async save(backend: Backend<TessituraApp>, key: BackendKey<TessituraApp>, data: TessituraApp): Promise<void> {
        const tessitura = new TessituraApp(this.key) 
    
        const form = await superValidate(data, zod(tessituraSchema));
        if (!form.valid) {
            throw(form)
        }
    
        Object.assign(tessitura, data)
        await tessitura.tessiValidate()
        await tessitura.tessiLoad()
       
        await backend.save(key, this)
    }
} 

