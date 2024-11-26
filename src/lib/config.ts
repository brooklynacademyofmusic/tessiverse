import TessituraCard from '$lib/components/tessituraCard.svelte'
import Tessitura from '$lib/components/tessitura.svelte'

export var servers = [
    {value: "https://tessi-db-prd1", label: "TESSI-DB-PRD1/Impresario"},
    {value: "https://tessi-test-b", label: "TESSI-TEST-B/Impresario"}
]

export var apps = [
    {name: "Tessitura integration", card: TessituraCard, config: Tessitura}
]