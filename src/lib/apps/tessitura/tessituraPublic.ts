import Tessitura from '$lib/apps/tessitura/tessitura.svelte' 
import TessituraCard from '$lib/apps/tessitura/tessituraCard.svelte' 

export class TessituraAppComponents {
    title = "Tessitura Integration"
    key = "tessitura"
    card = TessituraCard
    form = Tessitura
}

export class TessituraAppData {
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