import { env } from '$env/dynamic/private'
import { PlanStepAppServer } from './apps/planStep/planStep.server';
import { TessituraAppServer } from './apps/tessitura/tessitura.server';

export const key_vault_url = env.AZURE_KEY_VAULT_URL || "";

export class AppServers {
    tessitura = new TessituraAppServer()
    planStep = new PlanStepAppServer()
} 

