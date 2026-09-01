import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "../box";
import { Stack, Inline } from "../stack";
import { Grid } from "../grid";
import { Container } from "../container";
import { Badge } from "../badge";
import { Separator } from "../separator";

const meta: Meta = { title: "Layout" };
export default meta;

const Tile = ({ children }: { children: React.ReactNode }) => (
  <Box padding="4" radius="lg" className="border border-border bg-surface text-sm">
    {children}
  </Box>
);

export const StackInline: StoryObj = {
  name: "Stack / Inline",
  render: () => (
    <Stack gap="4" className="w-96">
      <Stack gap="2">
        <Tile>Stack child 1</Tile>
        <Tile>Stack child 2 (gap = space-2)</Tile>
      </Stack>
      <Inline gap="3" wrap>
        <Badge>Inline</Badge>
        <Badge tone="brand">wraps</Badge>
        <Badge tone="success">token gaps</Badge>
      </Inline>
    </Stack>
  ),
};

export const ResponsiveGrid: StoryObj = {
  name: "Grid (auto-fit, min column width)",
  render: () => (
    <Grid minColumnWidth="10rem" gap="3" className="w-full">
      {Array.from({ length: 6 }, (_, i) => (
        <Tile key={i}>Tile {i + 1}</Tile>
      ))}
    </Grid>
  ),
  parameters: { layout: "padded" },
};

export const ContainerStory: StoryObj = {
  name: "Container",
  render: () => (
    <Container size="md">
      <Box padding="6" radius="xl" className="border border-border bg-surface text-sm">
        Container (md) with token gutters that widen at the md breakpoint.
      </Box>
    </Container>
  ),
  parameters: { layout: "padded" },
};

export const SeparatorVisuallyHidden: StoryObj = {
  name: "Separator / VisuallyHidden",
  render: () => (
    <Stack gap="3" className="w-80">
      <span>Content above</span>
      <Separator />
      <span>
        The next word is screen-reader-only:
        <span className="sr-only"> invisible to sighted users</span>
      </span>
    </Stack>
  ),
};
