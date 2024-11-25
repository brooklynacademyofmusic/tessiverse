import { z } from "zod";
 
export const formSchema = z.object({
  tessiApiUrl: z.string().min(4).max(64),
  userid: z.string().min(4).max(64),
  password: z.string().min(4).max(64),
  group: z.string().min(4).max(64)
});