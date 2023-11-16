import { getBaseUrl } from "@kdx/api/src/shared";
import { auth } from "@kdx/auth";
import { AvatarWrapper } from "@kdx/ui";

import { GradientHero } from "./_components/gradient-hero";

export default async function Home() {
  const session = await auth();

  return (
    <div className="h-144 flex min-h-screen flex-col items-center gap-12 px-4 py-16">
      <h1 className="text-primary scroll-m-20 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent lg:text-8xl">
        Welcome to Kodix
      </h1>
      <div></div>
      {session && (
        <div className="text-center">
          <p className="font-italic italic">You are on</p>
          <div className="flex">
            <AvatarWrapper
              className="mr-2 h-5 w-5"
              src={`${getBaseUrl()}/api/avatar/${
                session.user.activeWorkspaceName
              }`}
              alt={session.user.activeWorkspaceName}
              fallback={session.user.activeWorkspaceName}
            />
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text font-bold">
              {session.user.activeWorkspaceName}
            </span>
          </div>
        </div>
      )}
      <GradientHero />
    </div>
  );
}
