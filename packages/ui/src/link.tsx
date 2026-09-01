"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./cn";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Render the child element instead of an <a> (e.g. a router Link). */
  asChild?: boolean;
}

/**
 * Accessible text link. External links automatically get
 * `rel="noopener noreferrer"` and a visual affordance is expected from
 * the surrounding typography (underline on hover/focus).
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, asChild = false, rel, target, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";
    const isExternal = !asChild && target === "_blank";
    return (
      <Comp
        ref={ref}
        target={target}
        rel={isExternal ? ["noopener", "noreferrer", rel].filter(Boolean).join(" ") : rel}
        className={cn(
          "rounded-xs font-medium text-fg-brand underline-offset-4 hover:underline",
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
Link.displayName = "Link";
