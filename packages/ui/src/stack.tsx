"use client";

import * as React from "react";
import { Box, type BoxProps, type SpaceToken } from "./box";

export interface StackOwnProps {
  /** Gap between children, backed by the spacing token scale. */
  gap?: SpaceToken;
  direction?: "column" | "row";
  align?: React.CSSProperties["alignItems"];
  justify?: React.CSSProperties["justifyContent"];
  wrap?: boolean;
}

export type StackProps<T extends React.ElementType = "div"> = Omit<
  BoxProps<T>,
  keyof StackOwnProps | "as"
> &
  StackOwnProps & { as?: T };

/** Vertical (default) or horizontal flex stack with token-backed gap. */
export function Stack<T extends React.ElementType = "div">({
  gap = "4",
  direction = "column",
  align,
  justify,
  wrap = false,
  style,
  ...props
}: StackProps<T>) {
  return (
    <Box
      as="div"
      gap={`var(--yp-space-${gap.replace(".", "-")})`}
      style={{
        display: "flex",
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : undefined,
        ...style,
      }}
      {...(props as Record<string, unknown>)}
    />
  );
}

/** Horizontal flex stack with token-backed gap. */
export function Inline<T extends React.ElementType = "div">(props: StackProps<T>) {
  return <Stack direction="row" {...props} />;
}
