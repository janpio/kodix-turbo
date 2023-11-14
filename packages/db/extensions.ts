import { camelCase } from "string-ts";

import { Prisma } from ".prisma/client";

export function _wsPrisma(workspaceId: string) {
  return Prisma.defineExtension((prisma) => {
    return prisma.$extends({
      name: "wsPrisma", //Optional: name appears in errorLogs
      query: {
        $allModels: {
          async $allOperations({ query, args, model, operation }) {
            const camelCaseModel = camelCase(model);
            if ("workspaceId" in prisma[camelCaseModel].fields) {
              if (operation !== "createMany" && operation !== "create") {
                args.where = {
                  ...args.where,
                  workspaceId,
                };
              }
            }
            return query(args);
          },
        },
      },
    });
  });
}
