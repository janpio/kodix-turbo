import superjson from "superjson";

export const transformer = superjson;

export const getBaseKdxUrl = () => {
  if (typeof window !== "undefined") return "http://localhost:3000";
  if (process.env.VERCEL_URL) return `https://www.kodix.com.br`;
  return `http://localhost:3000`;
};

export { type RouterInputs, type RouterOutputs } from "@kdx/api";
