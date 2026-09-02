import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button.js";

const meta: Meta<typeof Button> = {
  component: Button,
  args: { children: "Save changes" },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Save changes" });
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector(".yp-button__spinner")).not.toBeNull();
  },
};
