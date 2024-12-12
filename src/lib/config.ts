import { TessituraApp } from './apps/tessitura/tessitura'
import { AppBase } from './apps';
import { env } from '$env/dynamic/private'
import { PlanStepApp } from './apps/planStep/planStep';

export const key_vault_url = env.AZURE_KEY_VAULT_URL || "";
export const admin_auth = "";
export const tessi_api_url = env.TESSI_API_URL || "";
export const tq_login = "";

export const servers = [
    {value: "https://tessi-db-prd1", label: "TESSI-DB-PRD1/Impresario"},
    {value: "https://t-gw-test-b-ex-rest.bam.org/TessituraService", label: "TESSI-TEST-B/Impresario"}
]

export const apps = {
    tessitura: new TessituraApp(), 
    planStep: new PlanStepApp()
} 
