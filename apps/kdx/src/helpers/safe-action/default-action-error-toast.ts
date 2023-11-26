import { toast } from "@kdx/ui";

interface ActionResult<Data> {
  data?: Data | undefined;
  serverError?: string | undefined;
  validationError?: Partial<Record<string, string[]>> | undefined;
}
/**
 * @param result The awaited result of a safe-action
 * @returns boolean if there was an error or not.
 * @example //You can do it like this to show a toast on error
 * if (defaultActionToastError(result)) return;
 */
export const defaultSafeActionToastError = <Data>(
  result: ActionResult<Data>,
) => {
  if (result.validationError ?? result.serverError) {
    const errorMessage = result.validationError
      ? Object.values(result.validationError)[0]
      : result.serverError;

    toast.error(errorMessage);
    return true;
  }
  return false;
};
