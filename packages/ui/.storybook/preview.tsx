import React from "react";
import type { Decorator, Preview } from "@storybook/react-vite";
import "../src/styles/index.css";
import { TooltipProvider } from "../src/tooltip";
import { ToastProvider, ToastViewport } from "../src/toast";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: {
      // Fail CI on accessibility violations (WCAG 2.2 AA aligned rule set).
      test: "error",
      config: {
        rules: {
          // The region rule is noise for isolated component pages.
          region: { enabled: false },
        },
      },
    },
  },
  globalTypes: {
    theme: {
      description: "YARAPA semantic theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "high-contrast", title: "High contrast" },
        ],
      },
    },
    dir: {
      description: "Content direction (RTL readiness)",
      defaultValue: "ltr",
      toolbar: {
        title: "Direction",
        items: [
          { value: "ltr", title: "LTR" },
          { value: "rtl", title: "RTL" },
        ],
      },
    },
  },
  decorators: [
    ((Story, context) => {
      const theme = (context.globals.theme as string) ?? "light";
      const dir = (context.globals.dir as string) ?? "ltr";
      return (
        <div
          data-theme={theme}
          dir={dir}
          className="bg-canvas p-6 text-fg"
          style={{ minHeight: "100vh" }}
        >
          <TooltipProvider>
            <ToastProvider swipeDirection={dir === "rtl" ? "left" : "right"}>
              <Story />
              <ToastViewport />
            </ToastProvider>
          </TooltipProvider>
        </div>
      );
    }) satisfies Decorator,
  ],
};

export default preview;
