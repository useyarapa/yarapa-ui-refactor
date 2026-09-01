import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-border bg-surface text-fg-muted",
        brand: "border-transparent bg-brand-subtle text-brand-subtle-text",
        success: "border-success-border bg-success-subtle text-fg-success",
        warning: "border-warning-border bg-warning-subtle text-fg-warning",
        danger: "border-danger-border bg-danger-subtle text-fg-danger",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, tone, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ tone }), className)} {...props} />
);

export { badgeVariants };
