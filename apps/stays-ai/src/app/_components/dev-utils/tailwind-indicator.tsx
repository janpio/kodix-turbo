import { networkInterfaces } from "os";
import Image from "next/image";

import { Dialog, DialogContent, DialogTrigger } from "@kdx/ui";

const url =
  networkInterfaces().Ethernet?.find((x) => x.family === "IPv4")?.address +
  ":" +
  "3001";

export function TailwindIndicator() {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="fixed bottom-1 right-1 z-50 flex flex-row items-center space-x-1">
          <div className="bg-foreground text-background flex h-6 w-6 items-center justify-center rounded-full p-3 font-mono text-xs font-bold">
            <div className="block sm:hidden">xs</div>
            <div className="hidden sm:block md:hidden lg:hidden xl:hidden 2xl:hidden">
              sm
            </div>
            <div className="hidden md:block lg:hidden xl:hidden 2xl:hidden">
              md
            </div>
            <div className="hidden lg:block xl:hidden 2xl:hidden">lg</div>
            <div className="hidden xl:block 2xl:hidden">xl</div>
            <div className="hidden 2xl:block">2xl</div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-h-fit max-w-fit">
        <Image
          alt="QR Code"
          width={150}
          height={150}
          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://${url}`}
        ></Image>
      </DialogContent>
    </Dialog>
  );
}
