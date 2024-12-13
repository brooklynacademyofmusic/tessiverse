import type { RequestHandler } from './$types';
import { planStep, type PlanStepEmail } from '$lib/apps/planStep/planStep'
import { error } from '@sveltejs/kit';
import * as ERRORS from '$lib/errors'

export const POST: RequestHandler = async ({ request, locals }) => {
    if (! ("admin" in locals.user.userRoles)) {
        error(403, ERRORS.AUTH)
    }
    return (request.body || new ReadableStream()).getReader().read()
    .then((body) => JSON.parse(body.value?.toString() || "null") as PlanStepEmail)
    .then((email) => planStep(email))
    .then((response) => new Response(response))

}