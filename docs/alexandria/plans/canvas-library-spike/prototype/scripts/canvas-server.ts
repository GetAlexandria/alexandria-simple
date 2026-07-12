/**
 * Canvas server (spike).
 *
 * Bun-based HTTP server that hosts the product-library canvas and
 * brokers state between canvas and Raven. Replaces lab-server.py for
 * the canvas+library spike (see docs/alexandria/plans/canvas-library-spike).
 *
 * Usage:
 *   bun run scripts/canvas-server.ts [--project-root <path>] [--port <n>]
 *
 * Defaults: --project-root = process.cwd(), --port = 0 (OS-assigned).
 */

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { join, resolve, sep } from "path";

import {
  lifebuildSynthesis,
  type NounSource,
  type StoryToken,
  type Synthesis,
} from "./canvas-synthesis-lifebuild";

interface CliArgs {
  projectRoot: string;
  port: number;
}

interface ServerInfo {
  pid: number;
  port: number;
  projectRoot: string;
  startedAt: string;
}

interface IntentRecord {
  id: string;
  ts: string;
  step: string;
  action: string;
  params?: Record<string, unknown>;
  processed: boolean;
}

type QueueOrigin = "rule" | "raven" | "user";

interface QueueItem {
  id: string;
  ts: string;
  origin: QueueOrigin;
  step?: string;
  title: string;
  reason?: string;
  detail?: string;
  status: "open" | "done";
  doneAt?: string;
}

const DEFAULT_PORT = 4323;

function parseArgs(argv: string[]): CliArgs {
  let projectRoot: string | undefined;
  let port: number | undefined;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--project-root") projectRoot = argv[++i];
    else if (argv[i] === "--port") port = parseInt(argv[++i] ?? "", 10);
  }
  const resolvedRoot = resolve(projectRoot ?? process.cwd());
  // Port resolution cascade:
  //   1. --port arg (explicit, highest priority)
  //   2. previous run's port from .server (continuity across restarts in
  //      whatever ad-hoc port the user was on)
  //   3. DEFAULT_PORT — the spike's stable, predictable URL
  //   4. OS-picked at startup (last-resort fallback in Bun.serve if 4323 is
  //      occupied by another process)
  if (!Number.isFinite(port)) {
    const lastServerFile = join(resolvedRoot, "docs/alexandria/.canvas-state/.server");
    try {
      if (existsSync(lastServerFile)) {
        const prev = JSON.parse(readFileSync(lastServerFile, "utf-8")) as { port?: number };
        if (typeof prev.port === "number") port = prev.port;
      }
    } catch (_e) {
      // ignore; fall through to default
    }
  }
  return {
    projectRoot: resolvedRoot,
    port: Number.isFinite(port) ? (port as number) : DEFAULT_PORT,
  };
}

const args = parseArgs(process.argv.slice(2));
const canvasRoot = resolve(import.meta.dir, "..", "product-library");
const stateRoot = join(args.projectRoot, "docs/alexandria/.canvas-state");
const outputsRoot = join(stateRoot, "outputs");
const intentsPath = join(stateRoot, "intents.jsonl");
const stepEventsPath = join(stateRoot, "step-events.jsonl");
const navigationFile = join(stateRoot, "navigation.json");
const queuePath = join(stateRoot, "queue.jsonl");
const logoFile = join(stateRoot, "logo.json");
const productMetaFile = join(stateRoot, "product-meta.json");
const visionFile = join(stateRoot, "vision.json");
const wellsRoot = join(stateRoot, "wells");
const streamsRoot = join(stateRoot, "streams");
const overridesRoot = join(stateRoot, "overrides");
const proposalsRoot = join(stateRoot, "proposals");
const recapRoot = join(stateRoot, "recap");
const serverFile = join(stateRoot, ".server");

mkdirSync(stateRoot, { recursive: true });
mkdirSync(outputsRoot, { recursive: true });
mkdirSync(streamsRoot, { recursive: true });
mkdirSync(overridesRoot, { recursive: true });
mkdirSync(proposalsRoot, { recursive: true });
mkdirSync(recapRoot, { recursive: true });
mkdirSync(wellsRoot, { recursive: true });

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Step slugs land in filesystem paths (state files, output dirs). Whitelist
// the safe character set so URL-encoded "../" can't escape stateRoot via
// recap/<step>.json or proposals/<step>.jsonl etc.
const STEP_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
function isValidStep(step: string): boolean {
  return STEP_PATTERN.test(step) && !step.includes("..");
}
function rejectInvalidStep(step: string): Response {
  return jsonResponse({ error: `invalid step: ${JSON.stringify(step)}` }, 400);
}

// ── In-process pub/sub for canvas state changes ─────────────────────────────
// Each step (e.g. "codebase-scan") has zero or more SSE subscribers. When a
// mutation lands (edit-noun, propose, accept, reject), we push the fresh
// canvas state to everyone subscribed to that step.
interface Subscriber {
  controller: ReadableStreamDefaultController<Uint8Array>;
  encoder: TextEncoder;
}
const subscribers = new Map<string, Set<Subscriber>>();

function subscribe(step: string, sub: Subscriber): void {
  if (!subscribers.has(step)) subscribers.set(step, new Set());
  subscribers.get(step)!.add(sub);
}
function unsubscribe(step: string, sub: Subscriber): void {
  subscribers.get(step)?.delete(sub);
}
function computeCanvasState(step: string): unknown {
  const syn = loadSynthesis(step);
  if (!syn.available) return syn;
  const overrides = readOverrides(step);
  const proposals = readProposals(step).filter((p) => p.status === "pending");
  const recap = readRecap(step);
  const logo = readLogo();
  const productMeta = readProductMeta();
  const wells = readWells();
  const navigation = readNavigation();
  return {
    ...syn,
    // Director's typed product name overrides synthesis product_name when set.
    product_name: productMeta?.name ?? syn.product_name,
    what_you_told_me: recap?.text ?? syn.what_you_told_me,
    recap, // include the meta (ts, by) for animation cues
    overrides,
    proposals,
    logo, // global product logo — same value piped into every step's SSE
    productMeta, // {name, ts, by} — global, drives the rail label
    wells, // {website, productDocs, planDocs, github, brain} 0-10, global
    navigation, // {to, from, ts} — most recent save-and-advance event
  };
}

interface Navigation {
  to: string;
  from: string;
  ts: string;
}
function readNavigation(): Navigation | null {
  if (!existsSync(navigationFile)) return null;
  try {
    return JSON.parse(readFileSync(navigationFile, "utf-8")) as Navigation;
  } catch (_e) {
    return null;
  }
}
function writeNavigation(n: Omit<Navigation, "ts">): Navigation {
  const nav: Navigation = { ...n, ts: new Date().toISOString() };
  writeFileSync(navigationFile, JSON.stringify(nav, null, 2) + "\n");
  return nav;
}

interface Logo {
  filename: string;
  dataUrl: string;
  ts: string;
  by: "director" | "raven";
  // True when Raven has seen the logo and reacted in chat (via the
  // describe-logo play's final acknowledge POST). Until this flips
  // true, the canvas withholds the Keep/Replace/Delete/Save controls
  // and shows a "tell Raven about this" hint instead.
  acknowledged_by_raven?: boolean;
  acknowledged_at?: string;
}
function readLogo(): Logo | null {
  if (!existsSync(logoFile)) return null;
  try {
    return JSON.parse(readFileSync(logoFile, "utf-8")) as Logo;
  } catch (_e) {
    return null;
  }
}
function writeLogo(filename: string, dataUrl: string, by: "director" | "raven"): Logo {
  // New logo always starts unacknowledged — replacing resets the cycle.
  const l: Logo = { filename, dataUrl, ts: new Date().toISOString(), by, acknowledged_by_raven: false };
  writeFileSync(logoFile, JSON.stringify(l, null, 2) + "\n");
  return l;
}
function acknowledgeLogo(): Logo | null {
  const cur = readLogo();
  if (!cur) return null;
  const next: Logo = { ...cur, acknowledged_by_raven: true, acknowledged_at: new Date().toISOString() };
  writeFileSync(logoFile, JSON.stringify(next, null, 2) + "\n");
  return next;
}
function notifyAllSteps(): void {
  for (const step of subscribers.keys()) notifyStep(step);
}

interface ProductMeta {
  name: string;
  ts: string;
  by: "director" | "raven";
}
function readProductMeta(): ProductMeta | null {
  if (!existsSync(productMetaFile)) return null;
  try {
    return JSON.parse(readFileSync(productMetaFile, "utf-8")) as ProductMeta;
  } catch (_e) {
    return null;
  }
}
function writeProductMeta(name: string, by: "director" | "raven"): ProductMeta {
  const m: ProductMeta = { name, ts: new Date().toISOString(), by };
  writeFileSync(productMetaFile, JSON.stringify(m, null, 2) + "\n");
  return m;
}

// Wells: 4 sliders (0–10) capturing what information sources exist. 0 = skip;
// non-zero = relative depth signal. Stored as a single global record because
// the wells inventory describes the whole project, not a specific step.
//
// The director's own brain is the implicit fifth well — always available,
// never scored. Raven leans on it when other sources run dry.
type WellKey = "website" | "productDocs" | "planDocs" | "github";
const WELL_KEYS: WellKey[] = ["website", "productDocs", "planDocs", "github"];
interface Wells {
  website: number;
  productDocs: number;
  planDocs: number;
  github: number;
  ts?: string;
}
// Default to mid-depth (5/10) so sliders open in a neutral state. The
// director moves them to reflect actual depth. 0 becomes an explicit
// "skip" choice rather than the default.
const WELLS_DEFAULTS: Wells = { website: 5, productDocs: 5, planDocs: 5, github: 5 };
function wellsFile(): string {
  return join(wellsRoot, "global.json");
}
function readWells(): Wells {
  const p = wellsFile();
  if (!existsSync(p)) return { ...WELLS_DEFAULTS };
  try {
    return { ...WELLS_DEFAULTS, ...(JSON.parse(readFileSync(p, "utf-8")) as Wells) };
  } catch (_e) {
    return { ...WELLS_DEFAULTS };
  }
}
function writeWells(patch: Partial<Wells>): Wells {
  const current = readWells();
  const next: Wells = { ...current, ...patch, ts: new Date().toISOString() };
  // Clamp 0..10.
  for (const k of WELL_KEYS) {
    if (typeof next[k] === "number") next[k] = Math.max(0, Math.min(10, Math.round(next[k])));
  }
  // Self-heal: canvasdemo's startup reset rm -rf's wells/ but doesn't recreate
  // it. The mkdirSync at server boot only fires once, so subsequent resets
  // leave the dir missing → first wells write ENOENTs → slider snaps back to
  // the default. Recreate on every write.
  mkdirSync(wellsRoot, { recursive: true });
  writeFileSync(wellsFile(), JSON.stringify(next, null, 2) + "\n");
  return next;
}
function notifyStep(step: string): void {
  const subs = subscribers.get(step);
  if (!subs || subs.size === 0) return;
  const data = JSON.stringify(computeCanvasState(step));
  const event = `data: ${data}\n\n`;
  for (const s of Array.from(subs)) {
    try {
      s.controller.enqueue(s.encoder.encode(event));
    } catch (_e) {
      // Client gone; reaper happens in stream cancel.
      subs.delete(s);
    }
  }
}

// ── Vision state ────────────────────────────────────────────────────────────
// The Vision Builder (step 1.4) gets its own state file because its shape —
// nine slots with text + scratch + notch — doesn't fit the synthesis/overrides/
// proposals model used by 1.1-1.3. Raven writes drafts here via the
// /api/canvas/vision/* endpoints; the canvas subscribes via the vision SSE.
type VisionActor = "director" | "raven";
interface VisionSlot {
  text: string;
  scratch: string;
  // 0 = unset (—), 1 = Build, 2 = Tune, 3 = Approved
  notch: 0 | 1 | 2 | 3;
  lastWritten?: { ts: string; by: VisionActor };
}
interface VisionSource {
  raw: string; // what the director pasted (URL or file path)
  addedBy: VisionActor;
  ts: string;
}
interface VisionState {
  slots: Record<string, VisionSlot>;
  sources: VisionSource[];
  banked: boolean;
  bankedAt?: string;
}
const VISION_SLOT_IDS = ["1", "2", "3a", "3b", "4", "5", "6", "7", "8"];
function freshVisionState(): VisionState {
  const slots: Record<string, VisionSlot> = {};
  for (const id of VISION_SLOT_IDS) {
    slots[id] = { text: "", scratch: "", notch: 0 };
  }
  return { slots, sources: [], banked: false };
}
function readVision(): VisionState {
  if (!existsSync(visionFile)) return freshVisionState();
  try {
    const parsed = JSON.parse(readFileSync(visionFile, "utf-8")) as VisionState;
    // Backfill any missing slots so callers can trust the shape.
    const base = freshVisionState();
    for (const id of VISION_SLOT_IDS) {
      if (!parsed.slots || !parsed.slots[id]) parsed.slots = parsed.slots || {};
      if (!parsed.slots[id]) parsed.slots[id] = base.slots[id];
    }
    if (!Array.isArray(parsed.sources)) parsed.sources = [];
    return parsed;
  } catch (_e) {
    return freshVisionState();
  }
}
function writeVision(v: VisionState): void {
  writeFileSync(visionFile, JSON.stringify(v, null, 2) + "\n");
}
function isValidVisionSlotId(id: string): boolean {
  return VISION_SLOT_IDS.includes(id);
}
function isValidNotch(n: unknown): n is 0 | 1 | 2 | 3 {
  return n === 0 || n === 1 || n === 2 || n === 3;
}

// Vision SSE: a dedicated subscriber pool keyed by the literal "vision".
// Kept separate from the step-keyed subscribers to avoid colliding with the
// step-based canvas-bridge SSE.
const visionSubscribers = new Set<Subscriber>();
function subscribeVision(sub: Subscriber): void { visionSubscribers.add(sub); }
function unsubscribeVision(sub: Subscriber): void { visionSubscribers.delete(sub); }
function notifyVision(): void {
  if (visionSubscribers.size === 0) return;
  const data = JSON.stringify(readVision());
  const event = `data: ${data}\n\n`;
  for (const s of Array.from(visionSubscribers)) {
    try {
      s.controller.enqueue(s.encoder.encode(event));
    } catch (_e) {
      visionSubscribers.delete(s);
    }
  }
}

// Nouns in the story are marked by SOURCE. A real noun (from the director's
// words, the docs, or the product itself) renders blue; hovering shows which
// sources contributed. An industry-standard fill renders gray; hovering shows
// alternative phrasings the director can pick from. Raven-authored edits add
// "raven" as a source so the override history stays consistent.
// (NounSource and StoryToken types live in ./canvas-synthesis-lifebuild.)

interface NounOverride {
  // Stored per-step in overrides/<step>.json keyed by noun id
  id: string;
  text: string;
  sources: NounSource[];
  history: Array<{
    ts: string;
    by: "director" | "raven";
    from: string;
    to: string;
    reason?: string;
  }>;
}

interface ProposalRecord {
  id: string;
  ts: string;
  step: string;
  kind: "noun-change";
  nounId: string;
  currentText: string;
  proposedText: string;
  reason?: string;
  proposedBy: "raven" | "user";
  status: "pending" | "accepted" | "rejected";
  resolvedAt?: string;
}

// Synthesis dispatcher. Each step maps to a source: an empty shell, a global-
// state-only surface, or a hand-authored fixture for the demo. Real LLM-driven
// synthesis plugs in here later.
function loadSynthesis(step: string): Synthesis {
  // Step 1.1 (Opening): empty shell, canvas renders welcome surface.
  if (step === "1.1") {
    return { available: true, product_name: "Alexandria" };
  }
  // Step 1.3 (Sources / Wells): no synthesis content; computeCanvasState merges
  // global wells into the response.
  if (step === "1.3") {
    return { available: true };
  }
  // Step 1.2 (product orientation, formerly "codebase scan"): demo fixture.
  // "codebase-scan" stays as an alias so scan.html keeps working standalone.
  if (step === "codebase-scan" || step === "1.2") {
    return lifebuildSynthesis();
  }
  return { available: false };
}

interface Recap {
  text: string;
  ts: string;
  by: "director" | "raven";
}

function recapFile(step: string): string {
  return join(recapRoot, `${step}.json`);
}
function readRecap(step: string): Recap | null {
  const p = recapFile(step);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf-8")) as Recap;
}
function writeRecap(step: string, text: string, by: "director" | "raven"): Recap {
  const rec: Recap = { text, ts: new Date().toISOString(), by };
  mkdirSync(recapRoot, { recursive: true });
  writeFileSync(recapFile(step), JSON.stringify(rec, null, 2) + "\n");
  return rec;
}

function overridesFile(step: string): string {
  return join(overridesRoot, `${step}.json`);
}
function proposalsFile(step: string): string {
  return join(proposalsRoot, `${step}.jsonl`);
}

function readOverrides(step: string): Record<string, NounOverride> {
  const p = overridesFile(step);
  if (!existsSync(p)) return {};
  return JSON.parse(readFileSync(p, "utf-8")) as Record<string, NounOverride>;
}
function writeOverrides(step: string, data: Record<string, NounOverride>): void {
  mkdirSync(overridesRoot, { recursive: true });
  writeFileSync(overridesFile(step), JSON.stringify(data, null, 2) + "\n");
}

function readProposals(step: string): ProposalRecord[] {
  const p = proposalsFile(step);
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf-8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as ProposalRecord);
}
function writeProposals(step: string, items: ProposalRecord[]): void {
  mkdirSync(proposalsRoot, { recursive: true });
  writeFileSync(proposalsFile(step), items.map((i) => JSON.stringify(i)).join("\n") + "\n");
}
function appendProposal(step: string, p: ProposalRecord): void {
  mkdirSync(proposalsRoot, { recursive: true });
  appendFileSync(proposalsFile(step), JSON.stringify(p) + "\n");
}

// Find current text of a noun: override > synthesis.
function currentNounText(step: string, nounId: string): string | null {
  const overrides = readOverrides(step);
  if (overrides[nounId]) return overrides[nounId].text;
  const syn = loadSynthesis(step);
  if (!syn.available || !syn.story) return null;
  for (const para of syn.story.paragraphs) {
    for (const tok of para) {
      if (tok.kind === "noun" && tok.id === nounId) return tok.noun?.text ?? tok.v;
    }
  }
  return null;
}

// Find current sources of a noun.
function currentNounSources(step: string, nounId: string): NounSource[] {
  const overrides = readOverrides(step);
  if (overrides[nounId]) return overrides[nounId].sources;
  const syn = loadSynthesis(step);
  if (!syn.available || !syn.story) return [];
  for (const para of syn.story.paragraphs) {
    for (const tok of para) {
      if (tok.kind === "noun" && tok.id === nounId) return tok.noun?.sources ?? [];
    }
  }
  return [];
}

function applyNounEdit(
  step: string,
  nounId: string,
  newText: string,
  by: "director" | "raven",
  reason?: string,
): NounOverride {
  const overrides = readOverrides(step);
  const fromText = currentNounText(step, nounId) ?? "";
  const existing = overrides[nounId];
  const sourcesBase = existing ? existing.sources : currentNounSources(step, nounId);
  // Director or accepted-raven-proposal edits add their voice to the noun's
  // source set alongside any pre-existing sources. No cast — NounSource now
  // includes "raven" so the type catches future divergence.
  const editorSource: NounSource = by === "director" ? "director" : "raven";
  const nextSources: NounSource[] = Array.from(new Set([...sourcesBase, editorSource]));
  const ov: NounOverride = {
    id: nounId,
    text: newText,
    sources: nextSources,
    history: [
      ...(existing?.history ?? []),
      {
        ts: new Date().toISOString(),
        by,
        from: fromText,
        to: newText,
        reason,
      },
    ],
  };
  overrides[nounId] = ov;
  writeOverrides(step, overrides);
  return ov;
}

function resolveProposal(
  step: string,
  proposalId: string,
  status: "accepted" | "rejected",
): { ok: boolean; proposal?: ProposalRecord; override?: NounOverride; error?: string } {
  const items = readProposals(step);
  const idx = items.findIndex((i) => i.id === proposalId);
  if (idx < 0) return { ok: false, error: "proposal not found" };
  if (items[idx].status !== "pending") return { ok: false, error: "already resolved" };
  items[idx] = { ...items[idx], status, resolvedAt: new Date().toISOString() };
  writeProposals(step, items);
  if (status === "accepted") {
    const p = items[idx];
    const ov = applyNounEdit(step, p.nounId, p.proposedText, "raven", p.reason);
    return { ok: true, proposal: items[idx], override: ov };
  }
  return { ok: true, proposal: items[idx] };
}

function streamPath(step: string): string {
  return join(streamsRoot, `${step}.jsonl`);
}

function appendStream(step: string, event: Record<string, unknown>): void {
  const ev = { ts: new Date().toISOString(), ...event };
  mkdirSync(streamsRoot, { recursive: true });
  appendFileSync(streamPath(step), JSON.stringify(ev) + "\n");
}

interface ScanCandidate {
  name: string;
  group?: string;
  confidence: "high" | "medium" | "low";
  type_hint?: string;
  layers?: string[];
  evidence_paths?: string[];
}

interface ScanResult {
  candidates: ScanCandidate[];
  groups: Array<{ name: string; members?: string[] }>;
  summary: {
    files_scanned: number;
    directories_scanned?: number;
    candidate_count: number;
    group_count: number;
    confidence: { high: number; medium: number; low: number };
    filtered_candidates?: number;
    filtered_examples?: string[];
  };
  scan_root?: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function runDemoCodebaseScan(scanPath: string): Promise<void> {
  const step = "codebase-scan";
  // Clear prior stream so the canvas starts fresh.
  writeFileSync(streamPath(step), "");

  appendStream(step, { type: "start", scope: scanPath });

  // Run the real scanner so the demo uses live data.
  const alxndr = resolve(import.meta.dir, "..", "bin", "alxndr");
  const proc = Bun.spawn([alxndr, "scan", scanPath], { stdout: "pipe", stderr: "pipe" });
  const stdout = await new Response(proc.stdout).text();
  await proc.exited;
  if (proc.exitCode !== 0) {
    appendStream(step, { type: "error", message: "scan failed" });
    return;
  }

  let scan: ScanResult;
  try {
    scan = JSON.parse(stdout) as ScanResult;
  } catch (_e) {
    appendStream(step, { type: "error", message: "scan output not JSON" });
    return;
  }

  // Pace it out so the streaming feel is visible even when scan is fast.
  await delay(500);

  // Partial file-scanned progress (synthetic, since real scan is atomic).
  const totalFiles = scan.summary.files_scanned ?? 0;
  const checkpoints = [0.2, 0.45, 0.7, 0.9, 1.0];
  for (const frac of checkpoints) {
    await delay(400);
    appendStream(step, {
      type: "progress",
      files_scanned: Math.round(totalFiles * frac),
      files_total: totalFiles,
      final: frac === 1.0,
    });
  }

  // Stream candidates in confidence order so the high-value ones land first.
  const order = { high: 0, medium: 1, low: 2 } as const;
  const sorted = [...scan.candidates].sort(
    (a, b) => (order[a.confidence] ?? 9) - (order[b.confidence] ?? 9),
  );
  // Cap how many we stream to keep the demo crisp; the rest land in scan-complete.
  const streamed = sorted.slice(0, 28);
  for (const c of streamed) {
    await delay(180);
    appendStream(step, {
      type: "candidate",
      name: c.name,
      group: c.group,
      confidence: c.confidence,
      type_hint: c.type_hint,
      layers: c.layers ?? [],
      evidence_paths: (c.evidence_paths ?? []).slice(0, 3),
    });
  }

  // Insights — derived from the real summary.
  await delay(400);
  const insights = buildInsights(scan);
  for (const text of insights) {
    await delay(450);
    appendStream(step, { type: "insight", text });
  }

  // Groups summary.
  await delay(400);
  for (const g of (scan.groups || []).slice(0, 12)) {
    appendStream(step, {
      type: "group",
      name: g.name,
      member_count: (g.members ?? []).length,
    });
  }

  // Shortlist: Raven's "best guess" surface. Prefer high → medium → top-of-group
  // lows. Always populate so the user has something to react to, even on
  // codebases where Tier 1 surfaced no strong signal.
  await delay(400);
  const toCard = (c: ScanCandidate): { name: string; group?: string; type_hint?: string; confidence: string } => ({
    name: c.name,
    group: c.group,
    type_hint: c.type_hint,
    confidence: c.confidence,
  });
  const highs = sorted.filter((c) => c.confidence === "high").slice(0, 8);
  const meds = sorted.filter((c) => c.confidence === "medium").slice(0, 6);
  // For lows, pick one representative per group (highest-evidence first), so
  // we don't fill the shortlist with 8 cards from the same domain.
  const lowsByGroup = new Map<string, ScanCandidate>();
  for (const c of sorted.filter((c) => c.confidence === "low")) {
    const g = c.group || "_ungrouped";
    if (!lowsByGroup.has(g)) lowsByGroup.set(g, c);
  }
  const lowReps = Array.from(lowsByGroup.values()).slice(0, 6);

  let finalShortlist: ReturnType<typeof toCard>[];
  let ravenPrompt: string;
  if (highs.length > 0) {
    finalShortlist = highs.map(toCard);
    ravenPrompt =
      "Here's what we saw. The highlighted candidates have evidence across the model, API, and UI layers — strong signal. Confirm what's real, reject implementation details, and tell me what's central to the product that I missed.";
  } else if (meds.length > 0) {
    finalShortlist = meds.map(toCard);
    ravenPrompt =
      "No 3-layer matches, but here are the strongest medium-confidence candidates. I'm less sure about these — what's product, what's plumbing, and what's missing entirely?";
  } else {
    finalShortlist = lowReps.map(toCard);
    ravenPrompt =
      "Tier 1 didn't surface strong product entities — most signal is single-layer (likely UI-only). I picked one representative per domain group so we can talk shape. Help me name the real product concepts: what's the user thinking about when they use this?";
  }

  appendStream(step, {
    type: "scan-complete",
    summary: scan.summary,
    shortlist: finalShortlist,
    raven_prompt: ravenPrompt,
  });
}

function buildInsights(scan: ScanResult): string[] {
  const s = scan.summary;
  const out: string[] = [];

  // Coverage: layer breakdown across all candidates.
  const layerCounts: Record<string, number> = { model: 0, api: 0, ui: 0, domain: 0 };
  for (const c of scan.candidates) {
    for (const l of c.layers ?? []) layerCounts[l] = (layerCounts[l] ?? 0) + 1;
  }
  const total = scan.candidates.length || 1;
  const uiPct = Math.round(((layerCounts.ui ?? 0) / total) * 100);
  const modelPct = Math.round(((layerCounts.model ?? 0) / total) * 100);
  if (uiPct > 70 && modelPct < 25) {
    out.push(
      `${uiPct}% of candidates are UI-only and only ${modelPct}% appear in a model/schema layer — backend may live elsewhere, or the data model is implicit.`,
    );
  }

  // Strongest domain
  if (scan.groups && scan.groups.length > 0) {
    const sortedGroups = [...scan.groups].sort(
      (a, b) => (b.members?.length ?? 0) - (a.members?.length ?? 0),
    );
    const top = sortedGroups[0];
    if (top && (top.members?.length ?? 0) > 0) {
      out.push(
        `Strongest domain by candidate count: **${top.name}** (${top.members?.length} candidates).`,
      );
    }
  }

  // Confidence distribution
  const c = s.confidence;
  if (c.high === 0 && c.medium === 0 && c.low > 0) {
    out.push(
      `No high- or medium-confidence candidates yet — every signal is from a single layer of the file tree. A second-pass Tier 2 read (with file contents) would clarify which are real.`,
    );
  } else if (c.high > 0) {
    out.push(
      `${c.high} candidate${c.high === 1 ? "" : "s"} appear across all 3 layers (model + api + ui) — strongest evidence we have.`,
    );
  }

  // Filtered noise
  if ((s.filtered_candidates ?? 0) > 0) {
    const ex = (s.filtered_examples ?? []).slice(0, 3).join(", ");
    out.push(
      `Filtered out ${s.filtered_candidates} infrastructure/utility names (e.g., ${ex}) — flag if any of those look like real product concepts.`,
    );
  }

  return out;
}

function readQueue(): QueueItem[] {
  if (!existsSync(queuePath)) return [];
  return readFileSync(queuePath, "utf-8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as QueueItem);
}

function readOutputs(step: string): Array<{ file: string; data: unknown }> {
  const dir = join(outputsRoot, step);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => ({
      file: f,
      data: JSON.parse(readFileSync(join(dir, f), "utf-8")),
    }));
}

function loadServerInfo(): ServerInfo {
  return JSON.parse(readFileSync(serverFile, "utf-8")) as ServerInfo;
}

async function handleRequest(req: Request): Promise<Response> {
  // One top-level guard so a malformed JSON body (req.json() throws), a
  // surprise filesystem error, or any other thrown exception lands as a 400
  // instead of crashing Bun's fetch handler. Path-traversal and validation
  // errors still flow through rejectInvalidStep/jsonResponse explicitly.
  try {
    return await routeRequest(req);
  } catch (e) {
    const msg = (e as Error).message ?? String(e);
    return jsonResponse({ error: `request failed: ${msg}` }, 400);
  }
}

// In-memory debounce for /api/canvas/save/<step>. Two Save clicks within
// SAVE_DEBOUNCE_MS collapse to one — the canvas occasionally double-fires
// on a single click and a stale duplicate wakes Raven twice. Keyed by
// `step|nextStep` so a genuine re-save targeting a different next step
// still lands. In-memory is correct here: a debounce window that survives
// process restarts isn't useful.
const SAVE_DEBOUNCE_MS = 500;
// Ping rate limit — director can't flood the watcher by hammering
// the "Ping Raven" button. Wider window than save-debounce because
// pings are deliberate "wake me, please" gestures, not accidental
// double-clicks. Uses the same recentSaves Map; key prefix avoids
// collision with step-save debouncing.
const PING_DEBOUNCE_MS = 5_000;
const recentSaves = new Map<string, number>();

async function routeRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (req.method === "POST" && pathname === "/api/intent") {
    const body = (await req.json()) as {
      step?: string;
      action?: string;
      params?: Record<string, unknown>;
    };
    if (!body.step || !body.action) {
      return jsonResponse({ error: "step and action required" }, 400);
    }
    if (!isValidStep(body.step)) return rejectInvalidStep(body.step);
    const intent: IntentRecord = {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      step: body.step,
      action: body.action,
      params: body.params,
      processed: false,
    };
    appendFileSync(intentsPath, JSON.stringify(intent) + "\n");
    return jsonResponse({ ok: true, intent });
  }

  if (req.method === "GET" && pathname.startsWith("/api/outputs/")) {
    const step = pathname.slice("/api/outputs/".length);
    if (!isValidStep(step)) return rejectInvalidStep(step);
    return jsonResponse({ step, outputs: readOutputs(step) });
  }

  if (req.method === "GET" && pathname === "/api/server-info") {
    return jsonResponse(loadServerInfo());
  }

  if (req.method === "POST" && pathname === "/api/step-complete") {
    const body = (await req.json()) as { step?: string; note?: string };
    if (!body.step) {
      return jsonResponse({ error: "step required" }, 400);
    }
    if (!isValidStep(body.step)) return rejectInvalidStep(body.step);
    const event = {
      ts: new Date().toISOString(),
      type: "step-complete",
      step: body.step,
      note: body.note,
    };
    appendFileSync(stepEventsPath, JSON.stringify(event) + "\n");
    return jsonResponse({ ok: true, event });
  }

  // Save-and-advance: records a step-complete event AND broadcasts a
  // navigation hint via SSE so the canvas can transition to the next step.
  if (req.method === "POST" && pathname.startsWith("/api/canvas/save/")) {
    const step = pathname.slice("/api/canvas/save/".length);
    if (!isValidStep(step)) return rejectInvalidStep(step);
    const body = (await req.json()) as { nextStep?: string };
    if (body.nextStep != null && !isValidStep(body.nextStep)) return rejectInvalidStep(body.nextStep);
    const debounceKey = `${step}|${body.nextStep ?? ""}`;
    const now = Date.now();
    const lastSaveTs = recentSaves.get(debounceKey);
    if (lastSaveTs != null && now - lastSaveTs < SAVE_DEBOUNCE_MS) {
      // Coalesce: refresh the timestamp so a triple-click stays suppressed
      // for the full debounce window, but skip the side effects.
      recentSaves.set(debounceKey, now);
      return jsonResponse({ ok: true, coalesced: true });
    }
    recentSaves.set(debounceKey, now);
    const event = {
      ts: new Date().toISOString(),
      type: "step-save",
      step,
      nextStep: body.nextStep,
    };
    appendFileSync(stepEventsPath, JSON.stringify(event) + "\n");
    writeNavigation({ to: body.nextStep || step, from: step });
    notifyAllSteps();
    return jsonResponse({ ok: true, event });
  }

  // Ping — director hit "Ping Raven" on the bench. Emits a ping event
  // for the watcher → Raven wakes on her next turn with the event +
  // any other accumulated activity since her last wake. Rate-limited
  // to 1 per 5s per step so the bench can't flood the watcher.
  if (req.method === "POST" && pathname === "/api/canvas/ping") {
    const body = (await req.json().catch(() => ({}))) as { step?: string };
    const step = typeof body.step === "string" ? body.step : "?";
    if (step !== "?" && !isValidStep(step)) return rejectInvalidStep(step);
    const debounceKey = `ping|${step}`;
    const now = Date.now();
    const lastPing = recentSaves.get(debounceKey);
    if (lastPing != null && now - lastPing < PING_DEBOUNCE_MS) {
      recentSaves.set(debounceKey, now);
      return jsonResponse({ ok: true, coalesced: true });
    }
    recentSaves.set(debounceKey, now);
    const event = {
      ts: new Date().toISOString(),
      type: "ping",
      step,
    };
    appendFileSync(stepEventsPath, JSON.stringify(event) + "\n");
    return jsonResponse({ ok: true, event });
  }

  // Review request — asks Raven to look at the current state and react
  // WITHOUT advancing. Logs a review-request event so the watcher wakes
  // Raven; no navigation change.
  if (req.method === "POST" && pathname.startsWith("/api/canvas/review/")) {
    const step = pathname.slice("/api/canvas/review/".length);
    if (!isValidStep(step)) return rejectInvalidStep(step);
    const event = {
      ts: new Date().toISOString(),
      type: "review-request",
      step,
    };
    appendFileSync(stepEventsPath, JSON.stringify(event) + "\n");
    notifyAllSteps();
    return jsonResponse({ ok: true, event });
  }

  if (req.method === "GET" && pathname === "/api/step-events") {
    if (!existsSync(stepEventsPath)) return jsonResponse({ events: [] });
    const events = readFileSync(stepEventsPath, "utf-8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l));
    return jsonResponse({ events });
  }

  if (req.method === "GET" && pathname.startsWith("/api/stream/")) {
    const step = pathname.slice("/api/stream/".length);
    if (!isValidStep(step)) return rejectInvalidStep(step);
    const sincePos = parseInt(url.searchParams.get("since") || "0", 10);
    const sf = join(streamsRoot, `${step}.jsonl`);
    if (!existsSync(sf)) return jsonResponse({ events: [], cursor: 0 });
    const text = readFileSync(sf, "utf-8");
    const slice = text.slice(sincePos);
    const events = slice
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l));
    return jsonResponse({ events, cursor: text.length });
  }

  if (req.method === "POST" && pathname === "/api/stream/clear") {
    const body = (await req.json()) as { step?: string };
    if (!body.step) return jsonResponse({ error: "step required" }, 400);
    if (!isValidStep(body.step)) return rejectInvalidStep(body.step);
    const sf = join(streamsRoot, `${body.step}.jsonl`);
    if (existsSync(sf)) writeFileSync(sf, "");
    return jsonResponse({ ok: true });
  }

  if (req.method === "POST" && pathname === "/api/demo/codebase-scan") {
    const body = (await req.json()) as { path?: string };
    const scanPath = body.path || ".";
    // Confine the scan to a path inside the project root so a stray POST
    // can't ask the server to walk arbitrary disk locations.
    const resolvedScan = resolve(args.projectRoot, scanPath);
    if (!resolvedScan.startsWith(args.projectRoot + sep) && resolvedScan !== args.projectRoot) {
      return jsonResponse({ error: "scan path must be inside project root" }, 400);
    }
    // Fire-and-forget: write any unexpected failure into the scan's stream
    // file so the canvas surfaces it rather than crashing the process.
    runDemoCodebaseScan(resolvedScan).catch((e: unknown) => {
      appendStream("codebase-scan", {
        type: "error",
        message: `scan crashed: ${(e as Error).message ?? String(e)}`,
      });
    });
    return jsonResponse({ ok: true, message: "demo started" });
  }

  if (req.method === "GET" && pathname.startsWith("/api/synthesis/")) {
    const step = pathname.slice("/api/synthesis/".length);
    if (!isValidStep(step)) return rejectInvalidStep(step);
    return jsonResponse(loadSynthesis(step));
  }

  // ── Vision (step 1.4) — slot-shaped state for the Vision Builder ─────────
  if (req.method === "GET" && pathname === "/api/canvas/vision") {
    return jsonResponse(readVision());
  }
  if (req.method === "POST" && pathname === "/api/canvas/vision/sources") {
    const body = (await req.json()) as { sources?: string[]; by?: VisionActor };
    if (!Array.isArray(body.sources)) {
      return jsonResponse({ error: "sources (array of strings) required" }, 400);
    }
    const by: VisionActor = body.by === "raven" ? "raven" : "director";
    const v = readVision();
    const ts = new Date().toISOString();
    for (const raw of body.sources) {
      if (typeof raw !== "string" || !raw.trim()) continue;
      v.sources.push({ raw: raw.trim(), addedBy: by, ts });
    }
    writeVision(v);
    notifyVision();
    const event = { ts, type: "vision-sources-handed", count: body.sources.length, by };
    appendFileSync(stepEventsPath, JSON.stringify(event) + "\n");
    return jsonResponse({ ok: true, vision: v });
  }
  if (req.method === "POST" && pathname.startsWith("/api/canvas/vision/slot/")) {
    const id = pathname.slice("/api/canvas/vision/slot/".length);
    if (!isValidVisionSlotId(id)) {
      return jsonResponse({ error: `invalid slot id: ${JSON.stringify(id)}` }, 400);
    }
    const body = (await req.json()) as { text?: string; by?: VisionActor };
    if (typeof body.text !== "string") {
      return jsonResponse({ error: "text (string) required" }, 400);
    }
    const by: VisionActor = body.by === "raven" ? "raven" : "director";
    const v = readVision();
    v.slots[id].text = body.text;
    v.slots[id].lastWritten = { ts: new Date().toISOString(), by };
    writeVision(v);
    notifyVision();
    return jsonResponse({ ok: true, slot: v.slots[id] });
  }
  if (req.method === "POST" && pathname.startsWith("/api/canvas/vision/scratch/")) {
    const id = pathname.slice("/api/canvas/vision/scratch/".length);
    if (!isValidVisionSlotId(id)) {
      return jsonResponse({ error: `invalid slot id: ${JSON.stringify(id)}` }, 400);
    }
    const body = (await req.json()) as { scratch?: string; by?: VisionActor };
    if (typeof body.scratch !== "string") {
      return jsonResponse({ error: "scratch (string) required" }, 400);
    }
    const by: VisionActor = body.by === "raven" ? "raven" : "director";
    const v = readVision();
    v.slots[id].scratch = body.scratch;
    v.slots[id].lastWritten = { ts: new Date().toISOString(), by };
    writeVision(v);
    notifyVision();
    return jsonResponse({ ok: true, slot: v.slots[id] });
  }
  if (req.method === "POST" && pathname.startsWith("/api/canvas/vision/notch/")) {
    const id = pathname.slice("/api/canvas/vision/notch/".length);
    if (!isValidVisionSlotId(id)) {
      return jsonResponse({ error: `invalid slot id: ${JSON.stringify(id)}` }, 400);
    }
    const body = (await req.json()) as { notch?: number; by?: VisionActor };
    if (!isValidNotch(body.notch)) {
      return jsonResponse({ error: "notch must be 0|1|2|3" }, 400);
    }
    const by: VisionActor = body.by === "raven" ? "raven" : "director";
    const v = readVision();
    const previousNotch = v.slots[id].notch;
    v.slots[id].notch = body.notch;
    v.slots[id].lastWritten = { ts: new Date().toISOString(), by };
    writeVision(v);
    notifyVision();
    // When the director sets a slot's notch to Build (1), that's an
    // explicit "I want elicitation on this slot" — emit a wake event
    // so Raven's vision-elicitation skill engages on her next turn.
    // Skipped when previous state was already Build (slider drag
    // through values doesn't repeat-trigger), when Raven herself set
    // it, or when the destination is any other state.
    if (by === "director" && body.notch === 1 && previousNotch !== 1) {
      const event = {
        ts: new Date().toISOString(),
        type: "vision-section-help",
        slot: id,
      };
      appendFileSync(stepEventsPath, JSON.stringify(event) + "\n");
    }
    return jsonResponse({ ok: true, slot: v.slots[id] });
  }
  if (req.method === "POST" && pathname === "/api/canvas/vision/bank") {
    const v = readVision();
    v.banked = true;
    v.bankedAt = new Date().toISOString();
    writeVision(v);
    notifyVision();
    const event = { ts: v.bankedAt, type: "vision-banked" };
    appendFileSync(stepEventsPath, JSON.stringify(event) + "\n");
    return jsonResponse({ ok: true, vision: v });
  }
  if (req.method === "POST" && pathname === "/api/canvas/vision/reset") {
    writeVision(freshVisionState());
    notifyVision();
    return jsonResponse({ ok: true });
  }
  if (req.method === "GET" && pathname === "/api/vision-stream") {
    const encoder = new TextEncoder();
    let sub: Subscriber | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        sub = { controller, encoder };
        subscribeVision(sub);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(readVision())}\n\n`));
        heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          } catch (_e) {
            if (heartbeat) clearInterval(heartbeat);
          }
        }, 30_000);
      },
      cancel() {
        if (sub) unsubscribeVision(sub);
        if (heartbeat) clearInterval(heartbeat);
      },
    });
    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
        "x-accel-buffering": "no",
      },
    });
  }

  // ── Live canvas state: synthesis + applied overrides ────────────────────
  if (req.method === "GET" && pathname.startsWith("/api/canvas/")) {
    const step = pathname.slice("/api/canvas/".length);
    if (!isValidStep(step)) return rejectInvalidStep(step);
    return jsonResponse(computeCanvasState(step));
  }

  // Live updates via Server-Sent Events. Initial state goes out immediately,
  // then anyone (director or Raven) mutating canvas state pushes to all
  // connected viewers.
  if (req.method === "GET" && pathname.startsWith("/api/canvas-stream/")) {
    const step = pathname.slice("/api/canvas-stream/".length);
    if (!isValidStep(step)) return rejectInvalidStep(step);
    const encoder = new TextEncoder();
    let sub: Subscriber | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        sub = { controller, encoder };
        subscribe(step, sub);
        // Initial state
        const initial = computeCanvasState(step);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initial)}\n\n`));
        // Keep connection alive (comment lines per SSE spec)
        heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          } catch (_e) {
            if (heartbeat) clearInterval(heartbeat);
          }
        }, 30_000);
      },
      cancel() {
        if (sub) unsubscribe(step, sub);
        if (heartbeat) clearInterval(heartbeat);
      },
    });
    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
        "x-accel-buffering": "no",
      },
    });
  }

  // Director's direct edit to a noun (no proposal step — their edits land).
  if (req.method === "POST" && pathname.startsWith("/api/canvas/edit-noun/")) {
    const step = pathname.slice("/api/canvas/edit-noun/".length);
    if (!isValidStep(step)) return rejectInvalidStep(step);
    const body = (await req.json()) as { nounId?: string; newText?: string };
    if (!body.nounId || !body.newText) {
      return jsonResponse({ error: "nounId and newText required" }, 400);
    }
    const ov = applyNounEdit(step, body.nounId, body.newText, "director");
    notifyStep(step);
    return jsonResponse({ ok: true, override: ov });
  }

  // Record a proposal (Raven via canvas-bridge, or anyone).
  if (req.method === "POST" && pathname.startsWith("/api/canvas/propose/")) {
    const step = pathname.slice("/api/canvas/propose/".length);
    if (!isValidStep(step)) return rejectInvalidStep(step);
    const body = (await req.json()) as {
      nounId?: string;
      proposedText?: string;
      reason?: string;
      proposedBy?: "raven" | "user";
    };
    if (!body.nounId || !body.proposedText) {
      return jsonResponse({ error: "nounId and proposedText required" }, 400);
    }
    const currentText = currentNounText(step, body.nounId);
    if (currentText == null) {
      return jsonResponse({ error: "unknown nounId" }, 404);
    }
    const prop: ProposalRecord = {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      step,
      kind: "noun-change",
      nounId: body.nounId,
      currentText,
      proposedText: body.proposedText,
      reason: body.reason,
      proposedBy: body.proposedBy === "user" ? "user" : "raven",
      status: "pending",
    };
    appendProposal(step, prop);
    notifyStep(step);
    return jsonResponse({ ok: true, proposal: prop });
  }

  if (req.method === "POST" && pathname.startsWith("/api/canvas/accept/")) {
    const step = pathname.slice("/api/canvas/accept/".length);
    if (!isValidStep(step)) return rejectInvalidStep(step);
    const body = (await req.json()) as { proposalId?: string };
    if (!body.proposalId) return jsonResponse({ error: "proposalId required" }, 400);
    const result = resolveProposal(step, body.proposalId, "accepted");
    if (result.ok) notifyStep(step);
    return jsonResponse(result);
  }

  // Global product logo — shared across all step views via Band-1 Product
  // tile. Posting from any step's surface notifies every connected step.
  if (req.method === "POST" && pathname === "/api/canvas/logo") {
    const body = (await req.json()) as { filename?: string; dataUrl?: string; by?: "director" | "raven" };
    if (!body.filename || !body.dataUrl) return jsonResponse({ error: "filename and dataUrl required" }, 400);
    const l = writeLogo(body.filename, body.dataUrl, body.by === "raven" ? "raven" : "director");
    notifyAllSteps();
    return jsonResponse({ ok: true, logo: l });
  }
  // Product name — global, drives the step-1.2 rail label.
  if (req.method === "POST" && pathname === "/api/canvas/product-name") {
    const body = (await req.json()) as { name?: string; by?: "director" | "raven" };
    if (!body.name) return jsonResponse({ error: "name required" }, 400);
    const m = writeProductMeta(body.name, body.by === "raven" ? "raven" : "director");
    notifyAllSteps();
    return jsonResponse({ ok: true, productMeta: m });
  }

  // Wells inventory — global; PATCH-like semantics (partial body OK).
  if (req.method === "POST" && pathname === "/api/canvas/wells") {
    const body = (await req.json()) as Partial<Wells>;
    const w = writeWells(body);
    notifyAllSteps();
    return jsonResponse({ ok: true, wells: w });
  }

  // Raven calls this from the describe-logo play AFTER her chat description.
  // Flipping this true unlocks the Keep/Replace/Delete/Save controls in the
  // step 1.1 body. Before that, the canvas shows a "tell Raven about this"
  // hint and withholds the action panel.
  if (req.method === "POST" && pathname === "/api/canvas/logo/acknowledge") {
    const l = acknowledgeLogo();
    if (!l) return jsonResponse({ error: "no logo to acknowledge" }, 404);
    notifyAllSteps();
    return jsonResponse({ ok: true, logo: l });
  }

  if (req.method === "DELETE" && pathname === "/api/canvas/logo") {
    if (existsSync(logoFile)) {
      try {
        unlinkSync(logoFile);
      } catch (_e) {
        /* ignore */
      }
    }
    notifyAllSteps();
    return jsonResponse({ ok: true });
  }

  if (req.method === "POST" && pathname.startsWith("/api/canvas/recap/")) {
    const step = pathname.slice("/api/canvas/recap/".length);
    if (!isValidStep(step)) return rejectInvalidStep(step);
    const body = (await req.json()) as { text?: string; by?: "director" | "raven" };
    if (!body.text) return jsonResponse({ error: "text required" }, 400);
    const rec = writeRecap(step, body.text, body.by === "raven" ? "raven" : "director");
    notifyStep(step);
    return jsonResponse({ ok: true, recap: rec });
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/canvas/recap/")) {
    const step = pathname.slice("/api/canvas/recap/".length);
    if (!isValidStep(step)) return rejectInvalidStep(step);
    const p = recapFile(step);
    if (existsSync(p)) {
      try {
        unlinkSync(p);
      } catch (_e) {
        /* ignore */
      }
    }
    notifyStep(step);
    return jsonResponse({ ok: true });
  }

  if (req.method === "POST" && pathname.startsWith("/api/canvas/reject/")) {
    const step = pathname.slice("/api/canvas/reject/".length);
    if (!isValidStep(step)) return rejectInvalidStep(step);
    const body = (await req.json()) as { proposalId?: string };
    if (!body.proposalId) return jsonResponse({ error: "proposalId required" }, 400);
    const result = resolveProposal(step, body.proposalId, "rejected");
    if (result.ok) notifyStep(step);
    return jsonResponse(result);
  }

  if (req.method === "GET" && pathname === "/api/queue") {
    const status = url.searchParams.get("status"); // "open" | "done" | null = all
    const items = readQueue();
    const filtered = status ? items.filter((i) => i.status === status) : items;
    return jsonResponse({ items: filtered });
  }

  if (req.method === "POST" && pathname === "/api/queue") {
    const body = (await req.json()) as Partial<QueueItem>;
    if (!body.title) {
      return jsonResponse({ error: "title required" }, 400);
    }
    if (body.step != null && !isValidStep(body.step)) return rejectInvalidStep(body.step);
    const origin: QueueOrigin = body.origin === "rule" || body.origin === "raven" ? body.origin : "user";
    const item: QueueItem = {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      origin,
      step: body.step,
      title: body.title,
      reason: body.reason,
      detail: body.detail,
      status: "open",
    };
    appendFileSync(queuePath, JSON.stringify(item) + "\n");
    return jsonResponse({ ok: true, item });
  }

  if (req.method === "POST" && pathname === "/api/queue/done") {
    const body = (await req.json()) as { id?: string };
    if (!body.id) return jsonResponse({ error: "id required" }, 400);
    const items = readQueue();
    let updated = false;
    const next = items.map((i) => {
      if (i.id === body.id && i.status === "open") {
        updated = true;
        return { ...i, status: "done" as const, doneAt: new Date().toISOString() };
      }
      return i;
    });
    if (!updated) return jsonResponse({ error: "not found or already done" }, 404);
    writeFileSync(queuePath, next.map((i) => JSON.stringify(i)).join("\n") + "\n");
    return jsonResponse({ ok: true });
  }

  // Static file serving from canvasRoot.
  const requested = pathname === "/" ? "/product-library-v0.1.html" : pathname;
  const fullPath = resolve(canvasRoot, "." + requested);
  // Require a separator (or exact match) so canvasRoot="/x/canvas" doesn't
  // accept a request resolving into "/x/canvas-other/...".
  if (fullPath !== canvasRoot && !fullPath.startsWith(canvasRoot + sep)) {
    return new Response("Forbidden", { status: 403 });
  }
  if (existsSync(fullPath)) {
    // No-cache for dev so JS/HTML edits land on every reload.
    return new Response(Bun.file(fullPath), {
      headers: { "cache-control": "no-cache, no-store, must-revalidate" },
    });
  }
  return new Response("Not Found", { status: 404 });
}

let server: ReturnType<typeof Bun.serve>;
try {
  server = Bun.serve({ hostname: "127.0.0.1", port: args.port, fetch: handleRequest });
} catch (e) {
  // Likely EADDRINUSE — port is held by a previous (perhaps zombie) instance.
  // Fall back to OS-picked and warn loudly so the URL is still discoverable.
  console.warn(`Port ${args.port} unavailable (${(e as Error).message}); using OS-picked.`);
  server = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: handleRequest });
}

const serverInfo: ServerInfo = {
  pid: process.pid,
  port: server.port,
  projectRoot: args.projectRoot,
  startedAt: new Date().toISOString(),
};
writeFileSync(serverFile, JSON.stringify(serverInfo, null, 2) + "\n");

console.log(`Canvas server: http://127.0.0.1:${server.port}/`);
console.log(`  project root: ${args.projectRoot}`);
console.log(`  state dir:    ${stateRoot}`);
console.log(`  pid:          ${process.pid}`);
