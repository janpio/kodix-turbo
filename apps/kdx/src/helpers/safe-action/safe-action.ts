import type { typeToFlattenedError } from "zod";
import { TRPCClientError } from "@trpc/client";
import { createSafeActionClient } from "next-safe-action";

//? This is from https://next-safe-action.dev/docs/getting-started
export const action = createSafeActionClient({
  // Can also be an async function.
  handleReturnedServerError(error) {
    let message = error.message;

    //? This is a super hacky and weird solution i found to get the error message from inside
    //? trpc's zod error. This is not the logic for the server action's zod.
    interface TrpcErrorData {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      zodError?: typeToFlattenedError<any, string>;
      code: string;
      httpStatus: number;
      path: string;
      stack: string;
    }
    if (error instanceof TRPCClientError && typeof error.data === "object") {
      const data = error.data as TrpcErrorData;
      if (data.zodError) {
        const firstZodContentError = Object.values(
          data?.zodError?.fieldErrors,
        )?.[0]?.[0];
        const firstZodFormError = Object.values(
          data?.zodError?.formErrors,
        )?.[0]?.[0];

        message = firstZodContentError ?? firstZodFormError ?? message;
      }
    }

    return {
      serverError: message ?? "Something went wrong, please try again later.",
    };
  },
  handleServerErrorLog(error) {
    // We can, for example, also send the error to a dedicated logging system.
    // reportToErrorHandlingSystem(e);
    console.error(error);
  },
});
