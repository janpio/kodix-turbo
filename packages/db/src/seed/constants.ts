import { apps } from "./seed";

//* Partners
export const kdxPartnerId = "clh9tiqsj000835711pg3sskn";

//**  	Apps 		 *//
//*     Todo app
export const todoAppId = "clj2117860007skypdpzj0k1u";
export const todoAdminRoleId = "clqfpp3he000008l4hyyg7tdl";

//*     Calendar app
export const calendarAppId = "clohjphbm000008ju6oywfy4i";
export const calendarAdminRoleId = "clqfpp77z000108l4c1je0e5z";

//*     KodixCare app
export const kodixCareAppId = "clj2117860009skyp5e613fih";
export const kodixCareAdminRoleId = "clq5yvcvu000008ia3yppfnou";
export const kodixCarePatientRoleId = "clq5yvhuz000108ia55qk06ts";
export const kodixCareCareGiverRoleId = "clq5yvqdg000208ia3861eyow";

//* TYPES
export type KodixApp = Omit<(typeof apps)[number], "appRoles">;
