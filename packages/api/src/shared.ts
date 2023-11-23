//? Note: anything exported in this file must be something that is safe to be shared between the client and the server

import { z } from "zod";

/**
 * @description Base URL for the current environment
 */
export const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

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
});

export const inviteUserSchema = z.object({
  workspaceId: z.string().cuid(),
  to: z
    .string()
    .email()
    .min(1, { message: "At least one email is required in the 'to' field" })
    .or(
      z.string().email().array().min(1, {
        message: "At least one email is required in the 'to' field",
      }),
    )
    .transform((value) => {
      if (Array.isArray(value)) return value;
      else return [value];
    }),
});
