import type { PageServerLoad } from "./$types"

type TestResult = {
    status: boolean
    error: any
}

export const load: PageServerLoad = async () => {
    return {
        "Azure key vault access": true,
        "tq exists": false,
        "tq is executable": false,
        "tq admin is configured": false,
        "can reach Tessitura": false,
        "tq admin is valid": false,
        "can query Tessitura": false
    } as Record<string,TestResult>
}