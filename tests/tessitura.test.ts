import { env } from '$env/dynamic/private'
import { TessituraAppServer } from '$lib/apps/tessitura/tessitura.server'
import { tq } from '$lib/tq'
import { test, expect, describe, beforeEach, vi } from 'vitest'
import { UserLoaded } from '$lib/azure'
import { SecretClient } from '@azure/keyvault-secrets'
import { DefaultAzureCredential } from '@azure/identity'

const dev_server = JSON.parse(env.DEV_SERVER)

describe("TessituraAppServer", () => {
    let user: string[]
    let tessi: TessituraAppServer
    beforeEach(() => {
        user = env.TQ_ADMIN_LOGIN.split("|")
        tessi = new TessituraAppServer({
            tessiApiUrl: dev_server[0].value,
            userid: user[0],
            group: user[1],
            location: user[2],
        })
    })

    test("auth returns a valid auth", async () => {
        expect(tessi.auth).toBe(dev_server[0].value+"|"+env.TQ_ADMIN_LOGIN)
        console.log(env.DEV_SERVER)
    })

    test("tessiGroups gets valid groups from Tessitura", async () => {
        let groups = await TessituraAppServer.tessiGroups(tessi.auth)
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

    test("tessiPassword saves password to Auth backend",  {timeout: 15000}, async () => {
        tessi.data.userid = "notauser"
        tessi.tessiPassword("pAsSw0rD")

        let list = await tq("auth","list")
        expect(list).toMatch("notauser")
       
        // cleanup
        let client = new SecretClient(
            `https://${env.TQ_KEY_VAULT}`,
            new DefaultAzureCredential()
        )
        let secrets = client.listPropertiesOfSecrets()
        for await (let secret of secrets) {
            if(secret.name.includes("notauser")) {
                let deletePoller = await client.beginDeleteSecret(secret.name)
                await deletePoller.pollUntilDone()
                await client.purgeDeletedSecret(secret.name)
            }
        }

        list = await tq("auth","list")
        expect(list).not.toMatch("notauser")
    })

    test("load falls back to blank data on load failure", async () => {
        let tessi = new TessituraAppServer()
        let userFail = new UserLoaded("")
        let data = await tessi.load(userFail)
        expect(data.userid).toBe("")
        expect(data.group).toBe("")
    })

    test("load loads all data and renders form on success", async () => {
        let userSuccess = new UserLoaded("")
        Object.assign(userSuccess.apps.tessitura,tessi.data)
        let data = await tessi.load(userSuccess)
        expect(data.userid).toBe(user[0])
        expect(data.group).toBe(user[1])
    })
        
})