import type { Component } from 'svelte'
import type { Action } from '@sveltejs/kit'
import { TessituraConfig } from './apps/tessitura/tessitura.schema'

export const servers = [
    {value: "https://tessi-db-prd1", label: "TESSI-DB-PRD1/Impresario"},
    {value: "https://tessi-test-b", label: "TESSI-TEST-B/Impresario"}
]

export const admin_auth = ''

export interface AppConfig {
    title: string 
    card: Partial<Component>
    config: Partial<Component>
    action: Action
}

export const apps: Record<string, AppConfig> = {
    tessitura: new TessituraConfig(),
    planSteps: new TessituraConfig(),
} 

