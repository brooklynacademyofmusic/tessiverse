import child_process from 'child_process'
import { tq_key_vault_url } from './config.server';
import { env } from '$env/dynamic/private'
import { DefaultAzureCredential } from '@azure/identity'
export const relay_aad_audience = "https://relay.azure.net//.default"

export async function tq(verb: string, object: string, options?: {variant?: string, query?: string | object, login?: string, headers?: Record<string,string>, env?: Record<string,string>}): Promise<any> {
    let flag = ""
    options = Object.assign({query: {}},options)
    if (options?.variant) {
        flag = "--"+options.variant;
    }
    if (options.login?.split("|")[0].match("servicebus.windows.net/"))
        Object.assign(options,{ headers: { ServiceBusAuthorization: (await new DefaultAzureCredential().getToken(relay_aad_audience)).token } })

    console.log(`running tq (${verb} ${object} ${JSON.stringify(options)})`)

    const tqExecutable = (env.OS || "").match(/Windows/i) ? 'bin/tq.exe' : 'bin/tq'
    var tq = child_process.spawn(tqExecutable, [verb, object, flag], 
    {
        env: {...options.env,
              "TQ_LOGIN": options.login ?? "",
              "AZURE_KEY_VAULT": "https://"+tq_key_vault_url,
              "TQ_HEADERS": options.headers ? JSON.stringify(options.headers) : "",
              "TQ_COMPACT": "1"
            },
        timeout: 30000
    });

    let stdout: string = ""
    let stderr: string = ""

    tq.stdout.setEncoding("utf8")
    tq.stderr.setEncoding("utf8")
    tq.stdout.on("data", (chunk) => {stdout += chunk})
    tq.stderr.on("data", (chunk) => {stderr += chunk})

    tq.stdin.write(typeof options.query === "string" ? options.query : JSON.stringify(options.query))
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