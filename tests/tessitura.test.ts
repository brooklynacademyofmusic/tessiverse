import { env } from '$env/dynamic/private'
import { TessituraAppServer } from '$lib/apps/tessitura/tessitura.server'
import { tq } from '$lib/tq'
import { test, expect, describe, beforeEach, vi } from 'vitest'
import { UserLoaded } from '$lib/azure'
import { SecretClient } from '@azure/keyvault-secrets'
import { DefaultAzureCredential } from '@azure/identity'
import { TessituraApp } from '$lib/apps/tessitura/tessitura'
import { readFileSync } from 'node:fs'
import * as https from 'node:https'
import { json } from 'node:stream/consumers'

describe("TessituraAppServer", async () => {
    let user: string[]
    let tessi: TessituraAppServer
    await new Promise((res) => https.createServer({
                key: readFileSync('relay/dev-server.key'), // openssl genrsa -out dev-server.key 2048  
                cert: readFileSync('relay/dev-server.crt') // openssl x509 -new -key dev-server.key -days 365 -out dev-server.crt -subj /CN=localhost/},
            },
            async (req, res) => {
                var out: any
                res.setHeader("content-type","application/json")
                if(req.url?.match("CRM/Constituents")) {
                    out = {"ConstituentSummaries":[{
                        Id:12345,
                        DisplayName: "Tessi",
                        LastName: "Verse"
                    }]}
                } else if(req.url?.match("ReferenceData/UserGroups")) {
                    out = [
                        {Id: "group1", Name: "Group 1"},
                        {Id: "group2", Name: "Group 2"},
                    ]
                } else if(req.url?.match("Security/Users")) {
                    out = {
                        FirstName: "Sky"
                    }
                } else if(req.url?.match("Security/Authenticate")) {
                    let payload = await json(req) as {"UserName": string}
                    if (payload.UserName == env.TQ_ADMIN_LOGIN.split("|")[0]) {
                        out = {"Token": "secret"}
                    } else {
                        out = {}
                    }
                }
                res.write(JSON.stringify(out))
                res.end()
        }).listen(8888).on("listening",() => res(true)))

    beforeEach(() => {
        user = env.TQ_ADMIN_LOGIN.split("|")
        tessi = new TessituraAppServer({
            tessiApiUrl: "localhost:8888",
            userid: user[0],
            group: user[1],
            location: user[2],
        })
    })

    test("auth returns a valid auth", async () => {
        expect(tessi.auth).toBe("localhost:8888"+"|"+env.TQ_ADMIN_LOGIN)
    })

    test("tessiGroups gets valid groups from Tessitura", async () => {
        let groups = await TessituraAppServer.tessiGroups(tessi.auth)
        expect(groups.length).greaterThan(1)
        expect(groups[0].label).toBe("Group 1")
        expect(groups[0].value).toBe("group1")
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
        let tessi = new TessituraAppServer(new TessituraApp().data)
        let userFail = new UserLoaded({identity: ""})
        let data = await tessi.load(userFail)
        expect(data.userid).toBe("")
        expect(data.group).toBe("")
    })

    test("load loads all data and renders form on success", async () => {
        let userSuccess = new UserLoaded({identity: ""})
        Object.assign(userSuccess.apps.tessitura,tessi.data)
        let data = await tessi.load(userSuccess)
        expect(data.userid).toBe(user[0])
        expect(data.group).toBe(user[1])
        expect(data.valid).toBe(true)
        expect(data.form).toHaveProperty("errors")
    })

})