import { tq } from '$lib/tq'
import { error, fail, type Action } from '@sveltejs/kit'
import { type App } from '$lib/config'
import { User } from '$lib/user'
import Tessitura from '$lib/apps/tessitura/tessitura.svelte' 
import TessituraCard from '$lib/apps/tessitura/tessituraCard.svelte' 
import * as errors from '$lib/errors'
import { superValidate, message } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { tessituraSchema } from './tessitura.schema'
import { tessi_api_url } from '$lib/config'

export class TessituraAppData {
    firstname?: string
    lastname?: string
    userid?: string
    inactive?: boolean
    locked?: boolean 
    constituentid?: number
    group?: string 
    tessiApiUrl?: string = tessi_api_url
    location?: string
}

export class TessituraApp implements App<typeof TessituraCard, typeof Tessitura, TessituraAppData> {
    title = "Tessitura Integration"
    card = TessituraCard
    form = Tessitura
    data = new TessituraAppData()
  
    get auth(): string {
        return this.data.tessiApiUrl+"|"+this.data.userid+"|"+this.data.group+"|"+this.data.location
    }
  
    async tessiLoad(): Promise<TessituraApp> {
      return tq("get","users","",{"username":this.data.userid},this.auth).
          then((tessi) => {
              Object.assign(this.data, tessi)
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

    async load(data: TessituraAppData): Promise<TessituraAppData> {
        this.data = data
        await this.tessiValidate()
        return this.data
    }

    save: Action = async ({ request, locals }) => {
        if (!locals.user.userId) {
            error(401, errors.AUTH)
        }
    
        const user = new User(locals.user.userDetails)
        const tessitura = new TessituraApp() 
    
        const form = await superValidate(request, zod(tessituraSchema));
        if (!form.valid) {
            return fail(400, { form });
        }
    
        await tessitura.tessiValidate()
        await tessitura.tessiLoad()
    
        user.apps.tessitura.data = tessitura.data
        await user.save()
    
        return message(form, 'Form posted successfully!');
    }
}  

