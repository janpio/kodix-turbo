import { PrismaClient } from "@kdx/db";

const prisma = new PrismaClient();

(async () => {
  const kdxPartnerId = "clh9tiqsj000835711pg3sskn";
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

  const apps = [
    {
      id: "clj2117860007skypdpzj0k1i",
      name: "Todo",
      description: "Todo app",
      subscriptionCost: 0,
      devPartnerId: kdxPartnerId,
      urlApp: "/todo",
    },
    {
      id: "clj2117860009skyp5e613fih",
      name: "Kodix Care",
      description: "Kodix Care app",
      subscriptionCost: 0,
      devPartnerId: kdxPartnerId,
      urlApp: "/kodixCare",
    },
  ];

  for (const app of apps) {
    await prisma.app.upsert({
      where: {
        id: app.id,
      },
      update: {},
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
