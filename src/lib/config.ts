import type { App } from './apps';
import { PlanStepApp } from './apps/planStep/planStep';
import { TessituraApp } from './apps/tessitura/tessitura';

type AppConstraint<T = Apps> = {
    [K in keyof T]: K extends infer S ? S extends string ? App<S,any,any> : never : never
}

type AppDataMap = { 
    [K in keyof Apps]: Apps[K]["data"]
}

export class Apps implements AppConstraint {
    tessitura = new TessituraApp()
    planStep = new PlanStepApp()
} 

export const AppsData = Object.fromEntries(Object.entries(new Apps()).map(([k,v]) => [k,v.data])) as AppDataMap