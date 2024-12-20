
export const servers = [
    {value: "https://tessi-rest-prd1-ex.bam.org/TessituraService", label: "TESSI-DB-PRD1/Impresario"},
    {value: "https://t-gw-test-b-ex-rest.bam.org/TessituraService", label: "TESSI-TEST-B/Impresario"}
]  
export type ValidServerValues = {
    [K in keyof typeof servers]: typeof servers[K] extends {value: infer I} ? I : never
}
