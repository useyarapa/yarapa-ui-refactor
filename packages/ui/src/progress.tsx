"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "./cn";

/**
 * Determinate (0–100 `value`) or indeterminate (`value={null}`) progress bar.
 * Pair with visually hidden or adjacent text describing the amount, since
 * the bar itself has no text content. The fill grows from the inline start
 * so it is direction-aware under RTL.
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
        "h-full w-full origin-left rounded-full bg-brand transition-transform duration-300 ease-standard motion-reduce:transition-none rtl:origin-right",
        value == null && "animate-progress-indeterminate",
      )}
      style={value != null ? { transform: `scaleX(${Math.min(Math.max(value, 0), 100) / 100})` } : undefined}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = "Progress";
