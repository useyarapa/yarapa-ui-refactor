"use client";

import * as React from "react";
import { cn } from "./cn";

const fieldStyles =
  "w-full rounded-md border border-border bg-surface px-3 text-fg text-base placeholder:text-fg-subtle transition-colors duration-150 hover:border-border-strong focus:border-border-focus focus:outline-2 focus:outline-border-focus focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-45 aria-invalid:border-border-danger";

/** Single-line text input. Forwarded props include `aria-invalid` for error states. */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input ref={ref} type={type} className={cn(fieldStyles, "h-10", className)} {...props} />
  ),
);
Input.displayName = "Input";

/** Multi-line text input, bidi-safe by default (uses logical padding). */
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(fieldStyles, "min-h-20 py-2 leading-base", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
