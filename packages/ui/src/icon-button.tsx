"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./cn";
import { buttonVariants } from "./button";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render the child element instead of a <button> (e.g. a router Link). */
  asChild?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
}

/**
 * Square button for a single icon. The accessible name MUST come from the
 * `aria-label` prop (or the child element when `asChild` is used) because
 * there is no visible text.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type ?? "button"}
        aria-busy={undefined}
        className={cn(buttonVariants({ variant, size: "icon" }), "rounded-md", className)}
        {...props}
      />
    );
  },
);
IconButton.displayName = "IconButton";
