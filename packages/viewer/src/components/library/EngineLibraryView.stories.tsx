import type { Meta, StoryObj } from "@storybook/react";
import { EngineLibraryView } from "./EngineLibraryView";
import {
  sampleDenseEngineLibraryCatalog,
  sampleEngineLibraryCatalog,
  sampleProductCardContractCatalog,
} from "./sample-catalog";

const meta = {
  component: EngineLibraryView,
  title: "Library Browser/Engine View",
} satisfies Meta<typeof EngineLibraryView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MultiContext: Story = {
  args: {
    catalog: sampleEngineLibraryCatalog,
  },
};

export const DenseContext: Story = {
  args: {
    catalog: sampleDenseEngineLibraryCatalog,
  },
};

export const SurfaceFilter: Story = {
  args: {
    catalog: sampleEngineLibraryCatalog,
    initialSelectedType: "Surface",
  },
};

export const UnfiledZone: Story = {
  args: {
    catalog: sampleEngineLibraryCatalog,
    initialSelectedType: "Component",
  },
};

// Product/Strategy/Learning cards side by side (issue: the Engine hard-
// defaulted to Product, so Strategy/Learning cards — and the Vitals section
// they carry — were unreachable). The plane switcher lets a director step
// onto Learning or Strategy without leaving the Engine.
export const MultiPlane: Story = {
  args: {
    catalog: sampleProductCardContractCatalog,
  },
};

export const LearningPlaneDefault: Story = {
  args: {
    catalog: sampleProductCardContractCatalog,
    initialSelectedPlane: "learning",
  },
};
