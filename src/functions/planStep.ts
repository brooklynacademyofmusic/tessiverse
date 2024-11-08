import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { readConfig, PlanStepConfig } from "./config"
import { tqGet, tqPost, httpError } from "./http"

export async function planStep(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(context.functionName,`processed request for url`,request.url);
    let config = await readConfig(request.params.from)
    let body = request.params.to + request.params.cc + request.params.bcc + request.params.subject + request.params.body
    let plans = await tqGet(["plans", "all"], {workerconstituentid: config.constituentid}, config.auth) as Plan[]
    let plans_filtered = [] as PlanScore[]
    let plans_emails = await Promise.all(plans.map((p) => {
        return tqGet(["electronicaddresses", "all"], {constituentids: p.constituent.id}, config.auth) as Promise<Email[]>
    }))

    for (let i=0; i<plans.length; i++) {
        let plan = plans[i] as PlanScore

        let constituentid = plan.constituent.id.toString()
        let emails = plans_emails[i]
        
        let primary = emails.map((e) => e.address).concat(
            constituentid, plan.constituent.displayname)
        let secondary = [plan.campaign.description].concat(
            plan.contributiondesignation.description)

        plan.primary = findFirstString(primary, body)
        plan.secondary = findFirstString(secondary, body)
        plan.tertiary = Date.parse(plan.laststepdate)

        if (plan.primary > -1) {
            plans_filtered = plans_filtered.concat(plan)
        }
    }
    
    if (plans_filtered.length == 0) {
        return httpError("couldn't find a matching plan")
    }

    plans_filtered = plans_filtered.sort((a,b) => {
        return a.primary - b.primary || a.secondary - b.secondary || b.tertiary - a.tertiary
    })

    // Found a plan!
    let plan = plans_filtered[0]

    let planstepconfig = 'planstep' in config.apps ? config.apps.planstep : new PlanStepConfig()

    // Make a plan step
    await tqPost(["planstep"],
        {
            plan: {id: plan.id},
            type: {id: planstepconfig.steptypeid },
            notes: request.params.body,
            stepdatetime: new Date(),
            completedondatetime: planstepconfig.closestep ? new Date() : null,
            description: request.params.subject
        },
        config.auth)

    return 
};

export function findFirstString(needle: string[], haystack: string): number {
    return needle
        .map((q) => {
            return haystack.search(new RegExp(q,"i"))
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

interface PlanScore extends Plan {
    primary: number
    secondary: number
    tertiary: number
}

export interface Plan {
    campaign: {description: string},
    contributiondesignation: {description: string},
    constituent: {id: number, displayname: string},
    laststepdate: string,
    id: number
}

export interface Email {
    address: string
}