/**
 * Decode the dropped-logo data URL the canvas wrote to .canvas-state/logo.json
 * and write the bytes to a temp file. Print the temp path on stdout so Raven
 * can Read the image (multimodal).
 *
 * Replaces an earlier inline `python3 -c "import base64; ..."` snippet so the
 * describe-logo play stays on Bun — same runtime as the canvas server.
 *
 * Usage:
 *   bun run scripts/canvas-decode-logo.ts
 *   bun run scripts/canvas-decode-logo.ts --project-root <path>
 */

import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

import { projectRootFromArgs } from "./_canvas-paths";

const root = projectRootFromArgs(process.argv.slice(2));
const logoFile = join(root, "docs/alexandria/.canvas-state/logo.json");

if (!existsSync(logoFile)) {
  console.error(`no logo at ${logoFile}`);
  process.exit(1);
}

interface LogoRecord {
  filename?: string;
  dataUrl?: string;
}
let rec: LogoRecord;
try {
  rec = JSON.parse(readFileSync(logoFile, "utf-8")) as LogoRecord;
} catch (e) {
  console.error(`failed to parse logo.json: ${(e as Error).message}`);
  process.exit(1);
}
if (!rec.dataUrl) {
  console.error("logo.json has no dataUrl");
  process.exit(1);
}

// data:image/png;base64,iVBOR...   →  strip the header, decode the payload.
const comma = rec.dataUrl.indexOf(",");
if (comma < 0) {
  console.error("dataUrl missing comma separator");
  process.exit(1);
}
const header = rec.dataUrl.slice(0, comma);
const payload = rec.dataUrl.slice(comma + 1);
// Pick a sensible extension from the mime type if possible.
const mimeMatch = header.match(/^data:([^;]+);base64/);
const mime = mimeMatch ? mimeMatch[1] : "image/png";
const ext = mime === "image/svg+xml" ? "svg" : mime.split("/")[1] || "png";
// mkdtemp so two simultaneous drops can't race on the same path and so a
// stale file from a prior session doesn't get re-read by mistake.
const outDir = mkdtempSync(join(tmpdir(), "canvas-logo-"));
const outPath = join(outDir, `dropped-logo.${ext}`);

const bytes = Uint8Array.from(Buffer.from(payload, "base64"));
writeFileSync(outPath, bytes);

console.log(outPath);
if (rec.filename) console.log(`(original: ${rec.filename})`);
