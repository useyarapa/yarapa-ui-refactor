"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { cn } from "./cn";
import { Button, type ButtonProps } from "./button";

export interface PaginationProps extends React.ComponentPropsWithoutRef<"nav"> {
  /** Accessible label for the nav landmark; localize per product language. */
  label?: string;
}

/**
 * Controlled pagination landmark. Render page links/buttons as children and
 * manage the current page in your state; `aria-current="page"` must be set on
 * the active page control.
 */
export const Pagination = ({ label = "Pagination", className, ...props }: PaginationProps) => (
  <nav aria-label={label} className={cn("flex items-center gap-1", className)} {...props} />
);

export const PaginationButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "ghost", ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      className={cn(
        "aria-[current=page]:bg-brand aria-[current=page]:text-brand-text",
        className,
      )}
      {...props}
    />
  ),
);
PaginationButton.displayName = "PaginationButton";

export const PaginationPrevious = ({
  className,
  children = "Previous",
  ...props
}: ButtonProps) => (
  <PaginationButton variant="outline" className={cn("gap-1", className)} {...props}>
    <ChevronLeftIcon className="size-4 rtl:rotate-180" aria-hidden />
    {children}
  </PaginationButton>
);

export const PaginationNext = ({ className, children = "Next", ...props }: ButtonProps) => (
  <PaginationButton variant="outline" className={cn("gap-1", className)} {...props}>
    {children}
    <ChevronRightIcon className="size-4 rtl:rotate-180" aria-hidden />
  </PaginationButton>
);

export const PaginationEllipsis = ({ className, ...props }: React.ComponentPropsWithoutRef<"span">) => (
  <span aria-hidden className={cn("px-2 text-fg-muted", className)} {...props}>
    …
  </span>
);
