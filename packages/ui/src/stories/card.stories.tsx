import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../card";
import { Button } from "../button";
import { Link } from "../link";
import { Badge } from "../badge";

const meta: Meta = { title: "Surfaces/Card" };
export default meta;

export const Composed: StoryObj = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Card title</CardTitle>
          <Badge tone="brand">New</Badge>
        </div>
        <CardDescription>Composed from the caller — no hard-coded links.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Cards are plain containers; headings, links and actions are provided by the
          product code.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Action</Button>
        <Link href="#docs">Learn more</Link>
      </CardFooter>
    </Card>
  ),
};
