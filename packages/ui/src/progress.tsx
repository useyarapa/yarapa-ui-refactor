"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "./cn";

/**
 * Determinate (0–100 `value`) or indeterminate (`value={null}`) progress bar.
 * Pair with visually hidden or adjacent text describing the amount, since
 * the bar itself has no text content.
 */
export const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    value={value}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-border", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full rounded-full bg-brand transition-transform duration-300 ease-standard motion-reduce:transition-none",
        value == null ? "w-1/3 animate-progress-indeterminate" : "w-full",
      )}
      style={value != null ? { transform: `translateX(-${100 - value}%)` } : undefined}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = "Progress";
