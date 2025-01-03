import { z } from "zod";

export const planStepSchema = z.object({
  stepType: z.number().int(),
  closeStep: z.boolean()
});

