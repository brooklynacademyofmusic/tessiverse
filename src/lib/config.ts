import { TessituraApp } from './apps/tessitura/tessitura'
import { PlanStepApp } from './apps/planStep/planStep';
import type { App } from './apps';

export const servers = [
    {value: "https://tessi-db-prd1", label: "TESSI-DB-PRD1/Impresario"},
    {value: "https://t-gw-test-b-ex-rest.bam.org/TessituraService", label: "TESSI-TEST-B/Impresario"}
]

export class Apps {
    [x: string]: App
    tessitura = new TessituraApp()
    planStep = new PlanStepApp()
} 