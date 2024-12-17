import type { Serializable } from '$lib/apps'
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

export type PlanStepAppLoad = Serializable<PlanStepApp>
export type PlanStepAppSave = PlanStepAppLoad