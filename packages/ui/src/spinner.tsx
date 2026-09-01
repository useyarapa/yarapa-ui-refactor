import * as React from "react";
import { cn } from "./cn";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  /** Convenience alias for `aria-label`; marks the spinner as a live status. */
  label?: string;
}

/**
 * Indeterminate loading indicator. Purely decorative by default
 * (`aria-hidden`); pass `label` or `aria-label` when it is the only loading
 * indicator on screen and it becomes a status region announced to assistive
 * technology.
 */
export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, label, ...props }, ref) => {
    const accessibleName = label ?? props["aria-label"];
    return (
      <svg
        ref={ref}
        role={accessibleName ? "status" : undefined}
        aria-hidden={accessibleName ? undefined : true}
        className={cn("size-5 animate-spin text-fg-brand motion-reduce:animate-none", className)}
        viewBox="0 0 24 24"
        fill="none"
        {...props}
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
      </svg>
    );
  },
);
Spinner.displayName = "Spinner";
