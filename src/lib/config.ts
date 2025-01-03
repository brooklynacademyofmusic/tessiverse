import type { App } from './apps';
import { PlanStepApp } from './apps/planStep/planStep';
import { TessituraApp } from './apps/tessitura/tessitura';

type AppConstraint<T = Apps> = {
    [K in keyof T]: K extends infer S ? S extends string ? App<S,any,any> : never : never
}
export class Apps implements AppConstraint {
    tessitura = new TessituraApp()
    planStep = new PlanStepApp()
} 
