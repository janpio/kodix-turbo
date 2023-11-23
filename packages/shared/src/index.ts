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
