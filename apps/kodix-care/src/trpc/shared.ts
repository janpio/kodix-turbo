import superjson from "superjson";

export const transformer = superjson;

export const getBaseUrl = () => {
  if (process.env.NODE_ENV === "production") return `https://www.kodix.com.br`; // SSR in production should use vercel url
  if (typeof window !== "undefined") return `http://localhost:3000`; // browser should use localhost:3000
  return `http://localhost:3000`; // dev SSR should use localhost
};

export { type RouterInputs, type RouterOutputs } from "@kdx/api";
