import type { App, Serializable } from '$lib/apps'
import Tessitura from '$lib/apps/tessitura/tessitura.svelte' 
import TessituraCard from '$lib/apps/tessitura/tessituraCard.svelte' 
import * as config from '$lib/const'

export class TessituraApp implements App {
    title = "Tessitura Integration"
    key = "tessitura"
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

export type TessituraAppLoaded = Promise<Serializable<TessituraApp> & {valid: boolean, groups: string[]}>