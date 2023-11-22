import crypto from "crypto";

/**
 * @description Base URL for the KDX server
 * @usedBy kdx/stays-ai kdx/kodix-care kdx/api
 */
export const getBaseKdxUrl = () => {
  if (typeof window !== "undefined") return "http://localhost:3000";
  if (process.env.VERCEL_URL) return `https://www.kodix.com.br`;
  return `http://localhost:3000`;
};

/**
 * @description Converts a string to a URL-friendly string
 * @usedBy kdx/auth kdx/api
 */
export const toUrlFriendly = (name: string) =>
  name
    .normalize("NFD") // Normalize the string to decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase() // Convert to lowercase
    .trim() // Remove whitespace from both ends of the string
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ""); // Remove all non-alphanumeric characters except hyphens

/**
 * @description Converts a string to a URL-friendly string with tandom characters at the end
 * @usedBy kdx/auth kdx/api
 */
export const toUrlFriendlyWithRandom = (name: string) =>
  `${toUrlFriendly(name)}-${crypto.randomBytes(4).toString("hex")}`;

/**
 * @description Extracts successes and errors from promise.allSettled in a typesafe maner
 * @usedBy kdx/api
 */
export const getSuccessesAndErrors = <T>(
  results: PromiseSettledResult<T>[],
) => {
  const errors = results.filter((x) => x.status === "rejected");
  const successes = results.filter(
    (x): x is PromiseFulfilledResult<T> => x.status === "fulfilled",
  );

  return { successes, errors };
};
