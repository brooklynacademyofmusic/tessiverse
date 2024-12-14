import { type Component } from 'svelte'

let PlanStep: Component<any> = {} as Component<any>

export class PlanStepApp {
    title = "Email to plan step"
    key = "planStep"
    card = PlanStep
    form = PlanStep
    stepType = 0
    closeStep = true
}