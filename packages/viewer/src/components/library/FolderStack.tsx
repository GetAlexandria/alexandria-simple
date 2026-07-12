import { cardPathFromCard } from "./viewer-routes";
import type { GroupedLibraryCards, LibraryGraphCard } from "./types";

function testIdSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface FolderStackProps {
  group: GroupedLibraryCards;
  isOpen: boolean;
  onClose(): void;
  onOpen(): void;
  onSelectCard(card: LibraryGraphCard): void;
  selectedCardPath: string | null;
}

export function FolderStack({
  group,
  isOpen,
  onClose,
  onOpen,
  onSelectCard,
  selectedCardPath,
}: FolderStackProps) {
  const preview = group.cards.slice(0, 4);

  return (
    <article
      className={[
        "relative [transform-style:preserve-3d] transition-all duration-200",
        isOpen ? "col-span-full min-h-[240px]" : "h-[230px]",
      ].join(" ")}
    >
      {!isOpen ? (
        <button
          className="relative block h-full w-full text-left [transform-style:preserve-3d] [transform:rotateX(14deg)_rotateY(-6deg)] transition-transform duration-300 ease-out hover:[transform:rotateX(4deg)_rotateY(-2deg)_translateY(-6px)_translateZ(20px)]"
          data-testid={`folder-stack-${testIdSegment(group.territory)}-${testIdSegment(group.subfolder)}`}
          onClick={onOpen}
          type="button"
        >
          <span className="absolute inset-0 translate-x-[10px] translate-y-[8px] rounded-[5px] border border-[#563817] bg-[linear-gradient(160deg,#c9a878_0%,#a98850_60%,#856838_100%)] opacity-75 shadow-[inset_0_1px_0_rgba(255,230,180,0.35),0_6px_14px_rgba(0,0,0,0.45)]" />
          <span className="absolute inset-0 translate-x-[7px] translate-y-[5px] rounded-[5px] border border-[#563817] bg-[linear-gradient(160deg,#c9a878_0%,#a98850_60%,#856838_100%)] opacity-85 shadow-[inset_0_1px_0_rgba(255,230,180,0.35),0_6px_14px_rgba(0,0,0,0.45)]" />
          <span className="absolute inset-0 translate-x-[4px] translate-y-[2px] rounded-[5px] border border-[#563817] bg-[linear-gradient(160deg,#c9a878_0%,#a98850_60%,#856838_100%)] opacity-95 shadow-[inset_0_1px_0_rgba(255,230,180,0.35),0_6px_14px_rgba(0,0,0,0.45)]" />
          <span className="absolute inset-0 z-10 flex flex-col rounded-[5px] border border-[#563817] bg-[linear-gradient(160deg,#d6b282_0%,#b8915a_60%,#966c38_100%)] p-[14px_12px_10px] text-[#2a1f10] shadow-[inset_0_1px_0_rgba(255,230,180,0.45),0_4px_10px_rgba(0,0,0,0.50),0_0_0_0.5px_rgba(50,30,12,0.60)]">
            <span className="block font-display text-[16px] uppercase leading-[1.15] tracking-[0.06em]">
              {group.subfolder}
            </span>
            <span className="mb-auto mt-[3px] block font-display text-[11px] italic text-[#6d4f26]">
              {group.territory}
            </span>
            <span className="mt-[10px] block border-t border-[#563817]/30 pt-[7px] font-display text-[11px] leading-[1.3] text-[#3d2a16]">
              {preview.map((card) => (
                <span className="block py-px" key={card.id}>
                  {card.title}
                </span>
              ))}
              {group.cards.length > 4 ? (
                <span className="mt-0.5 block italic text-[#6d4f26]">
                  +{group.cards.length - 4} more
                </span>
              ) : null}
            </span>
            <span className="absolute bottom-[9px] right-3 rounded-full bg-[#d4a052]/40 px-2 py-0.5 font-display text-[14px] tracking-[0.04em] text-[#5b371b]">
              {group.cards.length}
            </span>
          </span>
        </button>
      ) : (
        <div
          className="min-h-[240px] rounded-[3px] border border-[#9c773f] bg-[linear-gradient(180deg,#dcb86e,#95703a)] p-4 text-[#23180f] shadow-[0_18px_28px_rgba(0,0,0,0.5)] [animation:libraryFolderOpen_180ms_cubic-bezier(0.2,0.8,0.3,1)]"
          data-testid={`open-folder-${testIdSegment(group.territory)}-${testIdSegment(group.subfolder)}`}
        >
          <header className="mb-4 flex items-start justify-between border-b border-[#7d5c2f]/50 pb-3">
            <div>
              <h3 className="font-display text-[22px] uppercase tracking-[0.12em]">
                {group.subfolder}
              </h3>
              <p className="font-display text-[13px] italic text-[#604623]">
                <b>{group.cards.length}</b> cards · {group.territory}
              </p>
            </div>
            <button
              aria-label="Close folder"
              className="grid h-8 w-8 place-items-center border border-[#6f4f28] text-[20px]"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          </header>
          <div className="grid grid-cols-[repeat(auto-fill,205px)] gap-4">
            {group.cards.map((card) => (
              <button
                className={[
                  "min-h-[78px] border bg-[#f0d68e]/85 p-3 text-left font-display shadow-[0_5px_10px_rgba(0,0,0,0.2)]",
                  selectedCardPath === cardPathFromCard(card)
                    ? "border-[#382515] ring-2 ring-[#382515]/50"
                    : "border-[#9a7339]",
                ].join(" ")}
                key={card.id}
                onClick={() => onSelectCard(card)}
                type="button"
              >
                <span className="block text-[15px] leading-5 text-[#27180d]">{card.title}</span>
                <span className="mt-2 block text-[11px] uppercase tracking-[0.12em] text-[#6d4f26]">
                  {card.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
