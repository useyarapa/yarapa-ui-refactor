import * as React from "react";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { cn } from "./cn";

/** Breadcrumb trail. Mark the current page with `aria-current="page"` on the last item's link. */
export const Breadcrumbs = ({
  label = "Breadcrumb",
  className,
  ...props
}: React.ComponentPropsWithoutRef<"nav"> & { label?: string }) => (
  <nav aria-label={label} className={cn("flex", className)} {...props} />
);

export const BreadcrumbsList = ({ className, ...props }: React.ComponentPropsWithoutRef<"ol">) => (
  <ol className={cn("flex flex-wrap items-center gap-1.5 text-sm", className)} {...props} />
);

export const BreadcrumbsItem = ({ className, ...props }: React.ComponentPropsWithoutRef<"li">) => (
  <li className={cn("inline-flex items-center gap-1.5", className)} {...props} />
);

export const BreadcrumbsSeparator = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"span">) => (
  <span aria-hidden role="presentation" className={cn("text-fg-subtle", className)} {...props}>
    <ChevronRightIcon className="size-3.5 rtl:rotate-180" />
  </span>
);
