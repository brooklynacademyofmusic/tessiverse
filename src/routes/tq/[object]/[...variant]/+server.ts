import type { RequestHandler, RouteParams } from './$types';
import { error, json } from '@sveltejs/kit';
import * as errors from '$lib/errors'
import { tq } from '$lib/tq'
import { Azure } from '$lib/azure';
import { TessituraAppServer } from '$lib/apps/tessitura/tessitura.server';

export const GET: RequestHandler = ({params, request, locals}) => {
  return tq_verb("get", params, request, locals)}

export const POST: RequestHandler = ({params, request, locals}) => {
  return tq_verb("post", params, request, locals)}

export const PUT: RequestHandler = ({params, request, locals}) => {
  return tq_verb("put", params, request, locals)}

async function tq_verb(verb: string, params: RouteParams, request: Request, locals: App.Locals): Promise<Response> {
  if (!locals.user.userRoles || !locals.user.userRoles.includes("admin")) 
    error(400,errors.AUTH)
  let azure = new Azure()
  let user = await azure.load({identity: locals.user.userDetails})
  let tessiApp = new TessituraAppServer(Object.assign(user.apps.tessitura,{valid: false}))

  return (request.body || new ReadableStream()).getReader().read()
  .then((body) =>
    tq(verb, params.object, {variant: params.variant, query: body.value?.toString(), login: tessiApp.auth}))
  .then((result) => json(result))
  .catch((e) => error(500, {message: e.message}))
}