import { TessituraApp } from './apps/tessitura/tessitura'
import { AppBase } from './apps';
import { env } from '$env/dynamic/private'

export const key_vault_url = env.AZURE_KEY_VAULT_URL || "";
export const admin_auth = "";
export const tessi_api_url = env.TESSI_API_URL || "";
export const tq_login = "";

export const servers = [
    {value: "https://tessi-db-prd1", label: "TESSI-DB-PRD1/Impresario"},
    {value: tessi_api_url, label: "TESSI-TEST-B/Impresario"}
]

export const apps = {
    tessitura: new TessituraApp(), 
    // planSteps: new AppBase()
} 
