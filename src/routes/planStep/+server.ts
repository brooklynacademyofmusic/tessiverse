import type { RequestHandler } from './$types';
import { planStep, type PlanStepEmail } from '$lib/apps/planStep/planStep.server'
import { error } from '@sveltejs/kit';
import * as ERRORS from '$lib/errors'

export const POST: RequestHandler = async ({ request, locals }) => {
    // needs admin because this is transacting as app users
    if (! locals.user.userRoles.includes("admin") ) {
        error(403, ERRORS.LOGIN)
    }
    return (request.body || new ReadableStream()).getReader().read()
    .then((body) => JSON.parse(body.value?.toString() || "null") as PlanStepEmail)
    .then((email) => planStep(email))
    .then((response) => new Response(response))

}