import * as React from "react";
import { cn } from "./cn";

/**
 * Indeterminate loading indicator. Purely decorative — announce loading via
 * `aria-live` on the surrounding container or pass `aria-label` when it is
 * the only indicator on screen (the component sets role="status" for you).
 */
export const Spinner = React.forwardRef<
  HTMLOrSVGElement & SVGSVGElement,
  React.SVGAttributes<SVGSVGElement> & { label?: string }
>(({ className, label, ...props }, ref) => (
  <svg
    ref={ref}
    role={label ? "status" : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    className={cn("size-5 animate-spin text-fg-brand motion-reduce:animate-none", className)}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
  </svg>
));
Spinner.displayName = "Spinner";
