import { PlanStepAppComponents, PlanStepAppData } from './apps/planStep/planStepPublic';
import { TessituraAppComponents, TessituraAppData } from './apps/tessitura/tessituraPublic';

export const servers = [
    {value: "https://tessi-db-prd1", label: "TESSI-DB-PRD1/Impresario"},
    {value: "https://t-gw-test-b-ex-rest.bam.org/TessituraService", label: "TESSI-TEST-B/Impresario"}
]

export class AppComponents {
    tessitura = new TessituraAppComponents()
    planStep = new PlanStepAppComponents()
}

export class Apps {
    tessitura = new TessituraAppData()
    planStep = new PlanStepAppData()
}
