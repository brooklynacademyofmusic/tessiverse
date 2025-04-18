export interface PlanScore extends Plan {
    primary: number
    secondary: number
    tertiary: number
}

export interface Plan {
    campaign: {description: string},
    contributiondesignation: {description: string},
    constituent: {id: number, displayname: string},
    updateddatetime: string,
    id: number
}

export interface Email {
    address: string
}

export interface PlanWorker {
    constituentid: number
}
