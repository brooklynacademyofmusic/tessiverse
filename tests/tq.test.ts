import { test, expect, vi, describe, beforeEach, afterAll, beforeAll } from 'vitest'
import { lowercaseKeys, tq } from '$lib/tq'
import { env } from '$env/dynamic/private'
import * as https from 'node:https'
import { readFileSync } from 'node:fs'


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

    test("lowercaseKeys works with nested array", () => {
        let p = {"Nested!":[structuredClone(o),structuredClone(l)]}
        expect((lowercaseKeys(p) as any)["nested!"][0]).toEqual(lowercaseKeys(o))
        expect((lowercaseKeys(p) as any)["nested!"][1]).toEqual(lowercaseKeys(l))
    })
})

describe("tq", async () => {
    await new Promise((res) => https.createServer({
            key: readFileSync('relay/dev-server.key'), // openssl genrsa -out dev-server.key 2048  
            cert: readFileSync('relay/dev-server.crt') // openssl x509 -new -key dev-server.key -days 365 -out dev-server.crt -subj /CN=localhost/},
        },
        (req, res) => {
            if(req.url?.match("CRM/Constituents")) {
                res.setHeader("content-type","application/json")
                res.write(JSON.stringify({
                    Id:12345,
                    DisplayName: "Tessi",
                    LastName: "Verse"
                }))
            }
            res.end()
    }).listen(8888).on("listening",() => res(true)))
    
    test("tq runs the tq executable", async () => {
        expect(await tq("","")).toMatch("tq is a wrapper around")
    })

    test("tq has access to the Azure auth backend", async () => {
        expect(await tq("auth","list")).toMatch(env.TQ_ADMIN_LOGIN || "The TQ_ADMIN_LOGIN variable isn't defined!")
    })

    test("tq returns an object", async () => {
        let constituent = await tq("get","constituents",{query: {constituentid: "1"}, login: "localhost:8888" + "|" + env.TQ_ADMIN_LOGIN})
        expect(constituent).toHaveProperty("id")
        expect(constituent).toHaveProperty("displayname")
        expect(constituent).toHaveProperty("lastname")
    })

})