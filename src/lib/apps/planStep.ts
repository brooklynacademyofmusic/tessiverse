import { HttpRequest, type HttpResponseInit, InvocationContext } from "@azure/functions";
import { UserConfig } from "$lib/userconfig"
import { tq } from "$lib/tq"
import { error as httpError } from "@sveltejs/kit"
import type { Plan, Email, PlanScore, PlanStepConfig } from "./types.d.ts"

export async function planStep(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(context.functionName,`processed request for url`,request.url);
    let config = await new UserConfig(request.params.from).loadFromAzure()
    let body = [request.params.to,request.params.cc,request.params.bcc,request.params.subject,request.params.body].join(" ")
    let plans = await tq("get", "plans", "all", {workerconstituentid: config.constituentid}, config.auth) as Plan[]
    let plans_emails = await Promise.all(plans.map((p) => {
        return tq("get", "electronicaddresses", "all", {constituentids: p.constituent.id}, config.auth) as Promise<Email[]>
    }))

    let plans_filtered = [] as PlanScore[]

    for (let i=0; i<plans.length; i++) {
        let plan = plans[i] as PlanScore

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
        return httpError(404, "couldn't find a matching plan")
    }

    plans_filtered = plans_filtered.sort((a,b) => {
        return a.primary - b.primary || a.secondary - b.secondary || b.tertiary - a.tertiary
    })

    // Found a plan!
    let plan = plans_filtered[0]

    let planstepconfig = config.apps.planstep || {}

    // Make a plan step
    await tq("post","planstep","",
        {
            plan: {id: plan.id},
            type: {id: planstepconfig?.steptypeid },
            notes: request.params.body,
            stepdatetime: new Date(),
            completedondatetime: planstepconfig?.closestep ? new Date() : null,
            description: request.params.subject
        },
        config.auth)

    return {}
};

export function findFirstString(needle: string[], haystack: string): number {
    needle = needle.filter((e) => e && e.length > 3)
    if (needle.length == 0)
        return -1

    return needle
        .map((q) => {
            // escape special characters
            q = q.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
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

