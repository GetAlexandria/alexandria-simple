import { useMemo } from "react";
import type { StudioRegistry, StudioRung } from "../../app/runtime/studio";

interface CatalogPlay {
  invalid: boolean;
  rung: StudioRung;
}

interface CatalogFunction {
  declared: boolean;
  name: string;
  plays: CatalogPlay[];
}

interface CatalogDivision {
  face: string | null;
  functions: CatalogFunction[];
  name: string;
}

interface DivisionBuilder {
  declared: CatalogFunction[];
  extras: Map<string, CatalogFunction>;
  face: string | null;
  functions: Map<string, CatalogFunction>;
  name: string;
}

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "unfiled"
  );
}

function filedName(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed == null || trimmed.length === 0 ? "Unfiled" : trimmed;
}

function makeBuilder(
  name: string,
  face: string | null,
  functions: readonly string[],
): DivisionBuilder {
  const declared = functions.map((functionName) => ({
    declared: true,
    name: functionName,
    plays: [],
  }));
  return {
    declared,
    extras: new Map(),
    face,
    functions: new Map(declared.map((entry) => [entry.name, entry])),
    name,
  };
}

function extraFunction(builder: DivisionBuilder, name: string): CatalogFunction {
  const existing = builder.extras.get(name);
  if (existing != null) {
    return existing;
  }
  const created = { declared: false, name, plays: [] };
  builder.extras.set(name, created);
  return created;
}

function buildCatalog(registry: StudioRegistry): CatalogDivision[] {
  // Division order is the registry's authored key order (preserved through JSON
  // and Object.entries) — the org model declares it, so don't sort it.
  const builders = new Map<string, DivisionBuilder>();
  for (const [name, division] of Object.entries(registry.divisions)) {
    builders.set(name, makeBuilder(name, division.face, division.functions));
  }

  const unknownBuilders = new Map<string, DivisionBuilder>();
  const ensureUnknownBuilder = (name: string): DivisionBuilder => {
    const existing = unknownBuilders.get(name);
    if (existing != null) {
      return existing;
    }
    const created = makeBuilder(name, null, []);
    unknownBuilders.set(name, created);
    return created;
  };

  for (const rung of registry.rungs) {
    const divisionName = filedName(rung.division);
    const functionName = filedName(rung.function);
    const builder = builders.get(divisionName);
    if (builder == null) {
      extraFunction(ensureUnknownBuilder(divisionName), functionName).plays.push({
        invalid: true,
        rung,
      });
      continue;
    }

    const declaredFunction = builder.functions.get(functionName);
    if (declaredFunction != null) {
      declaredFunction.plays.push({ invalid: false, rung });
      continue;
    }

    extraFunction(builder, functionName).plays.push({ invalid: true, rung });
  }

  return [...builders.values(), ...unknownBuilders.values()].map((builder) => ({
    face: builder.face,
    functions: [...builder.declared, ...builder.extras.values()],
    name: builder.name,
  }));
}

function PlayRow(props: { play: CatalogPlay }): React.ReactElement {
  const { invalid, rung } = props.play;
  return (
    <li
      className="flex min-h-[42px] items-center gap-3 border-t border-[#3a2c1e]/80 px-3 py-2 first:border-t-0"
      data-testid={`studio-catalog-play-${slugify(rung.slug)}`}
    >
      <span className="w-8 shrink-0 text-center text-[16px] leading-none text-[#e8b86d]">
        {rung.glyph ?? "▫"}
      </span>
      <a
        className="min-w-0 flex-1 text-[13px] leading-5 text-[#e8e0d4] hover:text-[#f0c060] hover:underline"
        href={`/?tab=play&slug=${encodeURIComponent(rung.slug)}`}
      >
        {rung.name}
      </a>
      {invalid ? (
        <span aria-label="misfiled" className="text-[13px] text-[#f0c060]" title="Misfiled">
          ⚠
        </span>
      ) : null}
    </li>
  );
}

function FunctionGroup(props: {
  divisionName: string;
  group: CatalogFunction;
}): React.ReactElement {
  const { divisionName, group } = props;
  // Declared functions keep a stable name-based testid (tests rely on it); mark
  // extras so a misfiled function that slugifies like a declared one ("insight"
  // vs "Insight") can't collide.
  const groupKind = group.declared ? "" : "extra-";
  return (
    <section
      className="border-l border-[#4b3827] bg-black/15"
      data-testid={`studio-catalog-function-${slugify(divisionName)}-${groupKind}${slugify(group.name)}`}
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c59a5c]">
          {group.name}
        </h3>
        <span className="text-[10px] text-[#6f6251]">{group.plays.length}</span>
      </div>
      {group.plays.length > 0 ? (
        <ul className="border-t border-[#3a2c1e]/80">
          {group.plays.map((play) => (
            <PlayRow key={play.rung.slug} play={play} />
          ))}
        </ul>
      ) : (
        <div className="border-t border-[#3a2c1e]/80 px-3 py-3 text-[12px] italic text-[#746858]">
          no plays yet
        </div>
      )}
    </section>
  );
}

export function CatalogTab(props: { registry: StudioRegistry }): React.ReactElement {
  const divisions = useMemo(() => buildCatalog(props.registry), [props.registry]);
  const companyName = props.registry.company?.name?.trim() ?? "";

  return (
    <div className="space-y-5" data-testid="studio-catalog">
      {companyName.length > 0 ? (
        <section className="border-t border-[#4b3827] pt-4" data-testid="studio-catalog-company">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-[22px] text-[#d4a052]">{companyName}</h2>
          </div>
        </section>
      ) : null}
      {divisions.map((division) => (
        <section
          className="border-t border-[#4b3827] pt-4"
          data-testid={`studio-catalog-division-${slugify(division.name)}`}
          key={division.name}
        >
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-[22px] text-[#d4a052]">{division.name}</h2>
            {division.face != null ? (
              <div className="text-[12px] uppercase tracking-[0.14em] text-[#8f806c]">
                face <span className="ml-2 text-[#e8b86d]">{division.face}</span>
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {division.functions.map((group) => (
              <FunctionGroup
                divisionName={division.name}
                group={group}
                key={`${division.name}:${group.declared ? "declared" : "extra"}:${group.name}`}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
