import type { RequestHandler, RouteParams } from './$types';
import { spawnSync } from 'child_process';
import { error } from '@sveltejs/kit';
import _ from 'lodash';

export const GET: RequestHandler = ({params, request}) => {
    return tq_verb("get",params,request).then(
        (result) => new Response(result)
    ).catch((e) => error(500, {message: e.message}))
}

export const POST: RequestHandler = ({params, request}) => {
    return tq_verb("post",params,request).then(
        (result) => new Response(result)
    ).catch((e) => error(500, {message: e.message}))
}

export const PUT: RequestHandler = ({params, request}) => {
    return tq_verb("put",params,request).then(
        (result) => new Response(result)
    ).catch((e) => error(500, {message: e.message}))
}


async function tq_verb(verb: string, params: RouteParams, request: Request): Promise<string> {
  let flag = "";
  if (params.variant != null) {
      flag = "--"+params.variant;
  }
  let body = await request.body?.getReader().read() 
      
  return tq([verb, params.object, flag], body?.value?.toString())
};

function tq(args: string[], login?: string, stdin?: string): string {
 
    var tq = spawnSync('bin/tq', ["-c", "--no-highlight"].concat(args), 
      {
        encoding: 'utf8', 
        input: stdin,
        env: _.extend(process.env, 
          {"TQ_LOGIN": login || process.env.TQ_LOGIN}),
        timeout: 30000
      });

    if (tq.status != 0) {
      throw(tq.stderr)
    } else {
      return tq.stdout
    }

};