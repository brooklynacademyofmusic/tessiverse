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
  let azure = new Azure()
  let user = await azure.load({identity: locals.user.userDetails})
  let tessiApp = new TessituraAppServer(user.apps.tessitura)
  let query = Object.fromEntries(new URL(request.url).searchParams.entries())
  
  return request.text()
    .then((text) => {
      query = text ? Object.assign(query,JSON.parse(text)) : query
      return tq(verb, params.object, {variant: params.variant, query: query, login: tessiApp.auth})})
    .then((result) => json(result))
    .catch((e) => error(500, {message: "Invalid query"}))
}