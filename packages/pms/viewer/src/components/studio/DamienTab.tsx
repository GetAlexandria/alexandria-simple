import { useState } from "react";
import { DAMIEN_STATION_GROUPS, type DamienStation, type DamienStationKind } from "./damienModel";

type DamienLens = "all" | "conditional" | "core" | "primary" | "quality";

const LENSES: readonly { label: string; value: DamienLens }[] = [
  { label: "Primary chain", value: "primary" },
  { label: "Core", value: "core" },
  { label: "Quality", value: "quality" },
  { label: "Conditional", value: "conditional" },
  { label: "All", value: "all" },
];

const KIND_BADGE: Readonly<Record<DamienStationKind, string>> = {
  conditional: "border-[#b090e8]/50 bg-[#b090e8]/08 text-[#c0a8f0]",
  core: "border-[#f0c060]/50 bg-[#f0c060]/08 text-[#f0c060]",
  quality: "border-[#4fb8a8]/45 bg-[#4fb8a8]/07 text-[#7ad4c4]",
};

function stationVisible(station: DamienStation, lens: DamienLens): boolean {
  if (lens === "all") {
    return true;
  }
  if (lens === "primary") {
    return station.primary === true;
  }
  return station.kind === lens;
}

function StationCard({ station }: { station: DamienStation }): React.ReactElement {
  return (
    <div
      className={[
        "relative rounded-[4px] border border-[#d4a052]/18 p-[13px_14px_12px] transition-all",
        station.primary === true
          ? "border-l-[3px] border-l-[#f0c060] bg-gradient-to-b from-[#22180d]/95 to-[#171009]/90"
          : "border-l-[3px] border-l-[#4fb8a8] bg-[#151a18]/80",
      ].join(" ")}
    >
      <span className="absolute right-[10px] top-[9px] flex flex-col items-end gap-1">
        <span
          className={`rounded-[3px] border px-1.5 py-0.5 text-[8px] uppercase tracking-[0.12em] ${KIND_BADGE[station.kind]}`}
        >
          {station.kind}
        </span>
        {station.skillName != null ? (
          <span className="font-mono text-[9px] text-[#7ad4c4]">${station.skillName}</span>
        ) : null}
      </span>
      <h4 className="mb-[5px] pr-[92px] font-display text-[16px] font-semibold leading-[1.15] text-[#e8e0d4]">
        {station.name}
      </h4>
      <p className="min-h-[42px] text-[11.5px] leading-[1.45] text-[#9a8c78]">
        {station.description}
      </p>
      <div className="mt-3 border-t border-[#d4a052]/12 pt-2">
        <p className="text-[9px] uppercase tracking-[0.12em] text-[#6a5e4e]">Output</p>
        <p className="mt-1 text-[11px] text-[#c9a878]">{station.output}</p>
      </div>
      <ul className="mt-2 grid gap-1 text-[10.5px] leading-[1.35] text-[#8f806c]">
        {station.tasks.map((task) => (
          <li className="flex gap-2" key={task}>
            <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-[#4fb8a8]/70" />
            <span>{task}</span>
          </li>
        ))}
      </ul>
      {station.skillPath != null ? (
        <p className="mt-3 truncate font-mono text-[9px] text-[#6a5e4e]" title={station.skillPath}>
          {station.skillPath}
        </p>
      ) : null}
    </div>
  );
}

export function DamienTab(): React.ReactElement {
  const [lens, setLens] = useState<DamienLens>("primary");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6a5e4e]">
        Show:
        <div className="inline-flex overflow-hidden rounded-[5px] border border-[#d4a052]/18">
          {LENSES.map((entry) => {
            const on = entry.value === lens;
            return (
              <button
                className={[
                  "border-r border-[#d4a052]/18 px-[13px] py-[5px] text-[11px] transition-colors last:border-r-0",
                  on
                    ? "bg-[#f0c060]/14 text-[#f0c060]"
                    : "text-[#9a8c78] hover:bg-[#4fb8a8]/08 hover:text-[#e8e0d4]",
                ].join(" ")}
                key={entry.value}
                onClick={() => setLens(entry.value)}
                type="button"
              >
                {entry.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pb-2">
        {DAMIEN_STATION_GROUPS.map((group) => {
          const stations = group.stations.filter((station) => stationVisible(station, lens));
          if (stations.length === 0) {
            return null;
          }
          return (
            <div className="mt-6 border-t border-[#d4a052]/12 pt-4" key={group.id}>
              <div className="flex flex-wrap items-baseline gap-[13px]">
                <span className="font-display text-[22px] font-semibold text-[#e8b86d]">
                  {group.name}
                </span>
                <span className="text-[11.5px] italic text-[#9a8c78]">{group.tag}</span>
              </div>
              <div className="mt-[13px] grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
                {stations.map((station) => (
                  <StationCard key={station.id} station={station} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
