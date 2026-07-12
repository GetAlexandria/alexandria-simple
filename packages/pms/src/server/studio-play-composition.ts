import { existsSync } from "fs";
import { readFile, readdir, stat } from "fs/promises";
import { extname, join } from "path";
import {
  deriveWorkflowStructure,
  parseTrackerLegsJson,
  type Move,
  type MoveTransition,
  type TrackerLeg,
} from "../domain/workflow-graph.js";

export interface StudioPlayCompositionFile {
  bytes: number;
  path: string;
}

export interface StudioPlayCompositionGate {
  afterModuleOrdinal?: number;
  basis?: string;
  decidedAt?: string;
  decidedBy?: string;
  decision?: string;
  files: {
    json?: StudioPlayCompositionFile;
    other: StudioPlayCompositionFile[];
    review?: StudioPlayCompositionFile;
  };
  id: string;
  label: string;
  notes?: string;
}

export interface StudioPlayCompositionModule {
  label: string;
  legsPath?: string;
  moves: Move[];
  module: string;
  playId?: string;
  trackerLegs: TrackerLeg[];
  trackerLegsWarning?: string;
  transitions: MoveTransition[];
  workflowPath: string;
}

export interface StudioPlayComposition {
  gates: StudioPlayCompositionGate[];
  modules: StudioPlayCompositionModule[];
  slug: string;
}

interface DiskModule {
  module: string;
  playId: string;
  workflowPath: string;
}

interface DerivedModuleStructure {
  moves: Move[];
  trackerLegs: TrackerLeg[];
  transitions: MoveTransition[];
}

interface GateBucket {
  json?: StudioPlayCompositionFile;
  other: StudioPlayCompositionFile[];
  review?: StudioPlayCompositionFile;
}

function titleCaseModuleName(value: string): string {
  return value
    .split("-")
    .filter((part) => part.length > 0)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

// PMS module ids (e.g. make-a-play:design) are no longer Alexandria PlayIds
// after the Slice 1 eviction; the composition keys modules by the composed
// slug:module string directly.
function modulePlayId(slug: string, moduleName: string): string {
  return `${slug}:${moduleName}`;
}

// The PMS production-ladder module order. The Alexandria manifest no longer
// declares PMS modules, so the canonical order is fixed here; unknown module
// names sort alphabetically after it.
const PMS_MODULE_ORDER = ["design", "build", "prove"];

async function scanDiskModules(playDir: string, slug: string): Promise<DiskModule[]> {
  const modulesDir = join(playDir, "modules");
  if (!existsSync(modulesDir)) {
    return [];
  }

  const diskModules: DiskModule[] = [];
  const entries = await readdir(modulesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) {
      continue;
    }
    const workflowPath = `modules/${entry.name}/workflow.fabro`;
    if (!existsSync(join(playDir, workflowPath))) {
      continue;
    }
    diskModules.push({
      module: entry.name,
      playId: modulePlayId(slug, entry.name),
      workflowPath,
    });
  }

  const byModule = new Map(diskModules.map((module) => [module.module, module]));
  const ordered = PMS_MODULE_ORDER.flatMap((name) => {
    const module = byModule.get(name);
    return module == null ? [] : [module];
  });
  const orderedNames = new Set(ordered.map((module) => module.module));
  const rest = diskModules
    .filter((module) => !orderedNames.has(module.module))
    .sort((a, b) => a.module.localeCompare(b.module));

  return [...ordered, ...rest];
}

function warningFromError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function structuresForModules(
  playDir: string,
  modules: readonly DiskModule[],
): Promise<{
  structures: Map<string, DerivedModuleStructure>;
  warnings: Map<string, string>;
}> {
  const structures = new Map<string, DerivedModuleStructure>();
  const warnings = new Map<string, string>();

  for (const module of modules) {
    const workflowSource = await readFile(join(playDir, module.workflowPath), "utf8");
    const legsPath = `modules/${module.module}/legs.json`;
    let trackerLegs: TrackerLeg[] = [];

    if (existsSync(join(playDir, legsPath))) {
      try {
        trackerLegs = parseTrackerLegsJson({
          playId: module.playId,
          source: await readFile(join(playDir, legsPath), "utf8"),
          sourcePath: legsPath,
        });
      } catch (error) {
        warnings.set(module.module, warningFromError(error));
      }
    }

    structures.set(
      module.module,
      deriveWorkflowStructure({
        graphPath: module.workflowPath,
        id: module.playId,
        source: workflowSource,
        trackerLegs,
      }),
    );
  }

  return { structures, warnings };
}

function gateIdForFileName(name: string): string {
  if (name.endsWith("-review.md")) {
    return name.slice(0, -"-review.md".length);
  }
  return name.slice(0, -extname(name).length);
}

function gateOrdinal(gateId: string): number | undefined {
  const match = /^gate-(\d+)$/i.exec(gateId);
  if (match?.[1] == null) {
    return undefined;
  }
  const value = Number.parseInt(match[1], 10);
  return Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

function labelForGate(gateId: string): string {
  const ordinal = gateOrdinal(gateId);
  return ordinal == null ? titleCaseModuleName(gateId) : `Gate ${ordinal}`;
}

function gateDetailsFromJson(
  source: string,
): Omit<StudioPlayCompositionGate, "files" | "id" | "label"> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed == null || Array.isArray(parsed)) {
    return {};
  }
  const record = parsed as Record<string, unknown>;
  return {
    ...(typeof record.basis === "string" ? { basis: record.basis } : {}),
    ...(typeof record.decidedAt === "string" ? { decidedAt: record.decidedAt } : {}),
    ...(typeof record.decidedBy === "string" ? { decidedBy: record.decidedBy } : {}),
    ...(typeof record.decision === "string" ? { decision: record.decision } : {}),
    ...(typeof record.notes === "string" ? { notes: record.notes } : {}),
  };
}

async function scanGates(playDir: string): Promise<StudioPlayCompositionGate[]> {
  const gatesDir = join(playDir, "gates");
  if (!existsSync(gatesDir)) {
    return [];
  }

  const buckets = new Map<string, GateBucket>();
  const entries = await readdir(gatesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith(".")) {
      continue;
    }
    const id = gateIdForFileName(entry.name);
    const bucket = buckets.get(id) ?? { other: [] };
    const path = `gates/${entry.name}`;
    const info = await stat(join(playDir, path));
    const file = { bytes: info.size, path };
    if (entry.name.endsWith(".json") && bucket.json == null) {
      bucket.json = file;
    } else if (entry.name.endsWith("-review.md") && bucket.review == null) {
      bucket.review = file;
    } else {
      bucket.other.push(file);
    }
    buckets.set(id, bucket);
  }

  const gates: StudioPlayCompositionGate[] = [];
  for (const [id, files] of buckets) {
    const ordinal = gateOrdinal(id);
    const details =
      files.json == null
        ? {}
        : gateDetailsFromJson(await readFile(join(playDir, files.json.path), "utf8"));
    gates.push({
      ...details,
      ...(ordinal == null ? {} : { afterModuleOrdinal: ordinal }),
      files: {
        ...(files.json == null ? {} : { json: files.json }),
        other: files.other.sort((a, b) => a.path.localeCompare(b.path)),
        ...(files.review == null ? {} : { review: files.review }),
      },
      id,
      label: labelForGate(id),
    });
  }

  return gates.sort((a, b) => {
    const left = gateOrdinal(a.id) ?? Number.MAX_SAFE_INTEGER;
    const right = gateOrdinal(b.id) ?? Number.MAX_SAFE_INTEGER;
    return left - right || a.id.localeCompare(b.id);
  });
}

export async function deriveStudioPlayComposition(
  studioRoot: string,
  slug: string,
): Promise<StudioPlayComposition> {
  const playDir = join(studioRoot, "plays", slug);
  const diskModules = await scanDiskModules(playDir, slug);
  if (diskModules.length === 0) {
    return { gates: [], modules: [], slug };
  }

  const { structures, warnings } = await structuresForModules(playDir, diskModules);

  return {
    gates: await scanGates(playDir),
    modules: diskModules.map((module): StudioPlayCompositionModule => {
      const structure = structures.get(module.module);
      const legsPath = `modules/${module.module}/legs.json`;
      return {
        label: titleCaseModuleName(module.module),
        ...(existsSync(join(playDir, legsPath)) ? { legsPath } : {}),
        moves: structure?.moves ?? [],
        module: module.module,
        playId: module.playId,
        trackerLegs: structure?.trackerLegs ?? [],
        ...(warnings.has(module.module)
          ? { trackerLegsWarning: warnings.get(module.module) ?? "" }
          : {}),
        transitions: structure?.transitions ?? [],
        workflowPath: module.workflowPath,
      };
    }),
    slug,
  };
}
