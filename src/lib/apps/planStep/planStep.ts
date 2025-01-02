import type { App, Serializable } from '$lib/apps'
import { type Component } from 'svelte'
import PlanStepCard from './planStepCard.svelte'
import type { Infer, SuperValidated } from 'sveltekit-superforms'
import type { planStepSchema } from './planStep.schema'
import PlanStep from './planStep.svelte'

export class PlanStepApp implements App<"planStep", PlanStepAppLoad>{
    title = "Email to plan step"
    key: "planStep" = "planStep"
    card = PlanStepCard
    form = PlanStep
    history: PlanSteps = []
    stepType = 0
    closeStep = true
}

export type PlanStepAppLoad = Serializable<PlanStepApp> & {form: SuperValidated<Infer<typeof planStepSchema>>}
export type PlanStepAppSave = PlanStepAppLoad

export type PlanSteps = Array<{
    planDesc: string,
    subject: string,
    date: Date
}>