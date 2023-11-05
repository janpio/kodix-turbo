import Link from "next/link";

import { buttonVariants, cn } from "@kdx/ui";

import MaxWidthWrapper from "~/components/max-width-wrapper";

export default function Layout({
  params,
  children,
}: {
  params: { url: string };
  children: React.ReactNode;
}) {
  const routes = ["/settings"];

  console.log(params.url);

  return (
    <MaxWidthWrapper>
      <div className="flex flex-row">
        <div className="flex flex-col items-center justify-center space-y-2">
          {routes.map((route, i) => (
            <Link
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start font-bold md:w-40",
              )}
              href={`settings/route`}
              key={`${route}${i}`}
            >
              {route.charAt(1).toUpperCase() + route.slice(2)}
            </Link>
          ))}
        </div>
        <div className="hidden w-full text-center md:block">{children}</div>
      </div>
    </MaxWidthWrapper>
  );
}
