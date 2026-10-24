import type { Preview } from "@storybook-astro/framework";
import "@/src/styles/global.css";
import StoryShell from "@/.storybook/StoryShell.astro";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
  },
  decorators: [() => ({ component: StoryShell })],
};

export default preview;
