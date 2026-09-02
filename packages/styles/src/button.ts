import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva("yp-button", {
  variants: {
    variant: {
      primary: "yp-button--primary",
      secondary: "yp-button--secondary",
      outline: "yp-button--outline",
      ghost: "yp-button--ghost",
    },
    size: {
      sm: "yp-button--sm",
      md: "yp-button--md",
      lg: "yp-button--lg",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;
