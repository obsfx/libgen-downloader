import InstallCommand from "@/src/components/InstallCommand.astro";

export default {
  title: "Components/InstallCommand",
  component: InstallCommand,
};

export const Npm = { args: { command: "npm install -g libgen-downloader" } };
