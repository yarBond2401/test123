"use client";

import * as React from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { TimePeriodSelect } from './period-select';
import { TimePickerInput } from './time-picker-input';
import { Period } from './time-picker-utils';

interface TimePickerDemoProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  className?: string;
}

export function TimePicker12({ value, onChange, className }: TimePickerDemoProps) {
  const [period, setPeriod] = React.useState<Period>(value ? (value.getHours() >= 12 ? "PM" : "AM") : "AM");

  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const secondRef = React.useRef<HTMLInputElement>(null);
  const periodRef = React.useRef<HTMLButtonElement>(null);

  // React.useEffect(() => {
  //   if (!value) return;
  //   console.log("TimePicker12", value.getHours());
  // }, [value]);

  return (
    <div className={cn("flex items-end gap-2", className ?? "")}>
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <TimePickerInput
          picker="12hours"
          period={period}
          date={value}
          setDate={onChange}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <TimePickerInput
          picker="minutes"
          id="minutes12"
          date={value}
          setDate={onChange}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
          onRightFocus={() => periodRef.current?.focus()}
        />
      </div>
      {/* <div className="grid gap-1 text-center">
        <Label htmlFor="seconds" className="text-xs">
          Seconds
        </Label>
        <TimePickerInput
          picker="seconds"
          id="seconds12"
          date={value}
          setDate={onChange}
          ref={secondRef}
          onLeftFocus={() => minuteRef.current?.focus()}
          onRightFocus={() => periodRef.current?.focus()}
        />
      </div> */}
      <div className="grid gap-1 text-center">
        <Label htmlFor="period" className="text-xs">
          Period
        </Label>
        <TimePeriodSelect
          period={period}
          setPeriod={setPeriod}
          date={value}
          setDate={onChange}
          ref={periodRef}
          onLeftFocus={() => secondRef.current?.focus()}
        />
      </div>
    </div>
  );
}