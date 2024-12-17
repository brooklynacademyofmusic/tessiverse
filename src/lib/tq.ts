import { env } from '$env/dynamic/private';
import child_process from 'child_process'
import { Key } from 'lucide-svelte';
import { cwd } from 'process';

export async function tq(verb: string, object: string, variant?: string, query?: any, login?: string): Promise<any> {
    let flag = "";
    if (variant != undefined) {
        flag = "--"+variant;
    }
    console.log(`running tq (${verb} ${object} ${variant} ${JSON.stringify(query)} ${login})`)

    const tqExecutable = env.OS.match(/Windows/i) ? 'src/lib/bin/tq.exe' : 'src/lib/bin/tq'
    var tq = child_process.spawnSync(tqExecutable, ["-c", "--no-highlight", verb, object, flag], 
    {
        encoding: 'utf8', 
        input: JSON.stringify(query),
        env: {"TQ_LOGIN": login},
        timeout: 30000
    });

    if (tq.status != 0) {
        console.log(`error in tq (error: ${tq.error}, status: ${tq.status}, output: ${tq.stdout}, error: ${tq.stderr})`)
        throw(tq.stderr)
    } else {
        let out: any
        try {
            // lowercase keys
            out = Object.fromEntries(
                Object.entries(JSON.parse(tq.stdout)).map(
                    ([k,v]) => [k.toLowerCase(),v]))
        } catch {
            out = tq.stdout
        }
        return out
    }

};