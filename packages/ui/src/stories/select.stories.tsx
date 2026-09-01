import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../select";
import { FormLabel, FormField } from "../form-field";
import { Combobox } from "../combobox";

const meta: Meta = { title: "Forms/Select & Combobox" };
export default meta;

const fruit = ["Apple", "Banana", "Cherry", "Mango", "Orange"].map((f) => ({
  value: f.toLowerCase(),
  label: f,
}));

export const SelectStory: StoryObj = {
  name: "Select",
  render: () => (
    <FormField className="w-64">
      <FormLabel htmlFor="fruit">Favorite fruit</FormLabel>
      <Select>
        <SelectTrigger id="fruit">
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            {fruit.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FormField>
  ),
};

export const ComboboxStory: StoryObj = {
  name: "Combobox",
  render: () => (
    <ComboboxDemo />
  ),
};

function ComboboxDemo() {
  const [value, setValue] = React.useState<string | null>(null);
  return (
    <div className="w-64">
      <FormLabel htmlFor="country">Search a fruit</FormLabel>
      <div className="mt-1.5">
        <Combobox
          id="country"
          options={fruit}
          value={value}
          onValueChange={setValue}
          aria-label="Search a fruit"
        />
      </div>
      <p className="mt-2 text-xs text-fg-muted">
        Selected: {value ?? "none"} (arrow keys navigate, Enter selects)
      </p>
    </div>
  );
}
