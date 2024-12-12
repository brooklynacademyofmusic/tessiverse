import { z } from "zod";

export const planStepSchema = z.object({
  stepType: z.number().min(1).max(255),
  closeStep: z.boolean()
});

