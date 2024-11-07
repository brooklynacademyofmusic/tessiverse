import { findFirstString, planStep, Plan, Email } from '../src/functions/planStep'
import { httpError, tqGet, tqPost } from '../src/functions/http'
import { readConfig, UserConfig } from '../src/functions/config'
import { test, expect, jest } from '@jest/globals'
import { HttpRequest, HttpResponse, HttpResponseInit, InvocationContext } from '@azure/functions'

test("findFirstString finds the first needle in a haystack",() => {
    let needle = ["one", "two", "three"]

    expect(findFirstString(needle, "this is not the haystack you are looking for")).toBe(-1)
    expect(findFirstString(needle, "this is one of several haystacks")).toBe(8)
    expect(findFirstString(needle, "three, two, one haystacks")).toBe(0)
})

//-------------- 

let email = {
    from: "me@test.com",
    to: "planStep@test.com",
    cc: "",
    bcc: "",
    subject: "Note to self",
    body: "Some things of note!"
}

let user: UserConfig = {
    userid: "me",
    firstname: "sky",
    lastname: "syzygy",
    apps: null,
    inactive: false,
    locked: false,
    constituentid: -1,
    auth: ""
}

jest.mock('../src/functions/http')
jest.mock('../src/functions/config')
let readConfigMocked = jest.mocked(readConfig).mockReturnValue(Promise.resolve(user))
let tqGetMocked = jest.mocked(tqGet).mockReturnValue(Promise.resolve("a"))
let tqPostMocked = jest.mocked(tqPost).mockReturnValue(Promise.resolve({}))
let httpErrorMocked = jest.mocked(httpError).mockReturnValue(Promise.resolve({} as HttpResponseInit))

test("planStep returns an error if no plans are returned",async () => {
    httpErrorMocked.mockReset()
    tqGetMocked.mockReset()
    tqPostMocked.mockReset()

    let x = await tqGetMocked([],{},"")

    await planStep(new HttpRequest({
        url: "http://test.example/",
        method: "get",
        params: email
    }), new InvocationContext())

    expect(httpErrorMocked).toBeCalledTimes(1)
    expect(tqGetMocked).toBeCalledTimes(1)
    expect(tqPostMocked).not.toBeCalled()

})

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

test("planStep identifies a matching plan by email address, constituentid, and name",async () => {
    httpErrorMocked.mockReset()
    tqGetMocked.mockReset().
        mockReturnValueOnce((async () => {return plans})()).
        mockReturnValueOnce((async () => {return [emails[0]]})()).
        mockReturnValueOnce((async () => {return [emails[1]]})()).
        mockReturnValueOnce((async () => {return [emails[2]]})()).
        mockReturnValueOnce((async () => {return [emails[3]]})()).
        mockReturnValueOnce((async () => {return [emails[4]]})())
    tqPostMocked.mockReset()

    let email2 = email
    email2.body = "a@test.com"

    await planStep(new HttpRequest({
        url: "http://test.example/",
        method: "get",
        params: email
    }), new InvocationContext())

    expect(tqPostMocked.mock.calls).toHaveLength(1)

})