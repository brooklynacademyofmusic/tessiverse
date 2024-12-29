import child_process from 'child_process'
import { tq_key_vault_url } from './config.server';
import { env } from '$env/dynamic/private'

export async function tq(verb: string, object: string, options?: {variant?: string, query?: any, login?: string, headers?: Record<string,string>}): Promise<any> {
    let flag = ""
    let headersString = ""
    if (options?.variant) {
        flag = "--"+options.variant;
    }
    if (options?.headers) {
        headersString = "--headers "+Object.entries(options.headers).map((key,val) => `${key}=${val}`).join(",")
    }

    console.log(`running tq (${verb} ${object} ${JSON.stringify(options)})`)

    const tqExecutable = (env.OS || "").match(/Windows/i) ? 'bin/tq.exe' : 'bin/tq'
    var tq = child_process.spawn(tqExecutable, ["-c", "--no-highlight", headersString, verb, object, flag], 
    {
        env: {"TQ_LOGIN": options?.login ?? "",
              "AZURE_KEY_VAULT": "https://"+tq_key_vault_url
        },
        timeout: 30000
    });

    let stdout: string = ""
    let stderr: string = ""

    tq.stdout.setEncoding("utf8")
    tq.stderr.setEncoding("utf8")
    tq.stdout.on("data", (chunk) => {stdout += chunk})
    tq.stderr.on("data", (chunk) => {stderr += chunk})

    tq.stdin.write(JSON.stringify(options?.query ?? "{}"))
    tq.stdin.end()

    return new Promise((res,rej) => {
        let error: Error
        tq.on("error",(e) => error = e)
        tq.on("exit",(code) => {
            if (error || code !=0 ) {
                console.log(`error in tq (error: ${error}, status: ${code}, output: ${stdout}, error: ${stderr})`)
                rej(error || stderr)
            } else {
                let out: any
                try {
                    out = lowercaseKeys(JSON.parse(stdout))
                } catch {
                    out = stdout
                }
                res(out)
            }
        })
    })    
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