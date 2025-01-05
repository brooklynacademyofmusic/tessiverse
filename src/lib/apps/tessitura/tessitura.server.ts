import { tq } from '$lib/tq'
import { error } from '@sveltejs/kit'
import * as errors from '$lib/errors'
import { superValidate, fail, setError, type SuperValidated, setMessage } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { tessituraSchema } from './tessitura.schema'
import { TessituraApp, TessituraAppData, type TessituraAppLoad, type TessituraAppSave } from './tessitura'
import type { UserLoaded } from '$lib/azure'
import { type AppServer } from '$lib/apps.server'
import { BaseAppServer } from '$lib/baseapp.server'
import { env } from '$env/dynamic/private'
import { servers } from '$lib/const'

export class TessituraAppServer extends BaseAppServer<TessituraApp, TessituraAppSave> implements 
                                            AppServer<TessituraApp, TessituraAppSave> {

    key: "tessitura" = "tessitura"

    get auth(): string {
        return [
            this.data.tessiApiUrl, 
            this.data.userid,
            this.data.group,
            this.data.location || ""].join("|")
    }

    static tessiAdminAuth = servers[0].value + "|" + env.TQ_ADMIN_LOGIN

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

    async tessiLoad(): Promise<Partial<TessituraApp>> {
        return tq("get","users",{query: {"username":this.data.userid},login: TessituraAppServer.tessiAdminAuth}).
            then((tessi) => {
                Object.assign(this.data, tessi)
                return this
            }).
            then((tessi) => 
                tq("get","constituents",{variant: "search", query: {type:"fluent", q:tessi.data.emailaddress || ""}, login: TessituraAppServer.tessiAdminAuth})
            ).
            then((tessi: {constituentsummaries: {id: number}[]}) => {
                this.data.constituentid = tessi.constituentsummaries[0].id
                return this
            }).
            catch(() => 
                error(500, errors.TQ)
            )
      }  

    static async tessiGroups(login: string = this.tessiAdminAuth): Promise<{value: string, label: string}[]> {
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
        await super.load(backend)
        let valid = false
        let form: SuperValidated<any>
        if(this.data.userid && this.data.group && this.data.tessiApiUrl && this.data.location) {
            valid = await this.tessiValidate()
            form = await superValidate(this.data, zod(tessituraSchema), {errors: false})
        } else {
            form = await superValidate(zod(tessituraSchema))
        }
        return {...this.data, valid: valid, password: "", form: form}
    }

    async save(data: TessituraAppSave, backend: UserLoaded) {
        const form = await superValidate(data, zod(tessituraSchema))
        if (!form.valid) {
            return fail(400, {form})
        }

        let tessi = new TessituraAppServer(new TessituraAppData())
        tessi.data.tessiApiUrl = form.data.tessiApiUrl
        tessi.data.userid = form.data.userid
        tessi.data.group = form.data.group
        tessi.data.location = form.data.userid+"-14"

        await tessi.tessiPassword(form.data.password)
        let valid = await tessi.tessiValidate()
        if (!valid) {
            return setError(form, "password", "Invalid login")
        }

        await tessi.tessiLoad()
        await super.save(tessi.data, backend)
        setMessage(form, 'Login updated successfully!')
        return { form , success: true }
    }
} 

