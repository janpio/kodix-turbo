import type { TRPCClientErrorLike } from "@trpc/client";

import type { AppRouter } from "@kdx/api";
import { toast } from "@kdx/ui";

/**
 * @param error: TRPCClientError
 * @description This is the default toast error handler for trpc errors.
 */
export const trpcErrorToastDefault = (
  error: TRPCClientErrorLike<AppRouter>,
) => {
  const zodContentErrors = error.data?.zodError?.fieldErrors.content;
  const zodFormErrors = error.data?.zodError?.formErrors;
  toast.error(
    zodContentErrors?.[0] ??
      zodFormErrors?.[0] ??
      error.message ??
      "Something went wrong, please try again later.",
  );
};
