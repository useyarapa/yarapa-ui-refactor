import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "../checkbox";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { Switch } from "../switch";
import { FormLabel } from "../form-field";

const meta: Meta = { title: "Forms/Selection controls" };
export default meta;

export const Checkboxes: StoryObj = {
  render: () => (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-medium">Notifications</legend>
      <label className="flex items-center gap-2.5 text-sm">
        <Checkbox defaultChecked /> Email
      </label>
      <label className="flex items-center gap-2.5 text-sm">
        <Checkbox /> SMS
      </label>
      <label className="flex items-center gap-2.5 text-sm">
        <Checkbox disabled /> Push (unavailable)
      </label>
    </fieldset>
  ),
};

export const Indeterminate: StoryObj = {
  render: () => <Checkbox checked="indeterminate" aria-label="Select all" />,
};

export const Radios: StoryObj = {
  render: () => (
    <RadioGroup defaultValue="en">
      <label className="flex items-center gap-2.5 text-sm">
        <RadioGroupItem value="en" /> English
      </label>
      <label className="flex items-center gap-2.5 text-sm">
        <RadioGroupItem value="th" /> <span lang="th">ไทย</span>
      </label>
    </RadioGroup>
  ),
};

export const Switches: StoryObj = {
  render: () => <SwitchDemo />,
};

function SwitchDemo() {
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center gap-3">
      <Switch id="airplane" checked={on} onCheckedChange={setOn} />
      <FormLabel htmlFor="airplane">Airplane mode is {on ? "on" : "off"}</FormLabel>
    </div>
  );
}
