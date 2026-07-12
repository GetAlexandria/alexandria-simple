import { useMemo } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { CardMarkdown } from "./CardMarkdown";
import { RuntimeUnavailablePanel } from "./RuntimeUnavailablePanel";
import type { LibraryCardDetail, LibraryGraph, LibraryGraphCard } from "./types";

export const DETAIL_DRAWER_DEFAULT_WIDTH = 380;
const DETAIL_DRAWER_MAX_WIDTH = 680;
const DETAIL_DRAWER_MIN_WIDTH = 320;

export function clampDetailDrawerWidth(width: number): number {
  return Math.min(DETAIL_DRAWER_MAX_WIDTH, Math.max(DETAIL_DRAWER_MIN_WIDTH, width));
}

interface CardDrawerProps {
  card: LibraryGraphCard | null;
  detail: LibraryCardDetail | null;
  detailError: string | null;
  graph: LibraryGraph;
  isLoading: boolean;
  onClose(): void;
  onRetry(): Promise<void> | void;
  onWidthChange(width: number): void;
  width: number;
}

export function CardDrawer({
  card,
  detail,
  detailError,
  graph,
  isLoading,
  onClose,
  onRetry,
  onWidthChange,
  width,
}: CardDrawerProps) {
  const cardId = card?.id ?? null;
  const { inbound, outbound } = useMemo(() => {
    if (cardId == null) {
      return {
        inbound: 0,
        outbound: 0,
      };
    }

    let inboundCount = 0;
    let outboundCount = 0;

    for (const edge of graph.edges) {
      if (edge.to === cardId) {
        inboundCount += 1;
      }
      if (edge.from === cardId) {
        outboundCount += 1;
      }
    }

    return {
      inbound: inboundCount,
      outbound: outboundCount,
    };
  }, [cardId, graph.edges]);

  if (card == null) {
    return null;
  }

  function handleResizePointerDown(event: ReactPointerEvent<HTMLButtonElement>): void {
    event.preventDefault();
    const handle = event.currentTarget;
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startWidth = width;

    function handlePointerMove(moveEvent: PointerEvent): void {
      onWidthChange(clampDetailDrawerWidth(startWidth + startX - moveEvent.clientX));
    }

    function handlePointerUp(): void {
      handle.removeEventListener("pointermove", handlePointerMove);
      handle.removeEventListener("pointerup", handlePointerUp);
      handle.removeEventListener("pointercancel", handlePointerUp);
      if (handle.hasPointerCapture(pointerId)) {
        handle.releasePointerCapture(pointerId);
      }
    }

    handle.setPointerCapture(pointerId);
    handle.addEventListener("pointermove", handlePointerMove);
    handle.addEventListener("pointerup", handlePointerUp);
    handle.addEventListener("pointercancel", handlePointerUp);
  }

  return (
    <aside
      className="fixed right-0 top-[84px] z-30 h-[calc(100vh-322px)] border-l border-[#6c5130] bg-[#201711]/95 p-5 shadow-[-18px_0_34px_rgba(0,0,0,0.62)]"
      data-testid="card-detail-drawer"
      style={{ width }}
    >
      <button
        aria-label="Resize card detail"
        className="absolute left-0 top-0 h-full w-3 -translate-x-1/2 cursor-ew-resize border-0 bg-transparent p-0 before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-[#8b6a3d]/35 hover:before:bg-[#d4a052] focus:outline-none focus-visible:before:bg-[#d4a052]"
        data-testid="card-detail-resize-handle"
        onPointerDown={handleResizePointerDown}
        role="separator"
        type="button"
      />
      <header className="mb-6 flex items-start justify-between border-b border-[#3b2c20] pb-4">
        <h2 className="pr-5 font-display text-[28px] font-normal leading-9 text-[#f0d49a]">
          {card.title}
        </h2>
        <button
          aria-label="Close card detail"
          className="grid h-8 w-8 place-items-center border border-[#6c5130] text-[20px] text-[#d4a052]"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
      </header>
      <div className="font-display">
        <p className="border-b border-[#3b2c20] pb-3 text-[14px] text-[#b9aa91]">
          <b className="text-[#e8e0d4]">{card.type}</b> · {card.territory} / {card.subfolder}
        </p>
        <p className="mt-4 text-[15px] text-[#8f806c]">
          {inbound + outbound} connections ({outbound} out · {inbound} in)
        </p>
        <section className="mt-5 border-t border-[#3b2c20] pt-4">
          <h4 className="text-[13px] uppercase tracking-[0.18em] text-[#d4a052]">Content</h4>
          {isLoading ? (
            <p className="mt-3 text-[14px] italic text-[#8f806c]">Loading card content</p>
          ) : detailError != null ? (
            <div className="mt-3">
              <RuntimeUnavailablePanel
                density="compact"
                message={detailError}
                onRetry={onRetry}
                title="Card content unavailable"
              />
            </div>
          ) : (
            <div className="mt-3">
              <CardMarkdown content={detail?.content ?? ""} />
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}
