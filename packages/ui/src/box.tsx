import * as React from "react";
import { cn } from "./cn";

/**
 * Keys into the semantic spacing token scale (rem-based, see @repo/tokens).
 * Numeric strings map 1:1 to `--yp-space-*` custom properties.
 */
export type SpaceToken =
  | "0" | "0.5" | "1" | "1.5" | "2" | "2.5" | "3" | "4" | "5" | "6"
  | "8" | "10" | "12" | "16" | "20" | "24";

export type RadiusToken = "none" | "sm" | "md" | "lg" | "xl" | "full";

export interface BoxOwnProps {
  padding?: SpaceToken;
  paddingLeft?: SpaceToken;
  paddingRight?: SpaceToken;
  paddingTop?: SpaceToken;
  paddingBottom?: SpaceToken;
  paddingX?: SpaceToken;
  paddingY?: SpaceToken;
  margin?: SpaceToken;
  marginLeft?: SpaceToken;
  marginRight?: SpaceToken;
  marginTop?: SpaceToken;
  marginBottom?: SpaceToken;
  marginX?: SpaceToken;
  marginY?: SpaceToken;
  /** Flex/grid gap. Accepts a ready-made value such as `var(--yp-space-4)`. */
  gap?: string;
  radius?: RadiusToken;
  className?: string;
}

export type BoxProps<T extends React.ElementType> = BoxOwnProps &
  Omit<React.ComponentPropsWithoutRef<T>, keyof BoxOwnProps> & { as?: T };

type SpacingInput = Record<string, SpaceToken | undefined>;

/**
 * Token-backed layout primitive. Spacing resolves to `--yp-space-*` design
 * tokens (never raw values) and uses logical properties so it is RTL-safe
 * automatically.
 */
export function Box<T extends React.ElementType = "div">({
  as,
  padding,
  paddingLeft,
  paddingRight,
  paddingTop,
  paddingBottom,
  paddingX,
  paddingY,
  margin,
  marginLeft,
  marginRight,
  marginTop,
  marginBottom,
  marginX,
  marginY,
  gap,
  radius,
  style,
  className,
  ...props
}: BoxProps<T>) {
  const Component = (as ?? "div") as React.ElementType;
  const space = (token: SpaceToken) => `var(--yp-space-${token})`;
  const s: React.CSSProperties = {
    paddingLeft: paddingLeft ?? paddingX ?? padding,
    paddingRight: paddingRight ?? paddingX ?? padding,
    paddingTop: paddingTop ?? paddingY ?? padding,
    paddingBottom: paddingBottom ?? paddingY ?? padding,
    marginLeft: marginLeft ?? marginX ?? margin,
    marginRight: marginRight ?? marginX ?? margin,
    marginTop: marginTop ?? marginY ?? margin,
    marginBottom: marginBottom ?? marginY ?? margin,
  };
  const css: React.CSSProperties = { ...style };
  for (const [key, value] of Object.entries(s as SpacingInput)) {
    if (value !== undefined) {
      (css as Record<string, unknown>)[key] = space(value);
    }
  }
  if (gap) css.gap = gap;
  if (radius) css.borderRadius = `var(--yp-radius-${radius})`;
  return (
    <Component className={cn("box-border", className)} style={css} {...props} />
  );
}
