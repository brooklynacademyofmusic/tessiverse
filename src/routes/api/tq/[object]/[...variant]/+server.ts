import type { RequestHandler, RouteParams } from './$types';
import { error } from '@sveltejs/kit';
import * as ERRORS from '$lib/errors'
import { tq } from '$lib/tq'
import { User } from '$lib/user'

export const GET: RequestHandler = ({params, request, locals}) => {
  return tq_verb("get", params, request, locals)
}

export const POST: RequestHandler = ({params, request, locals}) => {
  return tq_verb("post", params, request, locals)}

export const PUT: RequestHandler = ({params, request, locals}) => {
  return tq_verb("put", params, request, locals)}

async function tq_verb(verb: string, params: RouteParams, request: Request, locals: App.Locals): Promise<Response> {
  if (!locals.user.userId) {
    error(401, ERRORS.AUTH)
  } 
  let user = await new User(locals.user.userid).load()

  return (request.body || new ReadableStream()).getReader().read()
  .then((body) =>
    tq(verb, params.object, params.variant, body.value?.toString(), user.auth))
  .then((result) => new Response(result))
  .catch((e) => error(500, {message: e.message}))
}