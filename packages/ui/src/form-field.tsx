"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "./cn";

/**
 * Accessible field wrapper: label + control + hint + error wiring.
 * Pass `controlId` matching the control's id, or compose your own ids.
 * Error text is announced via `aria-describedby` on the caller's control
 * (pass `aria-describedby={errorId}`) — see the FormField stories.
 */
export const FormField = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props} />
  ),
);
FormField.displayName = "FormField";

export const FormLabel = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn("text-sm font-medium text-fg", className)}
    {...props}
  />
));
FormLabel.displayName = "FormLabel";

export const FormHint = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-xs text-fg-muted", className)} {...props} />
));
FormHint.displayName = "FormHint";

export const FormError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, role = "alert", ...props }, ref) => (
  <p
    ref={ref}
    role={role}
    className={cn("text-xs font-medium text-fg-danger", className)}
    {...props}
  />
));
FormError.displayName = "FormError";
