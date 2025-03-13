import type { RequestHandler } from './$types';
import { planStep, type PlanStepEmail } from '$lib/apps/planStep/planStep.server'
import { error, json } from '@sveltejs/kit';
import * as ERRORS from '$lib/errors'

export const POST: RequestHandler = async ({ request, locals }) => {
    // needs admin because this is transacting as app users
    if (! locals.user.userRoles.includes("admin") ) {
        error(403, ERRORS.LOGIN)
    }
    
    return request.json()
        .then((email: PlanStepEmail) => planStep(email))
        .then((response) => json(response))

}