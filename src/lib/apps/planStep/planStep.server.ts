import { UserLoaded } from "$lib/azure"
import { tq } from "$lib/tq"
import { error } from "@sveltejs/kit"
import * as ERRORS from '$lib/errors'
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

    async saveHistory(history: PlanStepAppData["history"][0], backend: UserLoaded) {
        await super.load(backend)
        this.data.history.push(history)
        return super.save(this.data, backend)
            .then(() => {})
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
    email.from = email.from.toLowerCase()
    email.body = NodeHtmlMarkdown.translate(email.body)
    let emailId: string = `${email.from} => ${email.subject} ${email.body.substring(0,63)}${email.body.length > 64 ? "..." : ""}`
    console.log(`Generating plan step for email ${emailId}`)
    let backend = new Azure()
    let userData = await backend.load({identity: email.from})
        .catch(() => {throw(error(400, `User configuration not found for ${JSON.stringify(email.from)}`))})
    
    let tessiData = userData.apps.tessitura
    let tessiApp = new TessituraAppServer(tessiData)
    if ( !await tessiApp.tessiValidate() ) {
        throw(error(400, `Invalid Tessitura login for ${email.from}`))
    }

    let workers = await tq("get","workers",
        {variant: "all", login: tessiApp.auth})
        .then((res: PlanWorker[]) => res)
        .catch(() => [{constituentid: 1}])
    if (!workers.find((w) => w.constituentid == tessiData.constituentid)) {
        throw(error(404, `User ${email.from} does not have any plans!`))
    }

    let planStepData = userData.apps.planStep
    let plans: PlanScore[] = await tq("get", "plans", 
        {variant: "all",
            query: {workerid: (tessiData.constituentid || 1).toString()}, 
            login: tessiApp.auth})
        .catch(() => {
                throw(error(404, `User ${email.from} does not have any plans!`))
        })

    let body: string = [email.to,email.cc || "",email.bcc || "",email.subject,email.body].join(" ")
    let plans_emails: Email[][] = await tq("get", "electronicaddresses", 
            {variant: "all", 
                query: plans.map((p) => {return {constituentids: p.constituent.id.toString()}}), 
                login: tessiApp.auth})
            .catch(() => {
                throw(error(500, ERRORS.TQ))
            })

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
            description: email.subject.length > 27 ? email.subject.substring(0,27)+"..." : email.subject 
        },
        login:tessiApp.auth})
        .catch(() => {
            throw(error(500, ERRORS.TQ))
        })

    // Refresh data, it's been a while
    let backend2 = new UserLoaded(await backend.load({identity: email.from}))
    await new PlanStepAppServer().saveHistory({
            subject: email.subject,
            planDesc: [plan.constituent.displayname,plan.campaign.description,plan.contributiondesignation.description].join(" "),
            date: new Date()
        },backend2)

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
