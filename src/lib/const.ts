import { env } from "$env/dynamic/public"

export const servers = JSON.parse(env.PUBLIC_SERVERS || "[]") as ServerArray
type ServerArray = Array<{value: string, label: string}>
export type ValidServerValues = {
    [K in keyof typeof servers]: typeof servers[K] extends {value: infer I} ? I : never
}
