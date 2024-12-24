import { test, expect, vi, describe, beforeEach } from 'vitest'
import { lowercaseKeys, tq } from '$lib/tq'
import { env } from '$env/dynamic/private'
const dev_server = JSON.parse(env.DEV_SERVER)

describe("lowercaseKeys", () => {
    let o = {"An":1,"oBjEcT":"A","CAN":[1,2,3],"BE!":true} as Record<string,any>
    let l = {"an":1,"object":"A","can":[1,2,3],"be!":true} as Record<string,any>

    test("lowercaseKeys works with basic objects", () => {
        expect(lowercaseKeys(o)).toEqual(l)
    })

    test("lowercaseKeys works with arrays", () => {
        expect(lowercaseKeys([o,o,o])).toEqual([l,l,l])
    })

    test("lowercaseKeys works with nested object", () => {
        o["Nested?"] = structuredClone(o)
        l["nested?"] = structuredClone(l)
        expect(lowercaseKeys(o)).toEqual(l)
    })


})

describe("tq", () => {

    test("tq runs the tq executable", async () => {
        expect(await tq("","","","","")).toMatch("tq is a wrapper around")
    })

    test("tq has access to the auth backend", async () => {
        expect(await tq("auth","list","","","")).toMatch(env.TQ_ADMIN_LOGIN || "The TQ_ADMIN_LOGIN variable isn't defined!")
    })

    test("tq returns an object", async () => {
        let constituent = await tq("get","constituents","",{constituentid: "1"},dev_server[0].value + "|" + env.TQ_ADMIN_LOGIN)
        expect(constituent).toHaveProperty("id")
        expect(constituent).toHaveProperty("displayname")
        expect(constituent).toHaveProperty("lastname")
    })
})