"use client";

import React, { useRef, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useButton, useDatePicker, useInteractOutside } from "react-aria";
import type { DateValue } from "react-aria";
import { useDatePickerState } from "react-stately";
import type { DatePickerStateOptions } from "react-stately";

import { Button, cn, Popover, PopoverContent, PopoverTrigger } from "@kdx/ui";

import { Calendar } from "./calendar";
import { TimeField } from "./time-field";

export function useForwardedRef<T>(ref: React.ForwardedRef<T>) {
  const innerRef = React.useRef<T>(null);

  React.useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(innerRef.current);
    } else {
      ref.current = innerRef.current;
    }
  });

  return innerRef;
}

const DateTimePicker = React.forwardRef<
  HTMLDivElement,
  DatePickerStateOptions<DateValue>
>((props, forwardedRef) => {
  const ref = useForwardedRef(forwardedRef);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);

  const state = useDatePickerState(props);
  const {
    groupProps,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fieldProps,
    buttonProps: _buttonProps,
    dialogProps,
    calendarProps,
  } = useDatePicker(props, state, ref);
  const { buttonProps } = useButton(_buttonProps, buttonRef);
  useInteractOutside({
    ref: contentRef,
    onInteractOutside: () => {
      setOpen(false);
    },
  });

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <div
      {...groupProps}
      ref={ref}
      className={cn(
        groupProps.className,
        "ring-offset-background focus-within:ring-ring flex items-center rounded-md focus-within:ring-2 focus-within:ring-offset-2",
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            {...buttonProps}
            variant="outline"
            className="rounded-md"
            disabled={props.isDisabled}
            onClick={() => setOpen(true)}
          >
            {state.value ? (
              format(state.value.toDate(timeZone), "PPP 'at' HH:mm")
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent ref={contentRef} className="w-full">
          <div {...dialogProps} className="space-y-3">
            <Calendar {...calendarProps} />
            {!!state.hasTime && (
              <TimeField
                aria-label="Time"
                value={state.timeValue}
                // eslint-disable-next-line @typescript-eslint/unbound-method
                onChange={state.setTimeValue}
              />
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

DateTimePicker.displayName = "DateTimePicker";

export { DateTimePicker };
