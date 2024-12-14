import { type Component } from 'svelte'

export interface App {
    // human readable name, will appear as the title of the card
    title: string 
    // a dashboard coard, which will be rendered inside of a <Card></Card>
    card: Component<any>
    // a form element triggered by the configuration button on the card
    form: Component<any>
    // machine readable name, must be the same as the key in `apps`
    key: string
}

const ComponentStub: Component<any> = {} as Component<any>
export class BaseApp implements App {
    key = "base"
    title = "Base"
    card = ComponentStub
    form = ComponentStub
}

export type Serializable<A extends App> = Omit<A, "card" | "form">