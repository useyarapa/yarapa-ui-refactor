import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../badge";
import { Avatar, AvatarImage, AvatarFallback } from "../avatar";
import { Link } from "../link";

const meta: Meta = { title: "Basics" };
export default meta;

export const BadgeStory: StoryObj = {
  name: "Badge",
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Neutral</Badge>
      <Badge tone="brand">Brand</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="danger">Danger</Badge>
    </div>
  ),
};

export const AvatarStory: StoryObj = {
  name: "Avatar",
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/80?img=12" alt="Portrait of Jane Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>YT</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const LinkStory: StoryObj = {
  name: "Link",
  render: () => (
    <p className="text-sm">
      Read the{" "}
      <Link href="https://github.com/useyarapa/yarapa-ui-refactor" target="_blank">
        design system docs
      </Link>{" "}
      (external links get rel="noopener noreferrer").
    </p>
  ),
};
