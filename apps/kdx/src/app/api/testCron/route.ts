import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const config = {
  runtime: "edge",
};

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"), //5 Requests per 1 hour
  analytics: true,
});
export async function GET() {
  await ratelimit.limit(`Cron Job fired at ${new Date().toString()}`);

  return new NextResponse(null, {
    status: 200,
  });
}
