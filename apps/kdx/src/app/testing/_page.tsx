import React from "react";

import { helpers } from "~/utils/serverHelper";
import Client from "./Client";
import { DialogProvider } from "./Contexts/DialogContexts";

export default async function Testing() {
  await helpers.app.getAll.prefetch();

  return (
    <DialogProvider>
      <div className="mx-20 border-spacing-3 border border-red-200 p-4">
        <p className="my-4 text-red-300">
          Hi! I am inside react Server Component
        </p>

        <Client />

        {/* <Suspense
          fallback={
            <div className="my-4 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          }
        >
          <GithubUser username="dbianchii" />;
        </Suspense> */}
        {/* <button onClick={() => alert("hi")}></button> */}
      </div>
    </DialogProvider>
  );
}
