"use client";

import { useEffect, useMemo, useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import moment from "moment";
import { RRule } from "rrule";
import type { Frequency } from "rrule";

import type { AppRouter } from "@kdx/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Calendar,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kdx/ui";

import { api } from "~/utils/api";
import RecurrencePicker from "./RecurrencePicker";

type RouterOutput = inferRouterOutputs<AppRouter>;
type CalendarTask = RouterOutput["event"]["getAll"][number];

export default function EditEventDialog({
  calendarTask,
  open,
  setOpen,
}: {
  calendarTask: CalendarTask;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const ctx = api.useContext();
  const { mutate: editEvent } = api.event.edit.useMutation({
    onMutate: () => {
      setButtonLoading(true);
    },
    onSuccess: () => {
      void ctx.event.getAll.invalidate();
      setOpen(false);
    },
    onSettled: () => {
      setButtonLoading(false);
    },
  });
  const [buttonLoading, setButtonLoading] = useState(false);
  const [personalizedRecurrenceOpen, setPersonalizedRecurrenceOpen] =
    useState(false);
  const [editDefinitionOpen, setEditDefinitionOpen] = useState(false);

  const defaultState = useMemo(() => {
    return {
      calendarTask: calendarTask,
      title: calendarTask.title,
      description: calendarTask.description ?? "",
      from: moment(calendarTask.date),
      time: moment(calendarTask.date).format("HH:mm"),
      frequency: RRule.fromString(calendarTask.rule).options.freq,
      interval: RRule.fromString(calendarTask.rule).options.interval,
      until: RRule.fromString(calendarTask.rule).options.until
        ? moment(RRule.fromString(calendarTask.rule).options.until)
        : undefined,
      count: RRule.fromString(calendarTask.rule).options.count ?? undefined,
    };
  }, [calendarTask]);
  console.log(defaultState);

  const [title, setTitle] = useState(defaultState.title);
  const [description, setDescription] = useState(defaultState.description);
  const [from, setFrom] = useState(defaultState.from);
  const [time, setTime] = useState(defaultState.time);
  const [frequency, setFrequency] = useState<Frequency>(defaultState.frequency);
  const [interval, setInterval] = useState<number>(defaultState.interval);
  const [until, setUntil] = useState<moment.Moment | undefined>(
    defaultState.until,
  );
  const [count, setCount] = useState<number | undefined>(defaultState.count);
  const [definition, setDefinition] = useState<
    "single" | "thisAndFuture" | "all"
  >("single");
  const [allowedEditDefinitions, setAllowedEditDefinitions] = useState<
    ("single" | "thisAndFuture" | "all")[]
  >(["single", "thisAndFuture", "all"]);

  const [isFormChanged, setIsFormChanged] = useState(false);

  useEffect(() => {
    setFrom((prev) =>
      prev.set({
        hour: parseInt(time.split(":")[0] ?? "0"),
        minute: parseInt(time.split(":")[1] ?? "0"),
        second: 0,
        millisecond: 0,
      }),
    );
    // setUntil((prev) =>
    //   prev?.set({
    //     hour: parseInt(time.split(":")[0] ?? "0"),
    //     minute: parseInt(time.split(":")[1] ?? "0"),
    //     second: 0,
    //     millisecond: 0,
    //   })
    // );
  }, [from, until, time]);

  useEffect(() => {
    if (!allowedEditDefinitions.includes("single"))
      setDefinition("thisAndFuture");
    else setDefinition("single");
  }, [allowedEditDefinitions]);

  useEffect(() => {
    const isChanged =
      title !== defaultState.title ||
      description !== defaultState.description ||
      !from.isSame(defaultState.from) ||
      time !== defaultState.time ||
      frequency !== defaultState.frequency ||
      interval !== defaultState.interval ||
      until !== defaultState.until ||
      count !== defaultState.count;
    setIsFormChanged(isChanged);

    if (
      count !== defaultState.count ||
      interval !== defaultState.interval ||
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      (until && !until?.isSame(defaultState.until)) ||
      frequency !== defaultState.frequency
    ) {
      setAllowedEditDefinitions((prev) =>
        prev.filter((item) => item !== "single"),
      );
    } else {
      setAllowedEditDefinitions((prev) => {
        !prev.includes("single") && prev.push("single");
        return prev;
      });
    }
    if (!from.isSame(defaultState.from)) {
      setAllowedEditDefinitions((prev) =>
        prev.filter((item) => item !== "all"),
      );
    } else {
      setAllowedEditDefinitions((prev) => {
        !prev.includes("all") && prev.push("all");
        return prev;
      });
    }
  }, [
    title,
    description,
    from,
    time,
    frequency,
    interval,
    until,
    count,
    defaultState.title,
    defaultState.description,
    defaultState.from,
    defaultState.time,
    defaultState.frequency,
    defaultState.interval,
    defaultState.until,
    defaultState.count,
  ]);

  // const defaultState = {
  //   calendarTask: calendarTask,
  //   title: calendarTask.title,
  //   description: calendarTask.description ?? "",
  //   from: moment(calendarTask.date),
  //   time: moment(calendarTask.date).format("HH:mm"),
  //   frequency: RRule.fromString(calendarTask.rule).options.freq,
  //   interval: RRule.fromString(calendarTask.rule).options.interval,
  //   until: RRule.fromString(calendarTask.rule).options.until
  //     ? moment(RRule.fromString(calendarTask.rule).options.until)
  //     : undefined,
  // };
  // const [formData, setFormData] = useState<{
  //   calendarTask: CalendarTask;
  //   title: string;
  //   description: string;
  //   from: moment.Moment;
  //   time: string;
  //   frequency: Frequency;
  //   interval: number;
  //   until: moment.Moment | undefined;
  // }>(defaultState);

  function revertStateToDefault() {
    setTitle(defaultState.title);
    setDescription(defaultState.description);
    setFrom(defaultState.from);
    setTime(defaultState.time);
    setFrequency(defaultState.frequency);
    setInterval(defaultState.interval);
    setUntil(defaultState.until);
    setCount(defaultState.count);
    setDefinition("single");

    setAllowedEditDefinitions(["single", "thisAndFuture", "all"]);
  }

  function handleSubmitFormData() {
    const idObj = calendarTask.eventExceptionId
      ? { eventExceptionId: calendarTask.eventExceptionId }
      : { eventMasterId: calendarTask.eventMasterId };

    editEvent({
      ...idObj,
      selectedTimestamp: calendarTask.date,
      title: title !== defaultState.title ? title : undefined,
      description:
        description !== defaultState.description ? description : undefined,
      from: !from.isSame(defaultState.from)
        ? from
            .set({
              hour: parseInt(time.split(":")[0] ?? "0"),
              minute: parseInt(time.split(":")[1] ?? "0"),
              second: 0,
              millisecond: 0,
            })
            .toDate()
        : undefined,
      until:
        until && until.isSame(defaultState.until) ? until.toDate() : undefined,
      frequency: frequency !== defaultState.frequency ? frequency : undefined,
      interval: interval !== defaultState.interval ? interval : undefined,
      editDefinition: definition,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(openDialog) => {
        if (!openDialog) revertStateToDefault(); //Revert the data back to default when closing
        setOpen(openDialog);
      }}
    >
      <DialogContent className="mb-64 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="space-y-4">
            <div className="flex flex-row gap-2">
              <Input
                placeholder="Event title..."
                onChange={(e) => setTitle(e.target.value)}
                value={title ?? ""}
              />
            </div>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col space-y-2">
                <Label>From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[200px] pl-3 text-left font-normal",
                        !from && "text-muted-foreground",
                      )}
                    >
                      {from ? (
                        format(from.toDate(), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={from.toDate()}
                      onSelect={(date) =>
                        date &&
                        setFrom(
                          moment(date).set({
                            hour: parseInt(time.split(":")[0] ?? "0"),
                            minute: parseInt(time.split(":")[1] ?? "0"),
                            second: 0,
                            millisecond: 0,
                          }),
                        )
                      }
                      // disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col space-y-2">
                <Label className="invisible">From</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                  }}
                  className="w-26"
                />
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <RecurrencePicker
                open={personalizedRecurrenceOpen}
                setOpen={setPersonalizedRecurrenceOpen}
                interval={interval}
                setInterval={setInterval}
                frequency={frequency}
                setFrequency={setFrequency}
                until={until}
                setUntil={setUntil}
                count={count}
                setCount={setCount}
              />
            </div>
            <Textarea
              placeholder="Add description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></Textarea>
          </div>
        </DialogDescription>
        <DialogFooter>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={buttonLoading || !isFormChanged}
                    onClick={() => setEditDefinitionOpen(true)}
                  >
                    {buttonLoading ? (
                      <Loader2 className="mx-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>OK</>
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent hidden={isFormChanged}>
                <p>Please change some data in order to accept the changes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DialogFooter>
        <EditDefinitionDialog
          open={editDefinitionOpen}
          setOpen={setEditDefinitionOpen}
          definition={definition}
          setDefinition={setDefinition}
          allowedDefinitions={allowedEditDefinitions}
          submit={handleSubmitFormData}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditDefinitionDialog({
  open,
  setOpen,
  definition,
  setDefinition,
  allowedDefinitions,
  submit,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  definition: "single" | "thisAndFuture" | "all";
  setDefinition: React.Dispatch<
    React.SetStateAction<"single" | "thisAndFuture" | "all">
  >;
  allowedDefinitions: ("single" | "thisAndFuture" | "all")[];
  submit: (definition: "single" | "thisAndFuture" | "all") => void;
}) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(boolean) => {
        setOpen(boolean);
        if (!boolean) setDefinition("single"); //Revert the data back to default when closing
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit recurrent event</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="my-6">
              <RadioGroup
                className="flex flex-col space-y-2"
                defaultValue={definition}
              >
                {allowedDefinitions.includes("single") && (
                  <div className="flex">
                    <RadioGroupItem
                      id="single"
                      value={"single"}
                      onClick={() => {
                        setDefinition("single");
                      }}
                      checked={definition === "single"}
                    />
                    <Label htmlFor="single" className="ml-2">
                      This event
                    </Label>
                  </div>
                )}
                {allowedDefinitions.includes("thisAndFuture") && (
                  <div className="flex">
                    <RadioGroupItem
                      id="thisAndFuture"
                      value={"thisAndFuture"}
                      checked={definition === "thisAndFuture"}
                      onClick={() => {
                        setDefinition("thisAndFuture");
                      }}
                    />
                    <Label htmlFor="thisAndFuture" className="ml-2">
                      This and future events
                    </Label>
                  </div>
                )}
                {allowedDefinitions.includes("all") && (
                  <div className="flex">
                    <RadioGroupItem
                      id="all"
                      value={"all"}
                      checked={definition === "all"}
                      onClick={() => {
                        setDefinition("all");
                      }}
                    />
                    <Label htmlFor="all" className="ml-2">
                      All events
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-background">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              submit(definition);
            }}
          >
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
