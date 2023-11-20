import { z } from "zod";

import sendEmail from "@kdx/api/src/internal/email/email";

export async function POST(request: Request) {
  const { pokemon, email } = (await request.json()) as {
    pokemon: string[];
    email: string;
  };

  const schema = z.object({
    pokemon: z.array(z.string()),
    email: z.string().email(),
  });
  const result = schema.safeParse({ pokemon, email });

  if (!result.success)
    return Response.json(result.error.message, { status: 400 });

  sendEmail({
    from: "ChatGPT@kodix.com.br",
    to: email,
    subject: "Pokemon from ChatGPT",
    react: <h1>Pokemon created on Kodix: ${pokemon.join(", ")}</h1>,
  });

  return Response.json({ pokemon });
}
