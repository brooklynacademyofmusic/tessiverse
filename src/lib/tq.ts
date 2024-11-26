import { env } from '$env/dynamic/private';
import _ from 'lodash';
import { spawnSync } from 'child_process'

export async function tq(verb: string, object: string, variant?: string, query?: any, login?: string): Promise<any> {
    let flag = "";
    if (variant != null) {
        flag = "--"+variant;
    }
           
    var tq = spawnSync('bin/tq', ["-c", "--no-highlight", verb, object, flag], 
    {
        encoding: 'utf8', 
        input: JSON.stringify(query),
        env: _.extend(process.env, 
            {"TQ_LOGIN": login || env.TQ_LOGIN}),
        timeout: 30000
    });

    if (tq.status != 0) {
        throw(tq.stderr)
    } else {
        return JSON.parse(tq.stdout)
    }

};