import { useState } from "react";
import { HiUserCircle } from "react-icons/hi";

import type { User } from "@kdx/db";
import {
  AvatarWrapper,
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kdx/ui";

/**
 * @description You can optionally input a button to overwrite the default button trigger.
 */
export function AssigneePopover({
  assignedToUserId,
  setAssignedToUserId,
  users,
  children,
}: {
  assignedToUserId: string | null;
  setAssignedToUserId: (newUserId: string | null) => void;
  users: User[];
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const user = (users ?? []).find((x) => x.id === assignedToUserId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ? (
          children
        ) : user ? (
          <div>
            <AvatarWrapper
              className="h-6 w-6"
              alt={user?.name ? user.name + " avatar" : ""}
              src={user?.image ?? undefined}
              fallback={user.name}
            />
          </div>
        ) : (
          <div>
            <HiUserCircle className="text-foreground/70 h-6 w-6" />
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-300 p-0" side="bottom" align={"start"}>
        <Command>
          <CommandInput placeholder="Assign to user..." />
          <CommandList
            onSelect={() => {
              setOpen(false);
            }}
          >
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setAssignedToUserId(null);
                  setOpen(false);
                }}
              >
                <HiUserCircle className="mr-2 h-4 w-4" />
                Unassigned
              </CommandItem>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => {
                    setAssignedToUserId(user.id);
                    setOpen(false);
                  }}
                  value={user.id}
                >
                  <AvatarWrapper
                    className="mr-2 h-4 w-4"
                    src={user.image ?? ""}
                    alt={user.image ?? "" + " avatar"}
                    fallback={<HiUserCircle className="mr-2 h-4 w-4" />}
                  />
                  {user.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
