"use client";

import { useState } from "react";
import { CalendarDateTime } from "@internationalized/date";
import { Loader2, Plus } from "lucide-react";
import moment from "moment";
import type { DateValue } from "react-aria";
import { RRule } from "rrule";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Textarea,
  useToast,
} from "@kdx/ui";

import { DateTimePicker } from "~/components/date-time-picker/date-time-picker";
import { api } from "~/trpc/react";
import { RecurrencePicker } from "./recurrence-picker";

export function CreateEventDialogButton() {
  const [open, setOpen] = useState(false);
  const ctx = api.useContext();
  const { toast } = useToast();
  const { mutate: createEvent } = api.event.create.useMutation({
    onMutate: () => {
      setButtonLoading(true);
    },
    onSuccess: () => {
      void ctx.event.getAll.invalidate();
      revertStateToDefault();
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

  const defaultState = {
    title: "",
    description: "",
    from: moment(new Date())
      .add(1, "M") //IDK why we need to do this...
      .startOf("hour")
      .hours(
        moment().utc().minutes() < 30
          ? new Date().getHours()
          : new Date().getHours() + 1,
      )
      .minutes(moment().utc().minutes() < 30 ? 30 : 0),

    frequency: RRule.DAILY,
    interval: 1,
    until: undefined,
    count: 1,
  };

  const [title, setTitle] = useState(defaultState.title);
  const [description, setDescription] = useState(defaultState.description);
  const [from, setFrom] = useState<moment.Moment>(defaultState.from);
  const [frequency, setFrequency] = useState(defaultState.frequency);
  const [interval, setInterval] = useState(defaultState.interval);
  const [until, setUntil] = useState<moment.Moment | undefined>(
    defaultState.until,
  );
  const [count, setCount] = useState<number | undefined>(defaultState.count);

  function revertStateToDefault() {
    setTitle(defaultState.title);
    setDescription(defaultState.description);
    setFrom(defaultState.from);
    setFrequency(defaultState.frequency);
    setInterval(defaultState.interval);
    setUntil(defaultState.until);
    setCount(defaultState.count);
  }

  function handleSubmitFormData(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    //We need to make sure that everything is the same as from, except for the date.
    createEvent({
      title,
      description,
      from: from.add(-1, "M").toDate(), //IDK why we need to do this, but it works
      until: until?.toDate(),
      frequency,
      interval,
      count,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(boolean) => {
        if (!boolean) revertStateToDefault(); //reset form data when closing
        setOpen(boolean);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="mb-64 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmitFormData} className="space-y-8">
          <DialogDescription>
            <div className="space-y-4">
              <div className="flex flex-row gap-2">
                <Input
                  placeholder="Event title..."
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                />
              </div>
              <div className="flex flex-row gap-4">
                <div className="flex flex-col space-y-2">
                  <Label>From</Label>
                  <DateTimePicker
                    aria-label="Close"
                    granularity="minute"
                    value={
                      new CalendarDateTime(
                        from.get("year"),
                        from.get("month"),
                        Number(from.format("DD")),
                        from.get("hour"),
                        from.get("minute"),
                      )
                    }
                    onChange={(date: DateValue) => {
                      setFrom(moment(date));
                    }}
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
            <Button type="submit" size="sm" disabled={buttonLoading}>
              {buttonLoading ? (
                <Loader2 className="mx-2 h-4 w-4 animate-spin" />
              ) : (
                <>Create task</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
