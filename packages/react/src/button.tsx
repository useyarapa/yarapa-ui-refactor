import type { ButtonHTMLAttributes } from "react";
import { buttonVariants, type ButtonVariants } from "@yarapa-ui/styles/button";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  loading?: boolean;
}

export function Button({
  variant,
  size,
  className,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span aria-hidden="true" className="yp-button__spinner" /> : null}
      {children}
    </button>
  );
}
