import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

const alertVariants = cva("relative flex w-full gap-3 rounded-md border p-4 text-sm", {
  variants: {
    tone: {
      info: "border-info-border bg-info-subtle text-fg",
      success: "border-success-border bg-success-subtle text-fg",
      warning: "border-warning-border bg-warning-subtle text-fg",
      danger: "border-danger-border bg-danger-subtle text-fg",
    },
  },
  defaultVariants: { tone: "info" },
});

/** Inline, non-interrupting status message. Use role="alert" (via the `role` prop) for live announcements. */
export const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, tone, role = "status", ...props }, ref) => (
  <div
    ref={ref}
    role={role}
    className={cn(alertVariants({ tone }), "[&>svg]:size-5 [&>svg]:mt-0.5 [&>svg]:shrink-0", className)}
    {...props}
  />
));
Alert.displayName = "Alert";

export const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn("font-semibold leading-heading", className)} {...props} />
));
AlertTitle.displayName = "AlertTitle";

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm opacity-80 [&_p]:leading-base", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";
