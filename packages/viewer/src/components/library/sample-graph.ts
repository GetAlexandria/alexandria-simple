import type { LibraryGraph } from "./types";

const sampleCards: LibraryGraph["cards"] = [
  {
    id: "Experience Goal - Quiet Until Needed",
    outbound: [
      "Experience Goal - Well-Run Franchise",
      "Agent - Raven the Maven",
      "Principle - Attention Is a Resource",
    ],
    subfolder: "experience-goals",
    territory: "experience",
    title: "Quiet Until Needed",
    type: "Experience Goal",
  },
  {
    id: "Experience Goal - Well-Run Franchise",
    outbound: ["System - Knowledge Graph", "Agent - Raven the Maven"],
    subfolder: "experience-goals",
    territory: "experience",
    title: "Well-Run Franchise",
    type: "Experience Goal",
  },
  {
    id: "Agent - Raven the Maven",
    outbound: ["Product Thesis - Better Context Produces Better Agent Output"],
    subfolder: "agents",
    territory: "product",
    title: "Raven the Maven",
    type: "Agent",
  },
  {
    id: "System - Knowledge Graph",
    outbound: ["Template - Card"],
    subfolder: "systems",
    territory: "product",
    title: "Knowledge Graph",
    type: "System",
  },
  {
    id: "Template - Card",
    outbound: ["Principle - Attention Is a Resource"],
    subfolder: "templates",
    territory: "product",
    title: "Card",
    type: "Template",
  },
  {
    id: "Principle - Attention Is a Resource",
    outbound: [],
    subfolder: "principles",
    territory: "rationale",
    title: "Attention Is a Resource",
    type: "Principle",
  },
  {
    id: "Product Thesis - Better Context Produces Better Agent Output",
    outbound: ["Principle - Attention Is a Resource"],
    subfolder: "product-theses",
    territory: "rationale",
    title: "Better Context Produces Better Agent Output",
    type: "Product Thesis",
  },
];

const sampleEdges: LibraryGraph["edges"] = [
  {
    from: "Experience Goal - Quiet Until Needed",
    to: "Experience Goal - Well-Run Franchise",
  },
  {
    from: "Experience Goal - Quiet Until Needed",
    to: "Agent - Raven the Maven",
  },
  {
    from: "Experience Goal - Quiet Until Needed",
    to: "Principle - Attention Is a Resource",
  },
  {
    from: "Experience Goal - Well-Run Franchise",
    to: "System - Knowledge Graph",
  },
  {
    from: "Experience Goal - Well-Run Franchise",
    to: "Agent - Raven the Maven",
  },
  {
    from: "Agent - Raven the Maven",
    to: "Product Thesis - Better Context Produces Better Agent Output",
  },
  {
    from: "System - Knowledge Graph",
    to: "Template - Card",
  },
  {
    from: "Template - Card",
    to: "Principle - Attention Is a Resource",
  },
  {
    from: "Product Thesis - Better Context Produces Better Agent Output",
    to: "Principle - Attention Is a Resource",
  },
];

function sortedUnique(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

export const sampleLibraryGraph: LibraryGraph = {
  cards: sampleCards,
  edges: sampleEdges,
  meta: {
    cardCount: sampleCards.length,
    edgeCount: sampleEdges.length,
    subfolders: sortedUnique(sampleCards.map((card) => `${card.territory}/${card.subfolder}`)),
    territories: sortedUnique(sampleCards.map((card) => card.territory)),
  },
  scanErrors: [],
};
