import { BaseApp, type App } from '$lib/apps'
import Tessitura from '$lib/apps/tessitura/tessitura.svelte' 
import TessituraCard from '$lib/apps/tessitura/tessituraCard.svelte' 
import * as config from '$lib/const'
import type { Infer, SuperValidated } from 'sveltekit-superforms'
import type { tessituraSchema } from './tessitura.schema'

export class TessituraApp extends BaseApp<"tessitura", TessituraAppData, TessituraAppLoad>
                           implements App<"tessitura", TessituraAppData, TessituraAppLoad> {
    title = "Tessitura Integration"
    key: "tessitura" = "tessitura"
    card = TessituraCard
    form = Tessitura
    data = new TessituraAppData()
} 

export class TessituraAppData {
    tessiApiUrl: string = ""
    userid: string = ""
    group: string = ""
    emailaddress?: string = ""
    firstname?: string
    lastname?: string
    inactive?: boolean
    locked?: boolean 
    constituentid?: number
    location?: string
}

export type TessituraAppLoad = TessituraAppData & {valid: boolean} & {form: SuperValidated<Infer<typeof tessituraSchema>>}
export type TessituraAppSave = Infer<typeof tessituraSchema>