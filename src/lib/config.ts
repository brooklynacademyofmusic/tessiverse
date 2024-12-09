import { TessituraApp } from './apps/tessitura/tessitura'
import { env } from '$env/dynamic/private'
import { AppBase, type App } from './apps';

export const key_vault_url = env.AZURE_KEY_VAULT_URL || "";
export const admin_auth = env.TQ_ADMIN_LOGIN || "";
export const tessi_api_url = env.TESSI_API_URL || "";
export const tq_login = env.TQ_LOGIN || "";

export const servers = [
    {value: "https://tessi-db-prd1", label: "TESSI-DB-PRD1/Impresario"},
    {value: "https://tessi-test-b", label: "TESSI-TEST-B/Impresario"}
]

export const apps = {
    tessitura: new TessituraApp("tessitura"), 
    planSteps: new AppBase("planSteps")
} 
