import { z } from "zod";
import * as config from '$lib/const'

const validServerValues = Object.fromEntries(config.servers.map((e) => [e.label, e.value]))

export const tessituraSchema = z.object({
  tessiApiUrl: z.nativeEnum(validServerValues),
  userid: z.string().min(4).max(64),
  password: z.string().min(4).max(64),
  group: z.string().min(4).max(64)
});

