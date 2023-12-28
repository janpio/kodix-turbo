import Link from "next/link";

import { auth } from "@kdx/auth";
import { buttonVariants } from "@kdx/ui";

import HeaderFooterRemover from "~/app/[lang]/_components/header-footer-remover";
import MaxWidthWrapper from "~/app/[lang]/_components/max-width-wrapper";
import { UserProfileButton } from "./user-profile-button";

export async function Header() {
  const session = await auth();

  return (
    <HeaderFooterRemover>
      <header className="border-b py-4">
        <MaxWidthWrapper className="max-w-screen-2xl">
          <div className="mx-auto flex max-w-screen-2xl items-center">
            <Link
              href={session ? "/team" : "/"}
              className="text-bold text-primary text-xl font-medium"
            >
              <span className="hidden bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text font-extrabold tracking-tight text-transparent md:block">
                Kodix
              </span>
              <span className="block bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text font-extrabold tracking-tight text-transparent md:hidden">
                Kdx
              </span>
            </Link>
            {/* {session && (
              //Slash icon
              <>
                <svg
                  className="text-[#eaeaea] dark:text-[#333]"
                  data-testid="geist-icon"
                  fill="none"
                  height="24"
                  shapeRendering="geometricPrecision"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M16.88 3.549L7.12 20.451"></path>
                </svg>
                <TeamSwitcher
                  session={session}
                  teams={teams}
                  avatar={
                    <AvatarWrapper
                      className="mr-2 h-5 w-5"
                      src={`${getBaseUrl()}/api/avatar/${
                        session.user.activeTeamName
                      }`}
                      alt={session.user.activeTeamName}
                      fallback={session.user.activeTeamName}
                    />
                  }
                />
              </>
            )} */}

            <div className="ml-auto flex items-center space-x-4">
              {!!session && <UserProfileButton session={session} />}
              {!session && (
                <div className="mr-5 space-x-2">
                  <Link
                    href="/signin"
                    className={buttonVariants({ variant: "ghost" })}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signin"
                    className={buttonVariants({ variant: "default" })}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </HeaderFooterRemover>
  );
}

// async function MainNav() {
//   const session = await auth();
//   const navigation: {
//     href: string;
//     title: string;
//     shown: boolean;
//   }[] = [
//     {
//       href: "/marketplace",
//       title: "Marketplace",
//       shown: true,
//     },
//     {
//       href: "/apps",
//       title: "Apps",
//       shown: !!session,
//     },
//   ];

//   return (
//     <NavigationMenu className="space-x-1">
//       {navigation
//         .filter((x) => x.shown)
//         .map((item) => (
//           <NavigationMenuList key={item.href}>
//             <NavigationMenuItem>
//               <Link href={item.href} legacyBehavior passHref>
//                 <NavigationMenuLink
//                   className={cn(navigationMenuTriggerStyle())}
//                 >
//                   {item.title}
//                 </NavigationMenuLink>
//               </Link>
//             </NavigationMenuItem>
//           </NavigationMenuList>
//         ))}
//     </NavigationMenu>
//   );
// }
