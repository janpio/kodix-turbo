import { Prisma } from "./index";

export function safeTeamPrisma(teamId: string) {
  return Prisma.defineExtension((prisma) => {
    return prisma.$extends({
      name: "safeTeamPrisma", //Optional: name appears in errorLogs
      query: {
        $allModels: {
          async $allOperations({ query, args, model, operation }) {
            if (operation === "create" || operation === "createMany")
              return query(args);

            switch (model) {
              case "EventMaster":
              case "AppTeamConfig":
              case "UserAppRole":
              case "Invitation":
              case "Todo":
                args.where = {
                  ...args.where,
                  teamId: teamId,
                };
                break;

              case "AppRole":
                args.where = {
                  ...args.where,
                  UserAppRole: {
                    some: {
                      teamId: teamId,
                    },
                  },
                };
                break;
              case "App":
                args.where = {
                  ...args.where,
                  activeTeams: {
                    some: {
                      id: teamId,
                    },
                  },
                };
                break;

              case "EventException":
              case "EventCancellation":
              case "EventDone":
                args.where = {
                  ...args.where,
                  EventMaster: {
                    teamId: teamId,
                  },
                };
                break;
            }

            return query(args);
          },
        },
      },
    });
  });
}
