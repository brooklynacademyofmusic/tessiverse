import { env } from '$env/dynamic/private'
import type { AppServer } from './apps.server';
import { PlanStepAppServer } from './apps/planStep/planStep.server';
import { TessituraAppServer } from './apps/tessitura/tessitura.server';

export const key_vault_url = env.AZURE_KEY_VAULT_URL || "";

export class AppServers {
    [k: string]: AppServer<any,any>
    tessitura = new TessituraAppServer()
    planStep = new PlanStepAppServer()
} 


