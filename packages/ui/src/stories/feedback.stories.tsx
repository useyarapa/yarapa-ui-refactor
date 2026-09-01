import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
} from "../toast";
import { Alert, AlertTitle, AlertDescription } from "../alert";
import { Skeleton } from "../skeleton";
import { Spinner } from "../spinner";
import { Progress } from "../progress";
import { Button } from "../button";

const meta: Meta = { title: "Feedback" };
export default meta;

export const AlertStory: StoryObj = {
  name: "Alert",
  render: () => (
    <div className="flex w-96 flex-col gap-3">
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Informational message with role="status".</AlertDescription>
      </Alert>
      <Alert tone="success">
        <AlertTitle>Saved</AlertTitle>
        <AlertDescription>Your changes are live.</AlertDescription>
      </Alert>
      <Alert tone="warning" role="alert">
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription role="alert">Your trial ends in 3 days.</AlertDescription>
      </Alert>
      <Alert tone="danger" role="alert">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Could not reach the server.</AlertDescription>
      </Alert>
    </div>
  ),
};

export const ToastStory: StoryObj = {
  name: "Toast",
  render: () => <ToastDemo />,
};

function ToastDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Show toast</Button>
      <Toast open={open} onOpenChange={setOpen} tone="success" duration={6000}>
        <ToastTitle>Workspace updated</ToastTitle>
        <ToastDescription>Your change has been saved.</ToastDescription>
        <ToastAction asChild altText="Undo the workspace update">
          <Button size="sm" variant="outline">Undo</Button>
        </ToastAction>
        <ToastClose />
      </Toast>
    </div>
  );
}

export const Loading: StoryObj = {
  name: "Skeleton / Spinner / Progress",
  render: () => (
    <div className="flex w-80 flex-col gap-5">
      <div className="flex items-center gap-3">
        <Spinner label="Loading content" />
        <span className="text-sm">Loading…</span>
      </div>
      <Progress value={62} aria-label="Upload progress" />
      <Progress value={null} aria-label="Loading" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  ),
};
