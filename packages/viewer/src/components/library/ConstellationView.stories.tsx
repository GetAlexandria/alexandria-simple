import type { Meta, StoryObj } from "@storybook/react";
import { ConstellationView } from "./ConstellationView";
import { sampleEngineLibraryCatalog } from "./sample-catalog";

const meta = {
  component: ConstellationView,
  title: "Library Browser/Constellation",
} satisfies Meta<typeof ConstellationView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    catalog: sampleEngineLibraryCatalog,
  },
};
