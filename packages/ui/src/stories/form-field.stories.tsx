import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormField, FormLabel, FormHint, FormError } from "../form-field";
import { Input, Textarea } from "../input";

const meta: Meta = { title: "Forms/Field" };
export default meta;

const Field = ({ invalid }: { invalid?: boolean }) => (
  <FormField className="w-72">
    <FormLabel htmlFor="email">Email</FormLabel>
    <Input
      id="email"
      type="email"
      placeholder="you@example.com"
      aria-describedby="email-hint email-error"
      aria-invalid={invalid || undefined}
    />
    <FormHint id="email-hint">
      <span lang="th">กรอกอีเมลของคุณ</span> — hint text is language-agnostic.
    </FormHint>
    {invalid && (
      <FormError id="email-error">Please enter a valid email address.</FormError>
    )}
  </FormField>
);

export const Default: StoryObj = {
  render: () => <Field />,
};

export const Invalid: StoryObj = {
  render: () => <Field invalid />,
};

export const Multiline: StoryObj = {
  render: () => (
    <FormField className="w-72">
      <FormLabel htmlFor="bio">Bio</FormLabel>
      <Textarea id="bio" placeholder="Tell us about yourself…" rows={4} />
      <FormHint id="bio-hint">Max 280 characters.</FormHint>
    </FormField>
  ),
};
