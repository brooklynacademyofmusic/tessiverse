import { UserLoaded } from "$lib/azure"
import { tq } from "$lib/tq"
import { error } from "@sveltejs/kit"
import type { Email, PlanScore } from "./types"
import { BaseAppServer } from "$lib/apps.server"
import { PlanStepApp } from "./planStep"
import { TessituraApp } from "../tessitura/tessitura"
import { Azure } from "$lib/azure"
import type { Serializable } from "$lib/apps"
import { TessituraAppServer } from "../tessitura/tessitura.server"

export class PlanStepAppServer extends BaseAppServer {
    data: PlanStepApp
    constructor(data = new PlanStepApp()) {
        super()
        this.data = data
    }
}

export type PlanStepEmail = {
    from: string
    to: string
    cc: string
    bcc: string
    subject: string
    body: string
}

export async function planStep(email: PlanStepEmail): Promise<null> {
    let emailId: string = `${email.from} => ${email.to} (${email.subject})`
    console.log(`Generating plan step for email ${emailId}`)

    let user: UserLoaded = await new Azure().load({identity: email.from})
    let tessiUser: TessituraApp = user.apps.tessitura
    let tessiApp = new TessituraAppServer(tessiUser)
    let planStepUser: Serializable<PlanStepApp> = user.apps.planStep
    let plans: PlanScore[] = await tq("get", "plans", "all", {workerconstituentid: tessiUser.constituentid || "1"}, tessiApp.auth)
    let body: string = [email.to,email.cc,email.bcc,email.subject,email.body].join(" ")
    let plans_emails: Email[][] = await Promise.all(plans.map((p) => {
        return tq("get", "electronicaddresses", "all", {constituentids: p.constituent.id}, tessiApp.auth)
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
        return error(404, `Couldn't find a matching plan for ${emailId}`)
    }

    plans_filtered = plans_filtered.sort((a,b) => {
        return a.primary - b.primary || a.secondary - b.secondary || b.tertiary - a.tertiary
    })

    // Found a plan!
    let plan = plans_filtered[0]

    // Make a plan step
    await tq("post","planstep","",
        {
            plan: {id: plan.id},
            type: {id: planStepUser.stepType },
            notes: email.body,
            stepdatetime: new Date(),
            completedondatetime: planStepUser.closeStep ? new Date() : null,
            description: email.subject
        },
        tessiApp.auth)

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

