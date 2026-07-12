import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

function resolvePackagePath(packageName: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${packageName}/package.json`)));
}

const config: StorybookConfig = {
  addons: [
    resolvePackagePath("@storybook/addon-a11y"),
    resolvePackagePath("@storybook/addon-docs"),
  ],
  framework: {
    name: resolvePackagePath("@storybook/react-vite"),
    options: {},
  },
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  // Components use the automatic JSX runtime and don't import React, so force
  // esbuild's automatic transform here too — otherwise stories crash with
  // "React is not defined".
  viteFinal: (config) => ({
    ...config,
    esbuild: { ...config.esbuild, jsx: "automatic", jsxImportSource: "react" },
  }),
};

export default config;
