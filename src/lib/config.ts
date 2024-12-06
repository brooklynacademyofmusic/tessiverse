import type { Component } from 'svelte'
import type { Action } from '@sveltejs/kit'
import type { User } from '$lib/user'
import { TessituraApp } from './apps/tessitura/tessitura'
import { env } from '$env/dynamic/private'
import type { string } from 'zod'

export const key_vault_url = env.AZURE_KEY_VAULT_URL || "";
export const admin_auth = env.TQ_ADMIN_LOGIN || "";
export const tessi_api_url = env.TESSI_API_URL || "";
export const tq_login = env.TQ_LOGIN || "";

// interface for establishing the contract between the main route and the individual cards/forms.
export interface App<Card extends Component<any>, Form extends Component<any>, AppData> {
    // human readable name, will appear as the title of the card
    title: string 
    // a dashboard coard, which will be rendered inside of a <Card></Card>
    card: Card
    // a form element triggered by the configuration button on the card
    form: Form
    // data structure of the app
    data: AppData 
    // function to load data from the backend, with optional preloaded data
    load(preload?: Partial<AppData>): Promise<AppData>
    // function to save data to the backend
    save: Action
}

const ComponentStub: Component = {} as Component

class AppStub implements App<typeof ComponentStub,typeof ComponentStub, {}> {
    title = ""
    card = ComponentStub
    form = ComponentStub
    data = {}
    load = async () => this
    save = async () => null
}

export const servers = [
    {value: "https://tessi-db-prd1", label: "TESSI-DB-PRD1/Impresario"},
    {value: "https://tessi-test-b", label: "TESSI-TEST-B/Impresario"}
]

export const apps = {
    tessitura: new TessituraApp(),
    planSteps: new AppStub(),
} satisfies Record<string, any>