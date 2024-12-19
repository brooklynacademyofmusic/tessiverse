import type { App, Serializable } from '$lib/apps'
import Tessitura from '$lib/apps/tessitura/tessitura.svelte' 
import TessituraCard from '$lib/apps/tessitura/tessituraCard.svelte' 
import * as config from '$lib/const'
import type { Infer } from 'sveltekit-superforms'
import type { tessituraSchema } from './tessitura.schema'

export class TessituraApp implements App<"tessitura", TessituraAppLoad> {
    title = "Tessitura Integration"
    key: "tessitura" = "tessitura"
    card = TessituraCard
    form = Tessitura
    tessiApiUrl: config.ValidServerValues[any] = config.servers[0].value
    userid: string = ""
    group: string = ""
    firstname?: string
    lastname?: string
    inactive?: boolean
    locked?: boolean 
    constituentid?: number
    location?: string
}

export type TessituraAppLoad = Serializable<TessituraApp> & {valid: boolean}
export type TessituraAppSave = Infer<typeof tessituraSchema>