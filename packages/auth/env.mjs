import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    AUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
    AUTH_GOOGLE_CLIENT_ID: z.string(),
    AUTH_GOOGLE_CLIENT_SECRET: z.string(),
    AUTH_EMAIL_SERVER_USER: z.string(),
    AUTH_EMAIL_SERVER_PASSWORD: z.string(),
    AUTH_EMAIL_SERVER_HOST: z.string(),
    AUTH_EMAIL_SERVER_PORT: z.string(),
    AUTH_EMAIL_FROM: z.string(),
  },
  client: {},
  runtimeEnv: {
    AUTH_URL: process.env.AUTH_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_CLIENT_ID: process.env.AUTH_GOOGLE_CLIENT_ID,
    AUTH_GOOGLE_CLIENT_SECRET: process.env.AUTH_GOOGLE_CLIENT_SECRET,
    AUTH_EMAIL_SERVER_USER: process.env.AUTH_EMAIL_SERVER_USER,
    AUTH_EMAIL_SERVER_PASSWORD: process.env.AUTH_EMAIL_SERVER_PASSWORD,
    AUTH_EMAIL_SERVER_HOST: process.env.AUTH_EMAIL_SERVER_HOST,
    AUTH_EMAIL_SERVER_PORT: process.env.AUTH_EMAIL_SERVER_PORT,
    AUTH_EMAIL_FROM: process.env.AUTH_EMAIL_FROM,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
