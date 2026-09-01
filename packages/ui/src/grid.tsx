"use client";

import * as React from "react";
import { Box, type BoxProps, type SpaceToken } from "./box";

export interface GridOwnProps {
  gap?: SpaceToken;
  /** Minimum column width, e.g. "16rem". Auto-fits the available width. */
  minColumnWidth?: string;
  /** Explicit column count; ignored when minColumnWidth is set. */
  columns?: number;
}

export type GridProps<T extends React.ElementType = "div"> = Omit<
  BoxProps<T>,
  keyof GridOwnProps | "as"
> &
  GridOwnProps & { as?: T };

/**
 * Responsive grid primitive. With `minColumnWidth` the grid auto-fits and
 * reflows across breakpoints without media queries; `columns` sets a fixed
 * track count. Gaps come from the spacing token scale.
 */
export function Grid<T extends React.ElementType = "div">({
  gap = "4",
  minColumnWidth,
  columns,
  style,
  ...props
}: GridProps<T>) {
  const template = minColumnWidth
    ? `repeat(auto-fit, minmax(min(${minColumnWidth}, 100%), 1fr))`
    : columns
      ? `repeat(${columns}, minmax(0, 1fr))`
      : undefined;
  return (
    <Box
      as="div"
      gap={`var(--yp-space-${gap.replace(".", "-")})`}
      style={{ display: "grid", gridTemplateColumns: template, ...style }}
      {...(props as Record<string, unknown>)}
    />
  );
}
