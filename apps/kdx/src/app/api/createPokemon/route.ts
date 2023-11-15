import sendEmail from "@kdx/api/src/internal/email/email";
import { prisma } from "@kdx/db";

export async function POST(request: Request) {
  const { pokemon } = (await request.json()) as { pokemon: string[] };

  await prisma.post.createMany({
    data: pokemon.map((x) => ({
      content: x,
      title: x,
    })),
  });

  await sendEmail({
    from: "ChatGPT@kodix.com.br",
    to: "sayhara.fischer.c@gmail.com",
    subject: "Pokemon from ChatGPT",
    html: `Pokemon created on Kodix: ${pokemon.join(", ")}`,
  });

  return Response.json({ pokemon });
}
