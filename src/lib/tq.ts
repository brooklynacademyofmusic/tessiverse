import child_process from 'child_process'
import { tq_key_vault_url } from './config.server';
import { env } from '$env/dynamic/private'

export async function tq(verb: string, object: string, variant?: string, query?: any, login?: string): Promise<any> {
    let flag = "";
    if (variant) {
        flag = "--"+variant;
    }
    console.log(`running tq (${verb} ${object} ${variant} ${JSON.stringify(query)} ${login})`)

    const tqExecutable = (env.OS || "").match(/Windows/i) ? 'bin/tq.exe' : 'bin/tq'
    var tq = child_process.spawnSync(tqExecutable, ["-c", "--no-highlight", verb, object, flag], 
    {
        encoding: 'utf8', 
        input: JSON.stringify(query),
        env: {"TQ_LOGIN": login,
              "AZURE_KEY_VAULT": tq_key_vault_url
        },
        timeout: 30000
    });

    if (tq.status != 0) {
        console.log(`error in tq (error: ${tq.error}, status: ${tq.status}, output: ${tq.stdout}, error: ${tq.stderr})`)
        throw(tq.stderr)
    } else {
        let out: any
        try {
            out = lowercaseKeys(JSON.parse(tq.stdout))
        } catch {
            out = tq.stdout
        }
        return out
    }

};

export function lowercaseKeys(o: object): object {
    if (Array.isArray(o)) {
        return o.map(lowercaseKeys)
    } else {
        return Object.fromEntries(Object.entries(o).map(([k,v]) => {
            if (typeof v === "object" && !Array.isArray(v))
                v = lowercaseKeys(v)
            return [k.toLocaleLowerCase(),v]
        }))
    }
}