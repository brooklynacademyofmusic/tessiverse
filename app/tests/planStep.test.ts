import { findFirstString, planStep, type Plan, type Email } from '../src/routes/api/planStep/+server'
import { tqGet, tqPost } from '$lib/tq'
import { PlanStepConfig, UserConfig } from '$lib/config'
import { test, expect, vi, describe, beforeEach } from 'vitest'
import { HttpRequest, InvocationContext } from '@azure/functions'
vi.mock('../src/functions/http')

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
    let tqGetMocked = vi.mocked(tqGet)
    let tqPostMocked = vi.mocked(tqPost)
    let httpErrorMocked = vi.mocked(httpError)
    
    UserConfig.prototype.loadFromAzure = vi.fn(async () => {
        let user = new UserConfig("me")
        user.apps.planstep = new PlanStepConfig()
        return user
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
        httpErrorMocked.mockReset()
        tqGetMocked.mockReset()
        tqPostMocked.mockReset()
    })

    test("planStep returns an error if no plans are returned",async () => {
        tqGetMocked.mockResolvedValue([])

        await planStep(new HttpRequest({
            url: "http://test.example/",
            method: "get",
            params: email
        }), new InvocationContext())

        expect(httpErrorMocked).toBeCalledTimes(1)
        expect(tqGetMocked).toBeCalledTimes(1)
        expect(tqPostMocked).not.toBeCalled()
    })

    test("planStep returns an error if no matching plans are returned",async () => {
        tqGetMocked.mockResolvedValueOnce(plans).mockResolvedValue([emails[0]])

        await planStep(new HttpRequest({
            url: "http://test.example/",
            method: "get",
            params: email
        }), new InvocationContext())

        expect(httpErrorMocked).toBeCalledTimes(1)
        expect(httpErrorMocked).toBeCalledWith("couldn't find a matching plan")
        expect(tqGetMocked).toBeCalledTimes(5)
        expect(tqPostMocked).not.toBeCalled()
    })

    test.each([
        {body: "a@test.com", id: 1},
        {body: "2000", id: 2},
        {body: "Christina Person", id: 3}
    ])("planStep identifies a matching plan by email address, constituentid, and name", async (arg) => {
        tqPostMocked.mockReset()

        tqGetMocked.mockReset().
            mockResolvedValueOnce(plans).
            mockResolvedValueOnce([emails[0]]).
            mockResolvedValueOnce([emails[1]]).
            mockResolvedValueOnce([emails[2]]).
            mockResolvedValueOnce([emails[3]])

        email.body = arg.body
        planstep.plan.id = arg.id
        planstep.notes = arg.body

        vi.useFakeTimers({now: planstep.stepdatetime})
        await planStep(new HttpRequest({
            url: "http://test.example/",
            method: "get",
            params: email
        }), new InvocationContext())

        expect(tqPostMocked).toBeCalledTimes(1)
        expect(tqPostMocked).toBeCalledWith(["planstep"], planstep, "|||")

    })

    test.each([
        {body: "a@test.com 2000 Christina Person", id: 1},
        {body: "2000 a@test.com Christina Person", id: 2},
        {body: "Christina 2000 a@test.com", id: 3}
    ])("planStep identifies a matching plan by the first email address, constituentid, and name", async (arg) => {
        tqPostMocked.mockReset()

        tqGetMocked.mockReset().
            mockResolvedValueOnce(plans).
            mockResolvedValueOnce([emails[0]]).
            mockResolvedValueOnce([emails[1]]).
            mockResolvedValueOnce([emails[2]]).
            mockResolvedValueOnce([emails[3]])

        email.body = arg.body
        planstep.plan.id = arg.id
        planstep.notes = arg.body

        vi.useFakeTimers({now: planstep.stepdatetime})
        await planStep(new HttpRequest({
            url: "http://test.example/",
            method: "get",
            params: email
        }), new InvocationContext())

        expect(tqPostMocked).toBeCalledTimes(1)
        expect(tqPostMocked).toBeCalledWith(["planstep"], planstep, "|||")

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
    tqPostMocked.mockReset()

    tqGetMocked.mockReset().mockResolvedValueOnce(plans_ambiguous).mockResolvedValue([emails[0]])

    email.body = arg.body
    planstep.plan.id = arg.id
    planstep.notes = arg.body

    vi.useFakeTimers({now: planstep.stepdatetime})
    await planStep(new HttpRequest({
        url: "http://test.example/",
        method: "get",
        params: email
    }), new InvocationContext())

    expect(tqPostMocked).toBeCalledTimes(1)
    expect(tqPostMocked).toBeCalledWith(["planstep"], planstep, "|||")

    })

})