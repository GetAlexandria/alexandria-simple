import type { Meta, StoryObj } from "@storybook/react";
import { EmptyLibraryView, LibraryPeek } from "./EmptyLibraryView";
import { buildCardPeek, buildPeekCardIndex } from "./library-peek-view-model";
import {
  sampleEmptyLibraryCatalog,
  sampleMetadataIssueLibraryCatalog,
  samplePartialLibraryCatalog,
  samplePeekLibraryCatalog,
  sampleProductCardReadinessCatalog,
  sampleSchemaEmptyLibraryCatalog,
} from "./sample-catalog";

const meta = {
  component: EmptyLibraryView,
  title: "Library Browser/Empty Library",
} satisfies Meta<typeof EmptyLibraryView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Partial: Story = {
  args: {
    catalog: samplePartialLibraryCatalog,
  },
};

export const Empty: Story = {
  args: {
    catalog: sampleEmptyLibraryCatalog,
  },
};

export const MetadataIssues: Story = {
  args: {
    catalog: sampleMetadataIssueLibraryCatalog,
  },
};

export const SchemaAwareIndex: Story = {
  args: {
    catalog: sampleProductCardReadinessCatalog,
  },
};

export const SchemaAwareEmpty: Story = {
  args: {
    catalog: sampleSchemaEmptyLibraryCatalog,
  },
};

// The peek + relationships-in-motion fixture (issue #456). On the Workflow tab
// the grading step shows ticks toward the brief and play columns; clicking a
// context tile (Index) or a card (Workflow / Fill readiness) opens the peek.
export const PeekAndRelationships: Story = {
  args: {
    catalog: samplePeekLibraryCatalog,
  },
};

// The shared peek panel rendered standalone, reflecting a card to standard:
// WHAT/HOW, contains, cross-context leans-on, and used-in.
const peekIndex = buildPeekCardIndex(samplePeekLibraryCatalog.cards);
const peekCard = samplePeekLibraryCatalog.cards.find(
  (card) => card.id === "Capability - Grade Play",
);
const gradePlayPeek =
  peekCard == null
    ? null
    : buildCardPeek(peekCard, {
        contextLabel: "grading",
        index: peekIndex,
        workflows: samplePeekLibraryCatalog.workflows ?? [],
      });

export const Peek: Story = {
  args: {
    catalog: samplePeekLibraryCatalog,
  },
  render: () =>
    gradePlayPeek == null ? (
      <div>missing fixture card</div>
    ) : (
      <LibraryPeek
        model={gradePlayPeek}
        onClose={() => undefined}
        onOpenInCatalog={() => undefined}
        onPeekCard={() => undefined}
        pieceByLabel={peekIndex}
        typeMapping={samplePeekLibraryCatalog.typeMapping ?? []}
      />
    ),
};
