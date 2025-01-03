import { type Component } from 'svelte'

export interface App<Key extends string, Data extends object, Load extends object> {
    // human readable name, will appear as the title of the card
    title: string 
    // a dashboard coard, which will be rendered inside of a <Card></Card>
    card: Component<{data: Promise<Load>}> 
    // a form element triggered by the configuration button on the card
    form: Component<{data: Load}>
    // machine readable name, must be the same as the key in `apps`
    key: Key
    // serializable data
    data: Data
}

export type AppLoad<A extends App<string,any,any>> = A["form"] extends Component<infer Props> ? Props["data"] : never

export abstract class BaseApp<Key extends string, Data extends object, Load extends object> implements App<Key, Data, Load> {
    key = "base" as Key
    title = "Base"
    card = {} as Component<{data: Promise<Load>}> 
    form = {} as Component<{data: Load}>
    data: Data = {} as any
}