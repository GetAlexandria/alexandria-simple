#!/usr/bin/env bun

import { Effect } from "effect";
import { runPmsCli } from "./router.js";
import { writeCliResult } from "./result.js";
import { NodeFileSystem } from "../effects/filesystem.js";

if (import.meta.main) {
  const result = await runPmsCli(process.argv.slice(2), process.cwd()).pipe(
    Effect.provide(NodeFileSystem),
    Effect.runPromise,
  );

  await writeCliResult(result);
  if (result.keepsProcessAlive !== true) {
    process.exit(result.exitCode);
  }
}
