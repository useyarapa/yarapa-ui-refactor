import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuShortcut } from "../menu";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "../popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "../tooltip";
import { Button } from "../button";

const meta: Meta = { title: "Overlays/Floating" };
export default meta;

export const MenuStory: StoryObj = {
  name: "Menu",
  render: () => (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="outline">Options</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel>File</MenuLabel>
        <MenuItem>New tab <MenuShortcut>⌘T</MenuShortcut></MenuItem>
        <MenuItem>Open… <MenuShortcut>⌘O</MenuShortcut></MenuItem>
        <MenuSeparator />
        <MenuItem>Close</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

export const PopoverStory: StoryObj = {
  name: "Popover",
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Show details</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm font-semibold">Confirmation</p>
        <p className="mt-1 text-sm text-fg-muted">
          Traps focus, closes on Escape or outside click.
        </p>
        <PopoverClose asChild>
          <Button size="sm" className="mt-3">Got it</Button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  ),
};

export const TooltipStory: StoryObj = {
  name: "Tooltip",
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover or focus me</Button>
      </TooltipTrigger>
      <TooltipContent>Opens on hover and keyboard focus</TooltipContent>
    </Tooltip>
  ),
};
