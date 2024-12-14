import { findFirstString, planStep, PlanStepApp } from '$lib/apps/planStep/planStep.server'
import type { Plan, Email } from '$lib/apps/planStep/types'
import { error } from '@sveltejs/kit'
import { tq } from '$lib/tq'
import { User, UserLoaded } from '$lib/user'
import { test, expect, vi, describe, beforeEach } from 'vitest'

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
    vi.mock('@sveltejs/kit')
    var tqMocked = vi.mocked(tq)
    var errorMocked = vi.mocked(error)
    
    User.prototype.load = vi.fn(async () => {
        let user = new User("me")
        user.apps.planStep = new PlanStepApp()
        return user as UserLoaded
    })
    
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
         laststepdate: new Date().toString()},
        {constituent: {id: 2000, displayname: "Briana Person"}, id: 2,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         laststepdate: new Date().toString()},
        {constituent: {id: 3000, displayname: "Christina Person"}, id: 3,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         laststepdate: new Date().toString()},
        {constituent: {id: 4000, displayname: "Daphne Person"}, id: 4,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         laststepdate: new Date().toString()},
    ]
    
    let emails: Email[] = [
        {address: "a@test.com"},
        {address: "b@test.com"},
        {address: "c@test.com"},
        {address: "d@test.com"}
    ]
    
    let now = new Date()
    let planstep = {
        "description": "Note to self", 
        "notes": "a@test.com", 
        "plan": {"id": 1}, 
        "stepdatetime": now,
        "completedondatetime": now, 
        "type": {"id": 0}
    }



    beforeEach(() => {
        errorMocked.mockReset()
        tqMocked.mockReset()
    })

    test("planStep returns an error if no plans are returned",async () => {
        tqMocked.mockResolvedValue([])

        await planStep(email)

        expect(errorMocked).toBeCalledTimes(1)
        expect(tqMocked).toBeCalledTimes(1)
        expect(tqMocked.mock.calls[0][0]).toBe("get")
        expect(tqMocked.mock.calls[0][1]).toBe("plans")
    })

    test("planStep returns an error if no matching plans are returned",async () => {
        tqMocked.mockResolvedValueOnce(plans).mockResolvedValue([emails[0]])

        await planStep(email)

        expect(errorMocked).toBeCalledTimes(1)
        expect(errorMocked.mock.calls[0][1]).toMatch(`Couldn't find a matching plan for`)
        expect(tqMocked).toBeCalledTimes(5)
    })

    test.each([
        {body: "a@test.com", id: 1},
        {body: "2000", id: 2},
        {body: "Christina Person", id: 3}
    ])("planStep identifies a matching plan by email address, constituentid, and name", async (arg) => {
        tqMocked.mockReset()

        tqMocked.mockReset().
            mockResolvedValueOnce(plans).
            mockResolvedValueOnce([emails[0]]).
            mockResolvedValueOnce([emails[1]]).
            mockResolvedValueOnce([emails[2]]).
            mockResolvedValueOnce([emails[3]])

        email.body = arg.body
        planstep.plan.id = arg.id
        planstep.notes = arg.body

        vi.useFakeTimers({now: planstep.stepdatetime})
        await planStep(email)

        expect(tqMocked).toBeCalledTimes(6)
        expect(tqMocked.mock.calls[5][0]).toBe("post")
        expect(tqMocked.mock.calls[5][1]).toBe("planstep")
        expect(tqMocked.mock.calls[5][3]).toEqual(planstep)

    })

    test.each([
        {body: "a@test.com 2000 Christina Person", id: 1},
        {body: "2000 a@test.com Christina Person", id: 2},
        {body: "Christina 2000 a@test.com", id: 3}
    ])("planStep identifies a matching plan by the first email address, constituentid, and name", async (arg) => {
        tqMocked.mockReset()

        tqMocked.mockReset().
            mockResolvedValueOnce(plans).
            mockResolvedValueOnce([emails[0]]).
            mockResolvedValueOnce([emails[1]]).
            mockResolvedValueOnce([emails[2]]).
            mockResolvedValueOnce([emails[3]])

        email.body = arg.body
        planstep.plan.id = arg.id
        planstep.notes = arg.body

        vi.useFakeTimers({now: planstep.stepdatetime})
        await planStep(email)

        expect(tqMocked).toBeCalledTimes(6)
        expect(tqMocked.mock.calls[5][0]).toBe("post")
        expect(tqMocked.mock.calls[5][1]).toBe("planstep")
        expect(tqMocked.mock.calls[5][3]).toEqual(planstep)

    })

    let plans_ambiguous: Plan[] = [
        {constituent: {id: 1000, displayname: "A. Person"}, id: 1,
         campaign: {description: "25FY Gala"},
         contributiondesignation: {description: "designation"},
         laststepdate: new Date().toString()},
         {constituent: {id: 1000, displayname: "A. Person"}, id: 2,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "OPERA-futuristic"},
         laststepdate: new Date().toString()},
         {constituent: {id: 1000, displayname: "A. Person"}, id: 3,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         laststepdate: new Date(new Date().getTime() + 1000000).toString()}]
    
    test.each([
    {body: "a@test.com gala", id: 1},
    {body: "a@test.com opera", id: 2},
    {body: "a@test.com", id: 3}
    ])("planStep disambiguates plans using campaign, designation, and timestamp", async (arg) => {
    tqMocked.mockReset()

    tqMocked.mockReset().mockResolvedValueOnce(plans_ambiguous).mockResolvedValue([emails[0]])

    email.body = arg.body
    planstep.plan.id = arg.id
    planstep.notes = arg.body

    vi.useFakeTimers({now: planstep.stepdatetime})
    await planStep(email)

    expect(tqMocked).toBeCalledTimes(5)
    expect(tqMocked.mock.calls[4][0]).toBe("post")
    expect(tqMocked.mock.calls[4][1]).toBe("planstep")
    expect(tqMocked.mock.calls[4][3]).toEqual(planstep)

    })

})