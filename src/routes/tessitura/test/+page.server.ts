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
    if (typeof o === "string")
        o = o.split("\n")
    return JSON.parse(JSON.stringify(o))
}

export const load: PageServerLoad = ({fetch}) => {

    let serverTests = config.servers.map((s) => {return{
        ["Can reach "+s.label]: fetch("https://"+s.value,{ signal: AbortSignal.timeout(15000) })
            .then((res) => {if(res.status >= 300) throw(res)})
            .then(() => true)
            .catch((e) => stringify(e)),
        ["tq admin auth is valid on "+s.label]: tq("auth","validate",{login: s.value + "|" + env.TQ_ADMIN_LOGIN})
            .then(() => true)
            .catch((e) => stringify(e)),
        ["Can query "+s.label]: tq("get","constituents",{
            query: {"constituentid":"1"},
            login: s.value + "|" + env.TQ_ADMIN_LOGIN})
            .then(() => true)
            .catch((e) => stringify(e))
        }})

    let serverTestsObj = serverTests.reduce((x,y) => Object.assign(x,y),{})

    return {
        "AZURE_KEY_VAULT defined": env.AZURE_KEY_VAULT ? true : 
            "The AZURE_KEY_VAULT environment variable must be set",
        "TQ_ADMIN_LOGIN defined": env.TQ_ADMIN_LOGIN ? true : 
            "The TQ_ADMIN_LOGIN environment variable must be set",        
        "PUBLIC_SERVERS defined": env_public.PUBLIC_SERVERS ? true : 
            "The PUBLIC_SERVERS environment variable must be set",
        "Azure key vault can be accessed": (async () => new Azure().client.listPropertiesOfSecrets().next())()
            .then(() => true)
            .catch((e) => stringify(e)),
        "tq exists": fs.stat("bin/tq").then(() => true).catch((e) => JSON.parse(JSON.stringify(e))),
        "tq is executable": (async () => {
            let tq = await child_process.spawnSync("bin/tq")
            if(tq.error) throw(tq.error)
            })().then(() => true).catch((e) => stringify(e)),
        ...serverTestsObj
        }

}