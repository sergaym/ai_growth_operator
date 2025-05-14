"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  id?: string;
  defaultValue?: number[];
  value?: number[];
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, defaultValue, onValueChange, ...props }, ref) => {
    // Handle value changes
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(event.target.value);
      if (onValueChange) {
        onValueChange([newValue]);
      }
    };

    return (
      <input
        type="range"
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-800",
          "accent-slate-900 dark:accent-slate-100",
          "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
          className
        )}
        ref={ref}
        value={value?.[0]}
        defaultValue={defaultValue?.[0]}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

Slider.displayName = "Slider";

export { Slider }; 