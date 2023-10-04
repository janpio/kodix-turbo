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
  useToast,
} from "@kdx/ui";

import type { RouterInputs } from "~/utils/api";
import { api } from "~/utils/api";
import { RecurrencePicker } from "./recurrence-picker";

type RouterOutput = inferRouterOutputs<AppRouter>;
type CalendarTask = RouterOutput["event"]["getAll"][number];

export function EditEventDialog({
  calendarTask,
  open,
  setOpen,
}: {
  calendarTask: CalendarTask;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const ctx = api.useContext();
  const { toast } = useToast();
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
    onError: (e) => {
      const zodContentErrors = e.data?.zodError?.fieldErrors.content;
      const zodFormErrors = e.data?.zodError?.formErrors;
      toast({
        title:
          zodContentErrors?.[0] ??
          zodFormErrors?.[0] ??
          e.message ??
          "Something went wrong, please try again later.",
        variant: "destructive",
      });
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

  const [title, setTitle] = useState(defaultState.title);
  const [description, setDescription] = useState(defaultState.description);
  const [from, setFrom] = useState(defaultState.from);
  const [frequency, setFrequency] = useState<Frequency>(defaultState.frequency);
  const [interval, setInterval] = useState<number>(defaultState.interval);
  const [until, setUntil] = useState<moment.Moment | undefined>(
    defaultState.until,
  );
  const [count, setCount] = useState<number | undefined>(defaultState.count);
  const [definition, setDefinition] = useState<
    "single" | "thisAndFuture" | "all"
  >("single");

  const allowedEditDefinitions = {
    thisAndFuture: true,
    all: !(
      from.format("YYYY-MM-DD") !== defaultState.from.format("YYYY-MM-DD")
    ),
    single: !(
      count !== defaultState.count ||
      interval !== defaultState.interval ||
      (until && !until?.isSame(defaultState.until)) ||
      frequency !== defaultState.frequency
    ),
  };

  console.log("asd");

  const isFormChanged =
    title !== defaultState.title ||
    description !== defaultState.description ||
    !from.isSame(defaultState.from) ||
    frequency !== defaultState.frequency ||
    interval !== defaultState.interval ||
    until !== defaultState.until ||
    count !== defaultState.count;

  function revertStateToDefault() {
    setTitle(defaultState.title);
    setDescription(defaultState.description);
    setFrom(defaultState.from);
    setFrequency(defaultState.frequency);
    setInterval(defaultState.interval);
    setUntil(defaultState.until);
    setCount(defaultState.count);

    setDefinition("single");
  }

  function handleSubmitFormData() {
    const input: RouterInputs["event"]["edit"] = {
      eventExceptionId: calendarTask.eventExceptionId,
      eventMasterId: calendarTask.eventMasterId,
      selectedTimestamp: calendarTask.date,
      editDefinition: definition,
    };

    if (title !== defaultState.title) input.title = title;
    if (description !== defaultState.description)
      input.description = description;

    if (input.editDefinition === "single") {
      if (!from.isSame(defaultState.from)) input.from = from.toDate();
    }

    if (input.editDefinition === "thisAndFuture") {
      if (!from.isSame(defaultState.from)) input.from = from.toDate();

      if (count !== defaultState.count) input.count = count;
      if (interval !== defaultState.interval) input.interval = interval;
      if (!until?.isSame(defaultState.until)) input.until = until?.toDate();
      if (frequency !== defaultState.frequency) input.frequency = frequency;
    }

    if (input.editDefinition === "all") {
      if (!from.isSame(defaultState.from)) input.from = from.format("HH:mm");

      if (count !== defaultState.count) input.count = count;
      if (interval !== defaultState.interval) input.interval = interval;
      if (!until?.isSame(defaultState.until)) input.until = until?.toDate();
      if (frequency !== defaultState.frequency) input.frequency = frequency;
    }

    editEvent(input);
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
                      onSelect={(date) => {
                        setFrom(
                          moment(date)
                            .hours(from.hours())
                            .minutes(from.minutes()),
                        );
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col space-y-2">
                <Label className="invisible">From</Label>
                <Input
                  type="time"
                  value={from.format("HH:mm")}
                  onChange={(e) => {
                    const newTime = e.target.value;

                    setFrom(
                      moment(from).set({
                        hour: parseInt(newTime.split(":")[0] ?? "0"),
                        minute: parseInt(newTime.split(":")[1] ?? "0"),
                        second: 0,
                        millisecond: 0,
                      }),
                    );
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
  allowedDefinitions: {
    single: boolean;
    thisAndFuture: boolean;
    all: boolean;
  };
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
                {allowedDefinitions.single && (
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
                {allowedDefinitions.thisAndFuture && (
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
                {allowedDefinitions.all && (
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
