"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "./cn";

export const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-150 motion-reduce:transition-none",
      "disabled:cursor-not-allowed disabled:opacity-45",
      "data-[state=unchecked]:bg-border-strong data-[state=checked]:bg-brand",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block size-4.5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-150 ease-standard motion-reduce:transition-none",
        "data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-[calc(100%-0.125rem)] rtl:data-[state=unchecked]:-translate-x-0.5 rtl:data-[state=checked]:-translate-x-[calc(100%-0.125rem)]",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
