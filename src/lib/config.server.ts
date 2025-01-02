import { env } from '$env/dynamic/private'
import type { AppServer } from './apps.server';
import { PlanStepAppServer } from './apps/planStep/planStep.server';
import { TessituraAppServer } from './apps/tessitura/tessitura.server';
import type { Apps } from '$lib/config';

export const key_vault_url = env.AZURE_KEY_VAULT || "";
export const tq_key_vault_url = env.TQ_KEY_VAULT || "";


type AppServerConstraint<T = Apps> = {
    [K in keyof T]: K extends infer S ? S extends string ? AppServer<S,any,any,any> : never : never
}

export class AppServers implements AppServerConstraint {
    [k: string]: AppServer<string,any,any,any>
    tessitura = new TessituraAppServer()
    planStep = new PlanStepAppServer()
} 

