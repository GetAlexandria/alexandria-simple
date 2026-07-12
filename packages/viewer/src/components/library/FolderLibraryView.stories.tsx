import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { makeViewerRuntimeClient } from "../../app/runtime/client";
import { FolderLibraryView } from "./FolderLibraryView";
import { sampleLibraryGraph } from "./sample-graph";

function MockCardApi({ children }: { children: ReactNode }) {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    type BrowserFetch = typeof window.fetch;
    const replacementFetch = Object.assign(
      (input: Parameters<BrowserFetch>[0], init?: Parameters<BrowserFetch>[1]) => {
        const href =
          typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const url = new URL(href, window.location.href);

        if (url.pathname.startsWith("/api/library/cards/")) {
          const cardId = decodeURIComponent(url.pathname.slice("/api/library/cards/".length));
          const card = sampleLibraryGraph.cards.find((candidate) => {
            return candidate.id === cardId;
          });

          if (card != null) {
            return Promise.resolve(
              Response.json({
                ...card,
                content: `# ${card.id}\n\nStorybook fixture content for ${card.title}.`,
              }),
            );
          }
        }

        return originalFetch(input, init);
      },
      { preconnect: window.fetch.preconnect },
    );

    window.fetch = replacementFetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return children;
}

const meta = {
  component: FolderLibraryView,
  decorators: [
    (Story) => (
      <MockCardApi>
        <Story />
      </MockCardApi>
    ),
  ],
  title: "Library Browser/Folders",
} satisfies Meta<typeof FolderLibraryView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    graph: sampleLibraryGraph,
    onCloseFolder: () => undefined,
    onOpenFoldersChange: () => undefined,
    onSelectedCardPathChange: () => undefined,
    openFolders: [],
    runtimeClient: makeViewerRuntimeClient(),
    selectedCardPath: null,
  },
};
