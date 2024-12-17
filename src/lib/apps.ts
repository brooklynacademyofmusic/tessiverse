import { SvelteComponent, type Component } from 'svelte'
import type { LegacyComponentType } from 'svelte/legacy'

export interface App<Card extends object, Form extends object> {
    // human readable name, will appear as the title of the card
    title: string 
    // a dashboard coard, which will be rendered inside of a <Card></Card>
    card: Component<Card>
    // a form element triggered by the configuration button on the card
    form: Component<Form>
    // machine readable name, must be the same as the key in `apps`
    key: string
}

export class BaseApp implements App<any,any> {
    key = "base"
    title = "Base"
    card = {} as Component<any>
    form = {} as Component<any>
}

export type Serializable<A extends App<any,any>> = Omit<A, "card" | "form" | "title" | "key">