import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "@storybook/test";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs";
import { Breadcrumbs, BreadcrumbsList, BreadcrumbsItem, BreadcrumbsSeparator } from "../breadcrumbs";
import { Link } from "../link";

const meta: Meta = { title: "Navigation" };
export default meta;

const TabsRender = () => (
    <Tabs defaultValue="account" className="w-96">
      <TabsList aria-label="Settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account settings content.</TabsContent>
      <TabsContent value="security">Security settings content.</TabsContent>
      <TabsContent value="billing">Billing settings content.</TabsContent>
    </Tabs>
);

export const TabsStory: StoryObj = {
  name: "Tabs",
  render: TabsRender,
};

export const TabsKeyboardInteraction: StoryObj = {
  name: "Tabs (keyboard interaction test)",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const security = canvas.getByRole("tab", { name: "Security" });
    security.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Billing" })).toHaveFocus();
  },
  render: TabsRender,
};

export const BreadcrumbsStory: StoryObj = {
  name: "Breadcrumbs",
  render: () => (
    <Breadcrumbs>
      <BreadcrumbsList>
        <BreadcrumbsItem>
          <Link href="#home">Home</Link>
        </BreadcrumbsItem>
        <BreadcrumbsSeparator />
        <BreadcrumbsItem>
          <Link href="#projects">Projects</Link>
        </BreadcrumbsItem>
        <BreadcrumbsSeparator />
        <BreadcrumbsItem>
          <Link href="#current" aria-current="page">
            YARAPA UI
          </Link>
        </BreadcrumbsItem>
      </BreadcrumbsList>
    </Breadcrumbs>
  ),
};
