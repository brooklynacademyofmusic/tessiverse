import { AppBase, type AppComponents } from "$lib/apps"
import { type Component } from 'svelte'

let PlanStep: Component<any> = {} as Component<any>

export class PlanStepAppComponents implements AppComponents {
    title = "Email to plan step"
    key = "planStep"
    card = PlanStep
    form = PlanStep
}

export class PlanStepAppData {
    stepType = 0
    closeStep = true
}