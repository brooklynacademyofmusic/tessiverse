import TessituraCard from '$lib/apps/tessitura/tessituraCard.svelte'
import Tessitura from '$lib/apps/tessitura/tessitura.svelte'

export var servers = [
    {value: "https://tessi-db-prd1", label: "TESSI-DB-PRD1/Impresario"},
    {value: "https://tessi-test-b", label: "TESSI-TEST-B/Impresario"}
]

export var apps = [
    {name: "Tessitura Integration", card: TessituraCard, config: Tessitura},
    {name: "Plan Steps by Email", card: TessituraCard, config: Tessitura}
]