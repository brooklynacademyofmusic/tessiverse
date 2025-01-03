import { env } from '$env/dynamic/private'
import type { AppServer } from './apps.server';
import { PlanStepAppServer } from './apps/planStep/planStep.server';
import { TessituraAppServer } from './apps/tessitura/tessitura.server';
import type { Apps } from '$lib/config';
import { TessituraApp } from './apps/tessitura/tessitura';
import { PlanStepApp } from './apps/planStep/planStep';

export const key_vault_url = env.AZURE_KEY_VAULT || "";
export const tq_key_vault_url = env.TQ_KEY_VAULT || "";


type AppServerConstraint = {
    [K in keyof Apps]: AppServer<Apps[K],any>
}

export class AppServers implements AppServerConstraint {
    tessitura = new TessituraAppServer(new TessituraApp().data)
    planStep = new PlanStepAppServer(new PlanStepApp().data)
} 

