import type { Meta, StoryObj } from "@storybook/react";
import type { RuntimeAgent } from "../../app/runtime/schemas";
import { RavenBench } from "./RavenBench";

const agents: RuntimeAgent[] = [
  {
    id: "raven",
    jobTitle: "Product Owner",
    knowledgeBankAreaIds: ["vision"],
    name: "Raven",
    status: "available",
  },
  {
    id: "damien",
    jobTitle: "Executive Producer of New Media",
    knowledgeBankAreaIds: [],
    name: "Damien",
    resources: {
      claudeAgentPromptPath: "agents/damien.md",
      codexAgentPromptPath: "agents/damien.md",
      referencePaths: [
        "skills/demo-thesis/references/demo-thesis-process.md",
        "skills/story-spine/references/story-spine-process.md",
        "skills/demo-path/references/demo-path-process.md",
      ],
      skillPaths: [
        "skills/demo-thesis/SKILL.md",
        "skills/story-spine/SKILL.md",
        "skills/demo-path/SKILL.md",
      ],
      workflowPaths: [],
    },
    status: "available",
  },
];

const meta = {
  args: {
    agents,
  },
  component: RavenBench,
  title: "Library Browser/Raven Bench",
} satisfies Meta<typeof RavenBench>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Connected: Story = {
  args: {
    connectionState: "connected",
  },
};
