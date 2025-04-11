import { findFirstString, planStep, PlanStepAppServer } from '$lib/apps/planStep/planStep.server'
import type { Plan, Email } from '$lib/apps/planStep/types'
import * as kit from '@sveltejs/kit'
import { tq } from '$lib/tq'
import { User } from '$lib/user'
import { test, expect, vi, describe, beforeEach, expectTypeOf } from 'vitest'
import { PlanStepApp } from '$lib/apps/planStep/planStep'
import { Azure, type UserLoaded } from '$lib/azure'
import { TessituraAppServer } from '$lib/apps/tessitura/tessitura.server'

describe("findFirstString", () => {
    test("findFirstString finds the first needle in a haystack",() => {
        let needle = ["several", "two", "three", null, "", undefined]

        expect(findFirstString(needle, "this is not the haystack you are looking for")).toBe(-1)
        expect(findFirstString(needle, "this is one of several haystacks")).toBe(15)
        expect(findFirstString(needle, "three, two, one haystacks")).toBe(0)
    })

    test.each(["", null, undefined])("findFirstString returns -1 when given nullish inputs",(arg) => {
        expect(findFirstString([arg], "this is not the haystack you are looking for")).toBe(-1)
    })
})

describe("planStep", () => {
    vi.mock('$lib/tq')
    vi.spyOn(kit,"error")
    var tqMocked = vi.mocked(tq)
    var errorMocked = vi.mocked(kit.error)

    let valid = true
    TessituraAppServer.prototype.tessiValidate = vi.fn(async () => {
        return valid
    })

    let azure_valid = true
    Azure.prototype.load = vi.fn(async () => {
        if (!azure_valid) 
            throw("whoops!")
        let user = new User({identity: "me"})
        user.apps.tessitura.constituentid = 12345
        user.apps.planStep = new PlanStepApp().data
        return user as UserLoaded
    })
    
    PlanStepAppServer.prototype.saveHistory = vi.fn(async () => {})

    let email = {
        from: "me@test.com",
        to: "planStep@test.com",
        cc: "",
        bcc: "",
        subject: "Note to self",
        body: "Some things of note!"
    }
    
    let plans: Plan[] = [
        {constituent: {id: 1000, displayname: "Alice Person"}, id: 1,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         updateddatetime: new Date().toString()},
        {constituent: {id: 2000, displayname: "Briana Person"}, id: 2,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         updateddatetime: new Date().toString()},
        {constituent: {id: 3000, displayname: "Christina Person"}, id: 3,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         updateddatetime: new Date().toString()},
        {constituent: {id: 4000, displayname: "Daphne Person"}, id: 4,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         updateddatetime: new Date().toString()},
    ]
    
    let emails: Email[][] = [
        [{address: "a@test.com"}],
        [{address: "b@test.com"}],
        [{address: "c@test.com"}],
        [{address: "d@test.com"}]
    ]
    
    let now = new Date()
    let planstep = {
        "description": "Note to self", 
        "notes": "a@test.com", 
        "plan": {"id": 0}, 
        "stepdatetime": now,
        "completedondatetime": now, 
        "type": {"id": 4}
    }

    beforeEach(() => {
        errorMocked.mockReset()
        tqMocked.mockReset()
        valid = true
        azure_valid = true
    })

    test("planStep returns an error if the user does not have a configuration",async () => {
        azure_valid = false
        
        await planStep(email).catch((e) => e)

        expect(errorMocked).toBeCalledTimes(1)
        expect(tqMocked).toBeCalledTimes(0)
        expect(TessituraAppServer.prototype.tessiValidate).toBeCalledTimes(0)
        expect(errorMocked.mock.calls[0][1]).toMatch("User configuration not found")
    })

    test("planStep returns an error if the user is not valid",async () => {
        valid = false
        
        await planStep(email).catch(() => {})
        expect(errorMocked).toBeCalledTimes(1)
        expect(tqMocked).toBeCalledTimes(0)

        expect(TessituraAppServer.prototype.tessiValidate).toBeCalledTimes(1)
        expect(errorMocked.mock.calls[0][1]).toMatch("Invalid Tessitura login")
    })

    test("planStep returns an error if user is not a worker",async () => {
        tqMocked.mockResolvedValue([{"constituentid":"-1"}])

        await planStep(email).catch(() => {})

        expect(errorMocked).toBeCalledTimes(1)
        expect(tqMocked).toBeCalledTimes(1)
        expect(tqMocked.mock.calls[0][0]).toBe("get")
        expect(tqMocked.mock.calls[0][1]).toBe("workers")
    })

    test("planStep returns an error if no matching plans are returned",async () => {
        tqMocked.mockResolvedValueOnce([{"constituentid":1}]).mockResolvedValueOnce(plans).mockResolvedValue([emails[0]])

        await planStep(email).catch(() => {})

        expect(errorMocked).toBeCalledTimes(1)
        expect(errorMocked.mock.calls[0][1]).toMatch(/User .* does not have any plans/)
        expect(tqMocked).toBeCalledTimes(1)

        tqMocked.mockReset().mockResolvedValueOnce([{"constituentid":12345}]).mockResolvedValueOnce(plans).mockResolvedValue(emails)

        await planStep(email).catch(() => {})

        expect(errorMocked).toBeCalledTimes(2)
        expect(errorMocked.mock.calls[1][1]).toMatch(/Couldn't find a matching plan for .*/)
        expect(tqMocked).toBeCalledTimes(3)

    })

    test("planStep returns a record of the plan created",async () => {
        tqMocked.mockReset().
            mockResolvedValueOnce([{"constituentid":12345}]).
            mockResolvedValueOnce(plans).
            mockResolvedValueOnce(emails).
            mockResolvedValue(null)

        email.body = "a@test.com"
        planstep.plan.id = 1
        planstep.notes = email.body

        vi.useFakeTimers({now: planstep.stepdatetime})
        let out = await planStep(email)

        expect(tqMocked).toBeCalledTimes(4)
        expect(tqMocked.mock.calls[3][0]).toBe("post")
        expect(tqMocked.mock.calls[3][1]).toBe("steps")
        expect(tqMocked.mock.calls[3][2]?.query).toEqual(planstep)
        expect(out).toEqual({
            date: planstep.stepdatetime,
            planDesc: plans[0].constituent.displayname+" / "+plans[0].campaign.description+" / "+plans[0].contributiondesignation.description,
            subject: email.subject,
        })
    })

    test.each([
        {body: "a@test.com", id: 1},
        {body: "2000", id: 2}
    ])("planStep identifies a matching plan by email address and constituentid", {timeout: 15000}, async (arg) => {

        tqMocked.mockReset().
            mockResolvedValueOnce([{"constituentid":12345}]).
            mockResolvedValueOnce(plans).
            mockResolvedValueOnce(emails).
            mockResolvedValue(null)

        email.body = arg.body
        planstep.plan.id = arg.id
        planstep.notes = arg.body

        vi.useFakeTimers({now: planstep.stepdatetime})
        await planStep(email)

        expect(tqMocked).toBeCalledTimes(4)
        expect(tqMocked.mock.calls[3][0]).toBe("post")
        expect(tqMocked.mock.calls[3][1]).toBe("steps")
        expect(tqMocked.mock.calls[3][2]?.query).toEqual(planstep)

    })

    test("planStep limits description to 30 characters", {timeout: 15000}, async (arg) => {

        tqMocked.mockReset().
            mockResolvedValueOnce([{"constituentid":12345}]).
            mockResolvedValueOnce(plans).
            mockResolvedValueOnce(emails).
            mockResolvedValue(null)

        let email2 = email
        let planstep2 = planstep

        email2.body = "a@test.com"
        email2.subject = "abcdefghijklmnopqrstuvwxyz123456789"
        planstep2.plan.id = 1
        planstep2.notes = "a@test.com"
        planstep2.description = "abcdefghijklmnopqrstuvwxyz1..."

        vi.useFakeTimers({now: planstep.stepdatetime})
        await planStep(email)

        expect(tqMocked).toBeCalledTimes(4)
        expect(tqMocked.mock.calls[3][0]).toBe("post")
        expect(tqMocked.mock.calls[3][1]).toBe("steps")
        expect(tqMocked.mock.calls[3][2]?.query).toEqual(planstep)

    })

    test.each([
        {body: "a@test.com 2000 Christina Person", id: 1},
        {body: "2000 a@test.com Christina Person", id: 2},
        {body: "Christina 2000 a@test.com", id: 2}
    ])("planStep identifies a matching plan by the first email address, constituentid", async (arg) => {

        tqMocked.mockReset().
            mockResolvedValueOnce([{"constituentid":12345}]).
            mockResolvedValueOnce(plans).
            mockResolvedValueOnce(emails).
            mockResolvedValue(null)

        email.body = arg.body
        planstep.plan.id = arg.id
        planstep.notes = arg.body

        vi.useFakeTimers({now: planstep.stepdatetime})
        await planStep(email)

        expect(tqMocked).toBeCalledTimes(4)
        expect(tqMocked.mock.calls[3][0]).toBe("post")
        expect(tqMocked.mock.calls[3][1]).toBe("steps")
        expect(tqMocked.mock.calls[3][2]?.query).toEqual(planstep)

    })

    let plans_ambiguous: Plan[] = [
        {constituent: {id: 1000, displayname: "A. Person"}, id: 1,
         campaign: {description: "25FY Gala"},
         contributiondesignation: {description: "designation"},
         updateddatetime: new Date().toString()},
         {constituent: {id: 1000, displayname: "A. Person"}, id: 2,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "OPERA-futuristic"},
         updateddatetime: new Date().toString()},
         {constituent: {id: 1000, displayname: "A. Person"}, id: 3,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         updateddatetime: new Date(new Date().getTime() + 1000000).toString()}]
    
    test.each([
    {body: "a@test.com gala", id: 1},
    {body: "a@test.com opera", id: 2},
    {body: "a@test.com", id: 3}
    ])("planStep disambiguates plans using campaign, designation, and timestamp", async (arg) => {

    tqMocked.mockReset().
        mockResolvedValueOnce([{"constituentid":12345}]).
        mockResolvedValueOnce(plans_ambiguous).mockResolvedValue([emails[0],emails[0],emails[0]])

    email.body = arg.body
    planstep.plan.id = arg.id
    planstep.notes = arg.body

    vi.useFakeTimers({now: planstep.stepdatetime})
    await planStep(email)

    expect(tqMocked).toBeCalledTimes(4)
    expect(tqMocked.mock.calls[3][0]).toBe("post")
    expect(tqMocked.mock.calls[3][1]).toBe("steps")
    expect(tqMocked.mock.calls[3][2]?.query).toEqual(planstep)

    })

})
