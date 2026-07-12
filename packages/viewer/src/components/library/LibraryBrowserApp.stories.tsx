import type { Meta, StoryObj } from "@storybook/react";
import { LibraryBrowserApp } from "./LibraryBrowserApp";
import { sampleEngineLibraryCatalog } from "./sample-catalog";
import { sampleLibraryGraph } from "./sample-graph";

const meta = {
  component: LibraryBrowserApp,
  title: "Library Browser/Full Browser",
} satisfies Meta<typeof LibraryBrowserApp>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Engine: Story = {
  args: {
    initialCatalog: sampleEngineLibraryCatalog,
    initialGraph: sampleLibraryGraph,
  },
};
