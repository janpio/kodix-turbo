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
