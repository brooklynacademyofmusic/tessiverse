import type { RequestHandler } from './$types';
import { planStep, type PlanStepEmail } from '$lib/apps/planStep/planStep.server'
import { error } from '@sveltejs/kit';
import * as ERRORS from '$lib/errors'
import type { PlanStepAppData } from '$lib/apps/planStep/planStep';

export const POST: RequestHandler = async ({ request, locals }) => {
    // needs admin because this is transacting as app users
    if (! locals.user.userRoles.includes("admin") ) {
        error(403, ERRORS.LOGIN)
    }
    return request.json()
    .then((email: PlanStepEmail) => planStep(email))
    .then((response: PlanStepAppData["history"][0]) => new Response(JSON.stringify(response)))

}