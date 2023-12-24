//? File for storing schemas for app config
import { z } from "zod";

export const kodixCareConfigSchema = z.object({
  patientName: z.string().or(z.null()),
});
