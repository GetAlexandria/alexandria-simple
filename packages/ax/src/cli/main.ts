#!/usr/bin/env bun

import { Effect } from "effect";
import { runAxCli } from "./router.js";
import { writeCliResult } from "./result.js";
import { NodeCodexAppServer } from "../effects/codex-app-server.js";
import { NodeFileSystem } from "../effects/filesystem.js";
import { BunUpgradeRuntime } from "../effects/upgrade-runtime.js";
import { NodeViewerServer } from "../effects/viewer-server.js";

if (import.meta.main) {
  const result = await runAxCli(process.argv.slice(2), process.cwd()).pipe(
    Effect.provide(NodeFileSystem),
    Effect.provide(BunUpgradeRuntime),
    Effect.provide(NodeCodexAppServer),
    Effect.provide(NodeViewerServer),
    Effect.runPromise,
  );

  await writeCliResult(result);
  if (result.keepsProcessAlive !== true) {
    process.exit(result.exitCode);
  }
}
