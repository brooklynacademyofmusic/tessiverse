import { env } from '$env/dynamic/private'
import { TessituraAppServer } from '$lib/apps/tessitura/tessitura.server'
import { test, expect, describe, beforeEach } from 'vitest'

describe("TessituraAppServer", () => {
    let user: string[]
    let tessi: TessituraAppServer
    beforeEach(() => {
        user = env.TQ_ADMIN_LOGIN.split("|")
        tessi = new TessituraAppServer({
            tessiApiUrl: user[0],
            userid: user[1],
            group: user[2],
            location: user[3],
            key: "",
            valid: false
        })
    })

    test("auth returns a valid auth", async () => {
        expect(tessi.auth).toBe(env.TQ_ADMIN_LOGIN)
    })

    test("tessiGroups gets valid groups from Tessitura", async () => {
        let groups = await TessituraAppServer.tessiGroups()
        expect(groups.length).greaterThan(1)
        expect(groups[0]).toHaveProperty("label")
        expect(groups[0]).toHaveProperty("value")
    })    

    test("tessiLoad loads user info from Tessitura", async () => {
       await tessi.tessiLoad()
       console.log(tessi.data)
       expect(tessi.data.firstname).toBe("Sky")
    })
    
    test("tessiValidate validates login with Tessitura", async () => {
        let valid = await tessi.tessiValidate()
        expect(valid).toBe(true)

        tessi.data.location = undefined
        valid = await tessi.tessiValidate()
        expect(valid).toBe(true)

        tessi.data.group = ""
        valid = await tessi.tessiValidate()
        expect(valid).toBe(true)

        tessi.data.userid = "notauser"
        valid = await tessi.tessiValidate()
        expect(valid).toBe(false)
    })

    test("tessiPassword saves password to Auth backend", () => {

    })
        
})