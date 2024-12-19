import { env } from '$env/dynamic/private'
import { TessituraAppServer } from '$lib/apps/tessitura/tessitura.server'
import { tq } from '$lib/tq'
import { test, expect, describe, beforeEach, vi } from 'vitest'
import child_process from 'child_process'

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
       expect(tessi.data.firstname).toBe("Sky")
    })
    
    test("tessiValidate validates login with Tessitura", async () => {
        let valid = await tessi.tessiValidate()
        expect(valid).toBe(true)

        tessi.data.userid = "notauser"
        valid = await tessi.tessiValidate()
        expect(valid).toBe(false)
    })

    test("tessiPassword saves password to Auth backend", async () => {
        let list = await tq("auth","list")
        expect(list).not.toMatch("notauser")

        tessi.data.userid = "notauser"
        tessi.tessiPassword("pAsSw0rD")

        list = await tq("auth","list")
        expect(list).toMatch("notauser")
       
        let ss = child_process.spawnSync.bind({})
        child_process.spawnSync = (command: string) => ss(command, ["auth","delete",
            "-H",tessi.data.tessiApiUrl,"-U",tessi.data.userid,"-G",tessi.data.group,"-L",tessi.data.location || ""]) as any

        await tq("auth","delete").catch(() => {})
    })
        
})