import type { App } from '$lib/apps'
import Tessitura from '$lib/apps/tessitura/tessitura.svelte' 
import TessituraCard from '$lib/apps/tessitura/tessituraCard.svelte' 

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
    tessiApiUrl?: string 
    location?: string
    servers?: any 
    groups?: any

    
}