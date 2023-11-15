import { prisma } from "@kdx/db";

export async function Post(request: Request) {
  const { pokemon } = (await request.json()) as { pokemon: string };

  const result = await prisma.post.create({
    data: {
      content: "POKEMON FROM CHATGPT: " + pokemon,
      title: pokemon,
    },
  });

  return Response.json({ result });
}
