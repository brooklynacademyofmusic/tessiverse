import type { PageServerLoad } from "./$types"
import { env } from '$env/dynamic/private'
import { Azure } from "$lib/azure"
import fs from 'node:fs/promises'
import child_process from 'node:child_process'
import * as config from '$lib/const'
import { tq } from "$lib/tq"
import { User } from "$lib/user"
import { TessituraAppServer } from "$lib/apps/tessitura/tessitura.server"

export const load: PageServerLoad = ({fetch}) => {

    let serverTests = config.servers.map((s) => {return{
        ["Can reach "+s.label]: fetch(s.value)
            .then((res) => {if(res.status >= 300) throw(res)})
            .then(() => true)
            .catch((e) => JSON.parse(JSON.stringify(e))),
        ["tq admin auth is valid on "+s.label]: tq("auth","validate",undefined,undefined,env.TQ_ADMIN_LOGIN)
            .then(() => true)
            .catch((e) => e.split("\n")),
        ["Can query "+s.label]: tq("get","constituents",undefined,{"constituentid":"1"},
            env.TQ_ADMIN_LOGIN)
            .then(() => true)
            .catch((e) => e)
        }})

    let serverTestsObj = serverTests.reduce((x,y) => Object.assign(x,y),{})
    console.log(serverTestsObj)

    return {
        "AZURE_KEY_VAULT_URL defined": env.AZURE_KEY_VAULT_URL ? true : 
            "The AZURE_KEY_VAULT_URL environment variable must be set",
        "Azure key vault access": (async () => new Azure().client.listPropertiesOfSecrets().next())()
            .then(() => true)
            .catch((e) => JSON.parse(JSON.stringify(e))),
        "tq exists": fs.stat("bin/tq").then(() => true).catch((e) => JSON.parse(JSON.stringify(e))),
        "tq is executable": (async () => {
            let tq = await child_process.spawnSync("bin/tq")
            if(tq.error) 
                throw(JSON.parse(JSON.stringify(tq.error)))
            })().then(() => true).catch((e) => e),
        "TQ_ADMIN_LOGIN defined": env.TQ_ADMIN_LOGIN ? true : 
            "The TQ_ADMIN_LOGIN environment variable must be set",        
        "TQ_ADMIN_LOGIN is defined in the key store": tq("auth","list")
            .then((l: string) => l.includes(env.TQ_ADMIN_LOGIN))
            .catch((e) => e),
        ...serverTestsObj
        }

}