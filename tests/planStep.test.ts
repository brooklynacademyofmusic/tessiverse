import { findFirstString, planStep, Plan, Email } from '../src/functions/planStep'
import { httpError, tqGet, tqPost } from '../src/functions/http'
import { PlanStepConfig, UserConfig } from '../src/functions/config'
import { test, expect, jest, describe, beforeEach } from '@jest/globals'
import { HttpRequest, InvocationContext } from '@azure/functions'
jest.mock('../src/functions/http')

describe("findFirstString", () => {
    test("findFirstString finds the first needle in a haystack",() => {
        let needle = ["one", "two", "three"]

        expect(findFirstString(needle, "this is not the haystack you are looking for")).toBe(-1)
        expect(findFirstString(needle, "this is one of several haystacks")).toBe(8)
        expect(findFirstString(needle, "three, two, one haystacks")).toBe(0)
    })
})

describe("planStep", () => {
    let tqGetMocked = jest.mocked(tqGet)
    let tqPostMocked = jest.mocked(tqPost)
    let httpErrorMocked = jest.mocked(httpError)
    
    UserConfig.prototype.loadFromAzure = jest.fn(async () => {
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
        {constituent: {id: 1, displayname: "A. Person"}, id: 1,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         laststepdate: new Date().toString()},
        {constituent: {id: 2, displayname: "B. Person"}, id: 2,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         laststepdate: new Date().toString()},
        {constituent: {id: 3, displayname: "C. Person"}, id: 3,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         laststepdate: new Date().toString()},
        {constituent: {id: 4, displayname: "D. Person"}, id: 4,
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

    test.each([
        {body: "a@test.com", id: 1},
        {body: "2", id: 2},
        {body: "C. Person", id: 3}
    ])("planStep identifies a matching plan by email address, constituentid, and name", async (arg) => {
        tqPostMocked.mockReset()

        tqGetMocked.mockReset().
            mockReturnValueOnce((async () => {return plans})()).
            mockReturnValueOnce((async () => {return [emails[0]]})()).
            mockReturnValueOnce((async () => {return [emails[1]]})()).
            mockReturnValueOnce((async () => {return [emails[2]]})()).
            mockReturnValueOnce((async () => {return [emails[3]]})())

        email.body = arg.body
        planstep.plan.id = arg.id
        planstep.notes = arg.body

        jest.useFakeTimers({now: planstep.stepdatetime})
        await planStep(new HttpRequest({
            url: "http://test.example/",
            method: "get",
            params: email
        }), new InvocationContext())

        expect(tqPostMocked).toBeCalledTimes(1)
        expect(tqPostMocked).toBeCalledWith(["planstep"], planstep, "|||")

    })

    test.each([
        {body: "a@test.com 2 C.Person", id: 1},
        {body: "2 a@test.com C.Person", id: 2},
        {body: "C. Person 2 a@test.com", id: 3}
    ])("planStep identifies a matching plan by the first email address, constituentid, and name", async (arg) => {
        tqPostMocked.mockReset()

        tqGetMocked.mockReset().
            mockReturnValueOnce((async () => {return plans})()).
            mockReturnValueOnce((async () => {return [emails[0]]})()).
            mockReturnValueOnce((async () => {return [emails[1]]})()).
            mockReturnValueOnce((async () => {return [emails[2]]})()).
            mockReturnValueOnce((async () => {return [emails[3]]})())

        email.body = arg.body
        planstep.plan.id = arg.id
        planstep.notes = arg.body

        jest.useFakeTimers({now: planstep.stepdatetime})
        await planStep(new HttpRequest({
            url: "http://test.example/",
            method: "get",
            params: email
        }), new InvocationContext())

        expect(tqPostMocked).toBeCalledTimes(1)
        expect(tqPostMocked).toBeCalledWith(["planstep"], planstep, "|||")

    })

    let plans_ambiguous: Plan[] = [
        {constituent: {id: 1, displayname: "A. Person"}, id: 1,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         laststepdate: new Date().toString()},
         {constituent: {id: 1, displayname: "A. Person"}, id: 1,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         laststepdate: new Date().toString()},
         {constituent: {id: 1, displayname: "A. Person"}, id: 1,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         laststepdate: new Date().toString()},
         {constituent: {id: 1, displayname: "A. Person"}, id: 1,
         campaign: {description: "campaign"},
         contributiondesignation: {description: "designation"},
         laststepdate: new Date().toString()}]
    
    test.skip.each([
    {body: "a@test.com 2 C.Person", id: 1},
    {body: "2 a@test.com C.Person", id: 2},
    {body: "C. Person 2 a@test.com", id: 3}
    ])("planStep disambiguates plans using campaign, designation, and timestamp", async (arg) => {
    tqPostMocked.mockReset()

    tqGetMocked.mockReset().
        mockReturnValueOnce((async () => {return plans_ambiguous})()).
        mockReturnValueOnce((async () => {return [emails[0]]})()).
        mockReturnValueOnce((async () => {return [emails[1]]})()).
        mockReturnValueOnce((async () => {return [emails[2]]})()).
        mockReturnValueOnce((async () => {return [emails[3]]})())

    email.body = arg.body
    planstep.plan.id = arg.id
    planstep.notes = arg.body

    jest.useFakeTimers({now: planstep.stepdatetime})
    await planStep(new HttpRequest({
        url: "http://test.example/",
        method: "get",
        params: email
    }), new InvocationContext())

    expect(tqPostMocked).toBeCalledTimes(1)
    expect(tqPostMocked).toBeCalledWith(["planstep"], planstep, "|||")

    })

})