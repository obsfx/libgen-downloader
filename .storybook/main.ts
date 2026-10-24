import type { StorybookConfig } from "@storybook-astro/framework";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts"],
  framework: {
    name: "@storybook-astro/framework",
    options: {},
  },
};

export default config;
