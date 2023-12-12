import { prisma } from "..";

const kdxPartnerId = "clh9tiqsj000835711pg3sskn";
const apps = [
  {
    id: "clj2117860007skypdpzj0k1u", //As const so it can be used as a type
    name: "Todo" as const,
    description: "Todo app" as const,
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
    url: "/todo" as const, //! Used as appIcon import (e.g.: /appIcons/todo.png)
  },
  {
    id: "clohjphbm000008ju6oywfy4i",
    name: "Calendar" as const,
    description: "Calendar app" as const,
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
    url: "/calendar" as const,
  },
  {
    id: "clj2117860009skyp5e613fih",
    name: "Kodix Care" as const,
    description: "Kodix Care app" as const,
    subscriptionCost: 0 as const,
    devPartnerId: kdxPartnerId,
    url: "/kodixCare" as const,
    appRoles: {
      create: [
        {
          roleName: "Admin",
          minRoleUsers: 0,
          maxRoleUsers: 0,
        },
        {
          roleName: "Patient",
          minRoleUsers: 1,
          maxRoleUsers: 1,
        },
        {
          roleName: "CareGiver",
          minRoleUsers: 1,
          maxRoleUsers: 0,
        },
      ],
    },
  },
];

export type KodixApp = Omit<(typeof apps)[number], "appRoles">;

(async () => {
  console.log("Seeding...");

  await prisma.devPartner.upsert({
    where: {
      id: kdxPartnerId,
    },
    update: {},
    create: {
      id: kdxPartnerId,
      name: "Kodix",
      partnerUrl: "kodix.com.br",
    },
  });

  for (const app of apps) {
    await prisma.app.upsert({
      where: {
        id: app.id,
      },
      update: app,
      create: app,
    });
  }
})()
  .then(() => {
    console.log("Done!");
  })
  .catch((e: Error) => {
    console.error(e.message);
  });
