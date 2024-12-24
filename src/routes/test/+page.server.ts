import type { PageServerLoad } from "./$types"
import { env } from '$env/dynamic/private'
import { env as env_public } from '$env/dynamic/public'

import { Azure } from "$lib/azure"
import fs from 'node:fs/promises'
import child_process from 'node:child_process'
import * as config from '$lib/const'
import { tq } from "$lib/tq"

const stringify = function(o: any): any {
    console.log(o)
    return JSON.parse(JSON.stringify(o))
}

export const load: PageServerLoad = ({fetch}) => {

    let serverTests = config.servers.map((s) => {return{
        ["Can reach "+s.label]: fetch(s.value)
            .then((res) => {if(res.status >= 300) throw(res)})
            .then(() => true)
            .catch((e) => stringify(e)),
        ["tq admin auth is valid on "+s.label]: tq("auth","validate",undefined,undefined,env.TQ_ADMIN_LOGIN)
            .then(() => true)
            .catch((e) => stringify(e)),
        ["Can query "+s.label]: tq("get","constituents",undefined,{"constituentid":"1"},
            env.TQ_ADMIN_LOGIN)
            .then(() => true)
            .catch((e) => stringify(e))
        }})

    let serverTestsObj = serverTests.reduce((x,y) => Object.assign(x,y),{})

    return {
        "AZURE_KEY_VAULT defined": env.AZURE_KEY_VAULT ? true : 
            "The AZURE_KEY_VAULT environment variable must be set",
        "Azure key vault access": (async () => new Azure().client.listPropertiesOfSecrets().next())()
            .then(() => true)
            .catch((e) => stringify(e)),
        "tq exists": fs.stat("bin/tq").then(() => true).catch((e) => JSON.parse(JSON.stringify(e))),
        "tq is executable": (async () => {
            let tq = await child_process.spawnSync("bin/tq")
            if(tq.error) throw(tq.error)
            })().then(() => true).catch((e) => stringify(e)),
        "TQ_ADMIN_LOGIN defined": env.TQ_ADMIN_LOGIN ? true : 
            "The TQ_ADMIN_LOGIN environment variable must be set",        
        "TQ_ADMIN_LOGIN is defined in the key store": tq("auth","list")
            .then((l: string) => l.includes(env.TQ_ADMIN_LOGIN))
            .catch((e) => stringify(e)),
        "PUBLIC_SERVERS defined": env_public.PUBLIC_SERVERS ? true : 
        "The PUBLIC_SERVERS environment variable must be set",
        ...serverTestsObj
        }

}