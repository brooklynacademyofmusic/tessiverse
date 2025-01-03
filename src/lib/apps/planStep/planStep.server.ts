import { UserLoaded } from "$lib/azure"
import { tq } from "$lib/tq"
import { error } from "@sveltejs/kit"
import type { Email, PlanScore, PlanWorker } from "./types"
import { type AppServer } from "$lib/apps.server"
import { BaseAppServer } from '$lib/baseapp.server'
import { PlanStepApp, PlanStepAppData, type PlanStepAppLoad, type PlanStepAppSave } from "./planStep"
import { Azure } from "$lib/azure"
import { TessituraAppServer } from "../tessitura/tessitura.server"
import { NodeHtmlMarkdown } from "node-html-markdown"
import { planStepSchema } from "./planStep.schema"
import { zod } from "sveltekit-superforms/adapters"
import { fail, setMessage, superValidate, type SuperValidated } from "sveltekit-superforms"

export class PlanStepAppServer extends BaseAppServer<PlanStepApp,PlanStepAppSave>
                                implements AppServer<PlanStepApp,PlanStepAppSave> {
    
    key: "planStep" = "planStep"
    data = new PlanStepAppData()

    async load(backend: UserLoaded): Promise<PlanStepAppLoad> {
        await super.load(backend)
        let form: SuperValidated<any>
        form = await superValidate(this.data, zod(planStepSchema))
        return {...this.data, form: form}
    } 
    async save(data: PlanStepAppSave, backend: UserLoaded) {
        const form = await superValidate(data, zod(planStepSchema))
        if (!form.valid) {
            return fail(400, {form})
        }
        await super.save(form.data, backend)
        setMessage(form, 'Login updated successfully!')
        return { form , success: true }
    } 
}

export type PlanStepEmail = {
    from: string
    to: string
    cc?: string
    bcc?: string
    subject: string
    body: string
}

export async function planStep(email: PlanStepEmail): Promise<null> {
    let emailId: string = `${email.from} => ${email.to} (${email.subject})`
    console.log(`Generating plan step for email ${emailId}`)

    let userData = await new Azure().load({identity: email.from})
        .catch(() => {throw(error(400, `User configuration not found for ${email.from}`))})
    
    let tessiData = userData.apps.tessitura
    let tessiApp = new TessituraAppServer(tessiData)
    if ( !await tessiApp.tessiValidate() ) {
        throw(error(400, `Invalid Tessitura login for ${email.from}`))
    }

    let workers: PlanWorker[] = await tq("get","workers",
        {variant: "all", login: tessiApp.auth})
    if (!workers.find((w) => w.constituentid == tessiData.constituentid)) {
        throw(error(404, `User ${email.from} does not have any plans!`))
    }

    let planStepData = userData.apps.planStep
    let plans: PlanScore[] = await tq("get", "plans", 
        {variant: "all",
            query: {workerid: (tessiData.constituentid || 1).toString()}, 
            login: tessiApp.auth}).catch(() => {
                throw(error(404, `User ${email.from} does not have any plans!`))
        })

    email.body = NodeHtmlMarkdown.translate(email.body)
    let body: string = [email.to,email.cc || "",email.bcc || "",email.subject,email.body].join(" ")
    let plans_emails: Email[][] = await Promise.all(plans.map((p) => {
        return tq("get", "electronicaddresses", 
            {variant: "all", 
                query: {constituentids: p.constituent.id.toString()}, 
                login:tessiApp.auth})
    }))

    let plans_filtered: PlanScore[] = []

    for (let i=0; i<plans.length; i++) {
        let plan = plans[i]

        let constituentid = plan.constituent.id.toString()
        let emails = plans_emails[i]
        
        let primary = emails.map((e) => e.address).concat(
            constituentid, plan.constituent.displayname.split(" "))
        let secondary = plan.campaign.description.split(/\W/).concat(
            plan.contributiondesignation.description.split(/\W/))

        plan.primary = findFirstString(primary, body)
        plan.secondary = findFirstString(secondary, body)
        plan.tertiary = Date.parse(plan.laststepdate)

        if (plan.secondary < 0) {
            plan.secondary = Infinity
        }

        if (plan.primary > -1) {
            plans_filtered = plans_filtered.concat(plan)
        }
    }
    
    if (plans_filtered.length == 0) {
        throw(error(404, `Couldn't find a matching plan for ${emailId}`))
    }

    plans_filtered = plans_filtered.sort((a,b) => {
        return a.primary - b.primary || a.secondary - b.secondary || b.tertiary - a.tertiary
    })

    // Found a plan!
    let plan = plans_filtered[0]

    // Make a plan step
    await tq("post","steps",
        {query:{
            plan: {id: plan.id},
            type: {id: planStepData.stepType },
            notes: email.body,
            stepdatetime: new Date(),
            completedondatetime: planStepData.closeStep ? new Date() : null,
            description: email.subject
        },
        login:tessiApp.auth})


    // Save plan step to history array
    let planStepServer = new PlanStepAppServer()
    let backend = new UserLoaded(userData)
    await planStepServer.load(backend)
    planStepServer.data.history.push(
        {
            subject: email.subject,
            planDesc: `${plan.constituent.displayname} ${plan.campaign} ${plan.contributiondesignation}`,
            date: new Date()
        }
    )
    await backend.save({identity: backend.identity, app: planStepServer.key},planStepServer.data)
    return null
};

export function findFirstString(needle: Array<string | null | void>, haystack: string): number {
    needle = needle.filter((e) => e && e.length > 3)
    if (needle.length == 0)
        return -1

    return needle
        .map((q) => {
            // escape special characters
            q = (q || "").replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            return haystack.search(new RegExp(`\\b${q}\\b`,"i"))
        })
        .reduce((a,b) => {
            if (a == -1) {
                return b
            } else if (b == -1) {
                return a
            } else {
                return Math.min(a,b)
            }
    }) 
}

