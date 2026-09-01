"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, MinusIcon } from "@radix-ui/react-icons";
import { cn } from "./cn";

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer size-5 shrink-0 rounded-sm border border-border-strong bg-surface transition-colors duration-150",
      "hover:border-border-focus disabled:cursor-not-allowed disabled:opacity-45",
      "data-[state=checked]:border-border-focus data-[state=checked]:bg-brand data-[state=checked]:text-brand-text",
      "data-[state=indeterminate]:border-border-focus data-[state=indeterminate]:bg-brand data-[state=indeterminate]:text-brand-text",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      {props.checked === "indeterminate" ? (
        <MinusIcon className="size-3.5" />
      ) : (
        <CheckIcon className="size-3.5" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";
