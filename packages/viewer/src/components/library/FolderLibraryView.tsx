import { useMemo, useState } from "react";
import type { ViewerRuntimeClient } from "../../app/runtime/client";
import { CardDrawer, clampDetailDrawerWidth, DETAIL_DRAWER_DEFAULT_WIDTH } from "./CardDrawer";
import { FolderStack } from "./FolderStack";
import { groupCards } from "./graph-utils";
import { useLibraryCardDetail } from "./hooks/useLibraryCardDetail";
import type { LibraryRootRequest } from "./library-mode-config";
import { cardPathFromCard, folderKeyFromCard } from "./viewer-routes";
import type { GroupedLibraryCards, LibraryGraph, LibraryGraphCard } from "./types";

interface FolderLibraryViewProps {
  graph: LibraryGraph;
  onCloseFolder(folderKey: string): void;
  onOpenFoldersChange(openFolders: string[]): void;
  onSelectedCardPathChange(cardPath: string | null): void;
  openFolders: string[];
  // The library root + overlay the folder graph was read from; card-detail
  // opens must read the same library so a draft card shows draft content.
  rootRequest?: LibraryRootRequest;
  runtimeClient: ViewerRuntimeClient;
  selectedCardPath: string | null;
}

function matchesSearch(card: LibraryGraphCard, normalizedSearch: string): boolean {
  const haystack = `${card.title} ${card.type} ${card.territory} ${card.subfolder} ${card.id}`;
  return haystack.toLowerCase().includes(normalizedSearch);
}

function territoryGroups(groups: GroupedLibraryCards[]): Array<{
  groups: GroupedLibraryCards[];
  territory: string;
}> {
  const byTerritory = new Map<string, GroupedLibraryCards[]>();

  for (const group of groups) {
    const current = byTerritory.get(group.territory) ?? [];
    current.push(group);
    byTerritory.set(group.territory, current);
  }

  return [...byTerritory.entries()]
    .map(([territory, groupedCards]) => ({
      groups: groupedCards,
      territory,
    }))
    .sort((left, right) => left.territory.localeCompare(right.territory));
}

function resolveCardPath(
  graph: LibraryGraph,
  selectedCardPath: string | null,
): LibraryGraphCard | null {
  if (selectedCardPath == null) {
    return null;
  }

  return graph.cards.find((card) => cardPathFromCard(card) === selectedCardPath) ?? null;
}

export function FolderLibraryView({
  graph,
  onCloseFolder,
  onOpenFoldersChange,
  onSelectedCardPathChange,
  openFolders,
  rootRequest,
  runtimeClient,
  selectedCardPath,
}: FolderLibraryViewProps) {
  const [search, setSearch] = useState("");
  const [detailDrawerSize, setDetailDrawerSize] = useState(DETAIL_DRAWER_DEFAULT_WIDTH);
  const normalizedSearch = search.trim().toLowerCase();
  const groups = useMemo(() => {
    const allGroups = groupCards(graph);
    if (normalizedSearch.length === 0) {
      return allGroups;
    }

    return allGroups
      .map((group) => ({
        ...group,
        cards: group.cards.filter((card) => matchesSearch(card, normalizedSearch)),
      }))
      .filter((group) => group.cards.length > 0);
  }, [graph, normalizedSearch]);
  const groupedTerritories = useMemo(() => territoryGroups(groups), [groups]);
  const selectedCard = useMemo(
    () => resolveCardPath(graph, selectedCardPath),
    [graph, selectedCardPath],
  );
  const effectiveOpenFolders = useMemo(() => {
    const folders = new Set(openFolders);
    if (selectedCard != null) {
      folders.add(folderKeyFromCard(selectedCard));
    }
    return folders;
  }, [openFolders, selectedCard]);
  const {
    detail: selectedCardDetail,
    error: detailError,
    isLoading: isDetailLoading,
    retry: retryDetail,
  } = useLibraryCardDetail(runtimeClient, selectedCard, rootRequest);

  return (
    <section className="relative min-h-[360px] p-0">
      <div className="border-b border-[#3b2c20]/70 bg-[#1d140b]/50 p-[14px_28px_12px]">
        <input
          aria-label="Search cards, subfolders, types"
          className="h-[43px] w-full max-w-[500px] rounded-[4px] border border-[#5b432b] bg-[#17110d]/90 px-4 font-display text-[17px] italic tracking-[0.04em] text-[#e8e0d4] outline-none placeholder:text-[#8f806c] focus:border-[#d4a052]"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search cards, subfolders, types..."
          type="search"
          value={search}
        />
      </div>

      <div className="space-y-7 p-[20px_28px_60px] [perspective:1800px]">
        {groupedTerritories.map(({ groups: territoryFolders, territory }) => {
          const totalCards = territoryFolders.reduce(
            (total, group) => total + group.cards.length,
            0,
          );

          return (
            <section key={territory}>
              <header className="mb-[14px] flex h-[46px] items-center justify-between border-l-4 border-[#d4a052] bg-[#7a6a52]/35 px-5 shadow-[inset_0_0_30px_rgba(0,0,0,0.26)]">
                <div className="font-display text-[24px] uppercase tracking-[0.22em] text-[#e8c77d]">
                  ▾ {territory}
                  <span className="ml-5 text-[12px] lowercase tracking-normal text-[#9f927f]">
                    {territoryFolders.length} subfolders
                  </span>
                </div>
                <div className="font-display text-[13px] text-[#d4a052]">{totalCards} cards</div>
              </header>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,200px))] items-start gap-x-[18px] gap-y-[22px] p-[6px_6px_18px] [transform-style:preserve-3d]">
                {territoryFolders.map((group) => {
                  const key = `${group.territory}/${group.subfolder}`;
                  return (
                    <FolderStack
                      group={group}
                      isOpen={effectiveOpenFolders.has(key)}
                      key={key}
                      onClose={() => onCloseFolder(key)}
                      onOpen={() => onOpenFoldersChange([...openFolders, key])}
                      onSelectCard={(card) => onSelectedCardPathChange(cardPathFromCard(card))}
                      selectedCardPath={selectedCardPath}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <CardDrawer
        card={selectedCard}
        detail={selectedCardDetail}
        detailError={detailError}
        graph={graph}
        isLoading={isDetailLoading}
        onClose={() => onSelectedCardPathChange(null)}
        onRetry={retryDetail}
        onWidthChange={(width) => setDetailDrawerSize(clampDetailDrawerWidth(width))}
        width={detailDrawerSize}
      />
    </section>
  );
}
