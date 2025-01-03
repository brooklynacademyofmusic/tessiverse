import { z } from "zod";

export const planStepSchema = z.object({
  stepType: z.number().int().gt(0).or(z.number().int().lt(0)),
  closeStep: z.boolean()
});

