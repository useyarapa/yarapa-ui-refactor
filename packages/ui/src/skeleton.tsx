import * as React from "react";
import { cn } from "./cn";

/** Placeholder while content loads. Decorative: hide from assistive tech and announce loading state separately. */
export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    aria-hidden
    className={cn(
      "animate-pulse rounded-md bg-border motion-reduce:animate-none",
      className,
    )}
    {...props}
  />
);
