import type { App } from '$lib/apps'
import PlanStepCard from './planStepCard.svelte'
import type { Infer, SuperValidated } from 'sveltekit-superforms'
import type { planStepSchema } from './planStep.schema'
import PlanStep from './planStep.svelte'

export class PlanStepApp implements App<"planStep", PlanStepAppData, PlanStepAppLoad>{
    title = "Email to plan step"
    key: "planStep" = "planStep"
    card = PlanStepCard
    form = PlanStep
    data = new PlanStepAppData()
}

export class PlanStepAppData {
    history: PlanSteps = []
    stepType = 4
    closeStep = true
}

export type PlanStepAppLoad = PlanStepAppData & {form: SuperValidated<Infer<typeof planStepSchema>>}
export type PlanStepAppSave = Omit<PlanStepAppData,"history">

export type PlanSteps = Array<{
    planDesc: string,
    subject: string,
    date: Date
}>