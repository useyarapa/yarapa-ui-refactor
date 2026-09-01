"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { cn } from "./cn";
import { Input } from "./input";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  /** Accessible name; ideally point to an external label with aria-labelledby instead. */
  "aria-label"?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Filterable single-select. Composed from Popover + native input and follows
 * the ARIA combobox pattern (input role="combobox", listbox popup, arrows to
 * navigate, Enter to select, Escape to dismiss).
 */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Search…",
  disabled,
  id,
  className,
  ...aria
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;
  const filtered = React.useMemo(
    () =>
      options.filter((o) =>
        o.label.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [options, query],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setQuery("");
      setActiveIndex(0);
    }
  };

  const select = (option: ComboboxOption | undefined) => {
    if (!option) return;
    onValueChange(option.value);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        event.preventDefault();
        select(filtered[activeIndex]);
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Anchor className={cn("relative w-full", className)}>
        <Input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? "yp-combobox-listbox" : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            open && filtered[activeIndex] ? `yp-combobox-opt-${filtered[activeIndex].value}` : undefined
          }
          value={open ? query : (selected?.label ?? "")}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          {...aria}
        />
        <ChevronDownIcon
          aria-hidden
          className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 opacity-65"
        />
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          asChild
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <ul
            id="yp-combobox-listbox"
            role="listbox"
            aria-label={aria["aria-label"]}
            className="z-dropdown max-h-72 w-[var(--radix-popover-trigger-width)] overflow-auto rounded-md border border-border bg-raised p-1 shadow-overlay"
          >
            {filtered.length === 0 && (
              <li className="px-2 py-3 text-sm text-fg-muted" aria-live="polite">
                No results
              </li>
            )}
            {filtered.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  id={`yp-combobox-opt-${option.value}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    select(option);
                  }}
                  onMouseMove={() => setActiveIndex(index)}
                  className={cn(
                    "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none",
                    index === activeIndex && "bg-hover",
                    isSelected && "font-medium",
                  )}
                >
                  <span className="flex size-4 items-center justify-center">
                    {isSelected && <CheckIcon className="size-4" />}
                  </span>
                  {option.label}
                </li>
              );
            })}
          </ul>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
