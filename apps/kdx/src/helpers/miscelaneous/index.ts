import type { TRPCClientErrorLike } from "@trpc/client";

import type { AppRouter } from "@kdx/api";
import type { KodixAppId } from "@kdx/shared";
import { calendarAppId, kodixCareAppId, todoAppId } from "@kdx/shared";
import { toast } from "@kdx/ui/toast";

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

const getAppPathname = (appId: KodixAppId) => {
  //? Helper to get the app pathname (for app url or app image url)
  const appIdToPathname = {
    [kodixCareAppId]: "kodixCare",
    [calendarAppId]: "calendar",
    [todoAppId]: "todo",
  };
  return appIdToPathname[appId];
};

/**
 * @description Gets the app url from the app id
 */
export const getAppUrl = (appId: KodixAppId) => {
  const pathname = getAppPathname(appId);
  return `/apps/${pathname}`;
};

/**
 * @description Gets the app
 */
export const getAppIconUrl = (appId: KodixAppId) => {
  const pathname = getAppPathname(appId);
  return `/appIcons/${pathname}.png`;
};
