"use client";

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import type { inferRouterOutputs } from "@trpc/server";
import { addDays, format } from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PencilIcon,
  Trash2,
} from "lucide-react";

import type { AppRouter } from "@kdx/api";
import {
  Button,
  Calendar,
  cn,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kdx/ui";

import { DataTablePagination } from "../../pagination";
import { CancelationDialog } from "./cancel-event-dialog";
import { EditEventDialog } from "./edit-event-dialog";

type RouterOutput = inferRouterOutputs<AppRouter>;
type CalendarTask = RouterOutput["event"]["getAll"][number];

export function DataTable({
  columns,
  data,
  selectedDate,
  setSelectedDate,
  isLoading,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<CalendarTask, any>[];
  data: CalendarTask[];
  selectedDate: Date | undefined;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  isLoading: boolean;
}) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  return (
    <div className="mt-8">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Label htmlFor="search">Search...</Label>
          <Input
            id="search"
            placeholder="Search by title..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="mt-auto flex space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedDate((prev) => prev && addDays(prev, -1));
            }}
            className="h-10 w-10 p-3"
          >
            <ChevronLeft />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedDate((prev) => prev && addDays(prev, 1));
            }}
            className="h-10 w-10 p-3"
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="invisible space-y-2">
          <Label>Invisible cause Im bat at css...</Label>
          <Input className="max-w-sm" />
        </div>
      </div>

      <div className="mt-4 rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <ContextMenu key={row.id}>
                  <EditEventDialog
                    calendarTask={row.original}
                    open={openEditDialog}
                    setOpen={setOpenEditDialog}
                  />
                  <CancelationDialog
                    open={openCancelDialog}
                    setOpen={setOpenCancelDialog}
                    eventMasterId={row.original.eventMasterId}
                    eventExceptionId={row.original.eventExceptionId}
                    date={row.getValue("date")}
                  />
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => setOpenEditDialog(true)}>
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Edit Event
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setOpenCancelDialog(true)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Event
                    </ContextMenuItem>
                  </ContextMenuContent>
                  <ContextMenuTrigger asChild>
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      key={row.id}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, {
                            ...cell.getContext(),
                          })}
                        </TableCell>
                      ))}
                    </TableRow>
                  </ContextMenuTrigger>
                </ContextMenu>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No events for this day
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="items-center justify-end space-x-2 py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
