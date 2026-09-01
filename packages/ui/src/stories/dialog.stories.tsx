import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent, expect } from "@storybook/test";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogActions,
  AlertDialogCancel,
  AlertDialogAction,
} from "../alert-dialog";
import { Button } from "../button";

const DialogStoryRender = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button>Open dialog</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>
          Focus is trapped inside, Escape closes, and focus returns to the
          trigger on close.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button>Save</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const meta: Meta = { title: "Overlays/Dialogs" };
export default meta;

export const DialogStory: StoryObj = {
  name: "Dialog",
  render: DialogStoryRender,
};

export const DialogInteraction: StoryObj = {
  name: "Dialog (interaction test)",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
    const dialog = await within(document.body).findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
  },
  render: DialogStoryRender,
};

export const AlertDialogStory: StoryObj = {
  name: "AlertDialog",
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="danger">Delete workspace</Button>
      </AlertDialogTrigger>
      <AlertDialogContent role="alertdialog">
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. All data will be permanently removed.
        </AlertDialogDescription>
        <AlertDialogActions>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialogActions>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
