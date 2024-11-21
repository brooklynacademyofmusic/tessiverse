import { z } from "zod";
 
export const formSchema = z.object({
  username: z.string().min(2).max(64),
  password: z.string().min(2).max(64)
});
