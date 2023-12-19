import { z } from "zod";

/**
 * @description Schema for validating workspace updates
 * @usedBy kdx/api kdx/kdx
 */
export const updateWorkspaceSchema = z.object({
  workspaceId: z.string().cuid(),
  workspaceName: z
    .string()
    .min(3, { message: "Workspace name must be at least 3 characters" })
    .max(32, {
      message: "Workspace name must be at most 32 characters",
    })
    .optional(),
});

/**
 * @description Schema for validating user invitation
 * @usedBy kdx/api kdx/kdx
 */
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
