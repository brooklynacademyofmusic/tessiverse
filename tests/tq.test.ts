import { test, expect, vi, describe, beforeEach } from 'vitest'
import { tq } from '$lib/tq'
import { env } from '$env/dynamic/private'

describe("tq", () => {
    test("tq runs the tq executable", async () => {
        expect(await tq("","","","","")).toMatch("tq is a wrapper around")
    })

    test("tq has access to the auth backend", async () => {
        expect(await tq("auth","list","","","")).toMatch(env.TQ_ADMIN_LOGIN || "The TQ_ADMIN_LOGIN variable isn't defined!")
    })

    test("tq returns an object", async () => {
        let constituent = await tq("get","constituents","",{constituentid: "1"},"")
        expect(constituent).toHaveProperty("Id")
        expect(constituent).toHaveProperty("DisplayName")
        expect(constituent).toHaveProperty("LastName")
    })
})