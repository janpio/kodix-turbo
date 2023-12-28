import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import type { RouterInputs, RouterOutputs } from "@kdx/api";
import {
  AvatarWrapper,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui";

const columnHelper =
  createColumnHelper<RouterOutputs["team"]["invitation"]["getAll"][number]>();

export const inviteColumns = ({
  mutate,
}: {
  mutate: (input: RouterInputs["team"]["invitation"]["delete"]) => void;
}) => [
  columnHelper.accessor("inviteEmail", {
    header: (info) => {
      return (
        <div className="flex items-center space-x-8">
          <Checkbox
            checked={info.table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              info.table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
          <div className="text-muted-foreground">Select all</div>
        </div>
      );
    },
    cell: (info) => (
      <div className="flex flex-row space-x-8">
        <div className="flex flex-col items-center justify-center">
          <Checkbox
            checked={info.row.getIsSelected()}
            onCheckedChange={(value) => info.row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
        <div className="flex flex-col">
          <AvatarWrapper className="h-8 w-8" fallback={info.getValue()} />
        </div>
        <div className="flex flex-col items-start">
          <span className="font-bold">
            {info.cell.row.original.inviteEmail}
          </span>
          <span className="text-muted-foreground">{info.getValue()}</span>
        </div>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  }),
  columnHelper.accessor("inviteId", {
    header: () => null,
    cell: (info) => {
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onSelect={() => {
                  mutate({
                    invitationId: info.row.original.inviteId,
                  });
                }}
              >
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  }),
];
