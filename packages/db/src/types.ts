import type { apps } from "./seed/seed";

export type KodixApp = Omit<(typeof apps)[number], "appRoles">;
