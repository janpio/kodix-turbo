//? Note: anything in this file must be shared between the api and the client

import { z } from "zod";

export const authorizedEmails = [
  "gdbianchii@gmail.com",
  "gabriel@stays.net",
  "wcbianchi@gmail.com",
  "mahadeva@despertar.com.br",
];

export const updateWorkspaceSchema = z.object({
  workspaceId: z.string().cuid(),
  workspaceName: z
    .string()
    .max(32, {
      message: "Workspace name must be at most 32 characters",
    })
    .optional(),
  workspaceUrl: z
    .string()
    .max(48, {
      message: "Workspace url must be at most 48 characters",
    })
    .refine((value) => /^[a-z0-9-]+$/i.test(value) && !/\s/.test(value), {
      message:
        "String cannot contain spaces and must be alphanumeric or contain dashes",
    })
    .transform((value) => value.toLowerCase())
    .optional(),
});
