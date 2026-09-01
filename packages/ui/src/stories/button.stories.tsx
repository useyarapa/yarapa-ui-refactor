import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { GearIcon } from "@radix-ui/react-icons";

const meta: Meta<typeof Button> = {
  title: "Actions/Button",
  component: Button,
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <IconButton aria-label="Settings">
        <GearIcon />
      </IconButton>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-3">
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>
        Disabled
      </Button>
    </div>
  ),
};

export const AsChildRouterLink: Story = {
  render: () => (
    <Button asChild variant="outline">
      <a href="#anchor">Anchor link rendered by the button</a>
    </Button>
  ),
};
