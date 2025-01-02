import { type Component } from 'svelte'
import { Card } from './components/ui/card'

export interface App<Key extends string, Data extends object> {
    // human readable name, will appear as the title of the card
    title: string 
    // a dashboard coard, which will be rendered inside of a <Card></Card>
    card: Component<{data: Promise<Data>}> 
    // a form element triggered by the configuration button on the card
    form: Component<{data: Data}>
    // machine readable name, must be the same as the key in `apps`
    key: Key
}

export class BaseApp implements App<string, any> {
    key = "base"
    title = "Base"
    card = {} as Component<any>
    form = {} as Component<any>
}

export type Serializable<A extends App<string, any>> = Omit<A, "card" | "form" | "title" | "key">
export function serialize<A extends App<string, any>>(data: A): Serializable<A> {
    let {card, form, title, key, ...serializable} = data
    return serializable
}