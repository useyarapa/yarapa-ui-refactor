"use client";

import * as React from "react";
import { cn } from "./cn";

export type ContainerSize = "sm" | "md" | "lg" | "full";

const maxWidths: Record<ContainerSize, string> = {
  sm: "40rem",
  md: "48rem",
  lg: "64rem",
  full: "100%",
};

/**
 * Page-level width constraint. Gutters use the semantic spacing scale and
 * widen at the md breakpoint, matching the token breakpoints.
 */
export const Container = ({
  size = "lg",
  className,
  style,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { size?: ContainerSize }) => (
  <div
    className={cn("mx-auto w-full px-4 md:px-6", className)}
    style={{ maxWidth: maxWidths[size], ...style }}
    {...props}
  />
);
