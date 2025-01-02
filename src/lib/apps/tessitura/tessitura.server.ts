import { tq } from '$lib/tq'
import { error } from '@sveltejs/kit'
import * as errors from '$lib/errors'
import { superValidate, message, fail, setError, type SuperValidated } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { tessituraSchema } from './tessitura.schema'
import { TessituraApp, type TessituraAppLoad, type TessituraAppSave } from './tessitura'
import type { UserLoaded } from '$lib/azure'
import { type AppServer } from '$lib/apps.server'
import { BaseAppServer } from '$lib/baseapp.server'
import { env } from '$env/dynamic/private'
import { servers } from '$lib/const'
import { serialize, type Serializable } from '$lib/apps'

export class TessituraAppServer extends BaseAppServer<"tessitura", Serializable<TessituraApp>, TessituraAppLoad, TessituraAppSave> implements 
                AppServer<"tessitura", Serializable<TessituraApp>, TessituraAppLoad, TessituraAppSave> {

    key: "tessitura" = "tessitura"

    get auth(): string {
        return [
            this.data.tessiApiUrl, 
            this.data.userid,
            this.data.group,
            this.data.location || ""].join("|")
    }

    async tessiLoad(): Promise<Partial<TessituraApp>> {
      return tq("get","users",{query: {"username":this.data.userid},login: this.auth}).
          then((tessi) => {
              Object.assign(this.data, tessi)
              return this
          }).catch(() => 
              error(500, errors.TQ)
          )
    }

    async tessiPassword(password:string): Promise<void> {
        return tq("auth","add",{query: password,login: this.auth})
        .catch(() => 
            error(500, errors.TQ))
    }

    async tessiValidate(): Promise<boolean> {
        return tq("auth","validate",{login: this.auth}).
            then(() => true)
            .catch(() => false)
    }

    static async tessiGroups(login: string = servers[1].value + "|" + env.TQ_ADMIN_LOGIN): Promise<{value: string, label: string}[]> {
        return tq("get","usergroups",{variant: "summaries", login: login}).
            then((tessi: {id: string, name: string}[]) => 
                tessi.map((t) => ({value: t.id.trim(), label: t.name.trim()}))
                     .sort((a,b) => a.label > b.label ? 1 : -1)
            )
            .catch(() => 
                error(500, errors.TQ)
            )
    }

    async load(backend: UserLoaded): Promise<TessituraAppLoad & {password: string}> {
        await super.load(backend).catch(() => {})
        let valid = false
        let form: SuperValidated<any>
        let out = serialize(new TessituraApp())
        Object.assign(out,this.data)
        if(this.data.userid && this.data.group && this.data.tessiApiUrl && this.data.location) {
            valid = await this.tessiValidate()
            form = await superValidate(this.data, zod(tessituraSchema))
        } else {
            form = await superValidate(zod(tessituraSchema))
        }
        return {...out, valid: valid, password: "", form: form}
    }

    async save(data: TessituraAppSave, backend: UserLoaded) {
        const form = await superValidate(data, zod(tessituraSchema))
        if (!form.valid) {
            return fail(400, {form})
        }
        
        let out = serialize(new TessituraApp())
        out.tessiApiUrl = form.data.tessiApiUrl
        out.userid = form.data.userid
        out.group = form.data.group
        out.location = form.data.userid+"-14"

        await this.tessiPassword(form.data.password)
        let valid = await this.tessiValidate()
        if (!valid) {
            return setError(form, "password", "Invalid login")
        }

        await this.tessiLoad()
        await backend.save({identity: backend.identity, app: this.key}, out)
        return message(form, "Login updated successfully")
    }
} 

