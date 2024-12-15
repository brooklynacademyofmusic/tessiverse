import { z } from "zod";
export const servers = [
  {value: "https://tessi-db-prd1", label: "TESSI-DB-PRD1/Impresario"},
  {value: "https://t-gw-test-b-ex-rest.bam.org/TessituraService", label: "TESSI-TEST-B/Impresario"}
]  
export type ValidServerValues = {
  [K in keyof typeof servers]: typeof servers[K] extends {value: infer I} ? I : never
}
export const validServerValues = Object.fromEntries(servers.map((e) => [e.label, e.value]))

export const tessituraSchema = z.object({
  tessiApiUrl: z.nativeEnum(validServerValues),
  userid: z.string().min(4).max(64),
  password: z.string().min(4).max(64),
  group: z.string().min(4).max(64)
});

