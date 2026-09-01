"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { Cross2Icon } from "@radix-ui/react-icons";
import { cn } from "./cn";

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 end-4 z-toast flex w-full max-w-sm flex-col gap-2 outline-none",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

type ToastTone = "default" | "success" | "danger" | "warning";

const toastToneClasses: Record<ToastTone, string> = {
  default: "bg-raised border-border",
  success: "bg-success-subtle border-success-border",
  danger: "bg-danger-subtle border-danger-border",
  warning: "bg-warning-subtle border-warning-border",
};

export interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  tone?: ToastTone;
}

export const Toast = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, tone = "default", ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      "relative rounded-md border p-4 shadow-lg",
      toastToneClasses[tone],
      className,
    )}
    {...props}
  />
));
Toast.displayName = "Toast";

export const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("mt-1 text-sm text-fg-muted", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export const ToastAction = ToastPrimitive.Action;
export const ToastClose = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      "absolute end-2 top-2 rounded-md p-1 text-fg-muted transition-colors hover:bg-hover hover:text-fg",
      className,
    )}
    aria-label="Close"
    {...props}
  >
    <Cross2Icon className="size-4" />
  </ToastPrimitive.Close>
));
ToastClose.displayName = "ToastClose";
