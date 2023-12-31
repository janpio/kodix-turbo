import { OpenAIStream, StreamingTextResponse } from "ai";
import { Configuration, OpenAIApi } from "openai-edge";

import { env } from "~/env.js";

//import { CorsOptions, setCorsHeaders } from "../_enableCors";

export const runtime = "edge";

const config = new Configuration({
  apiKey: env.STAYS_OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { messages } = await req.json();

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    stream: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    messages,
  });
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
