import { afterEach, describe, expect, test } from "bun:test";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { ensureAlexandriaCodexPluginInstalled } from "../src/domain/codex-plugin.js";

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-codex-plugin-"));
  tempDirs.push(dir);
  return dir;
}

function writeFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

// A project whose installed plugin payload carries the codex marketplace
// manifest and the plugin's codex manifest, so
// ensureAlexandriaCodexPluginInstalled resolves it.
function makeProjectWithMarketplace(): string {
  const projectRoot = makeTempDir();
  const pluginRoot = join(projectRoot, ".claude/plugins/alexandria");
  writeFile(
    join(pluginRoot, ".agents/plugins/marketplace.json"),
    JSON.stringify({
      name: "alexandria",
      plugins: [{ name: "alexandria", source: { path: "." } }],
    }),
  );
  writeFile(
    join(pluginRoot, ".codex-plugin/plugin.json"),
    JSON.stringify({ name: "alexandria", version: "0.0.0" }),
  );
  return projectRoot;
}

// A fake codex CLI whose `plugin marketplace add` fails with the given
// message while `plugin add` succeeds.
function makeFakeCodex(marketplaceAddError: string | null): string {
  const dir = makeTempDir();
  const path = join(dir, "codex");
  const failBlock =
    marketplaceAddError == null
      ? "exit 0"
      : `echo ${JSON.stringify(marketplaceAddError)} >&2\n  exit 1`;
  writeFile(
    path,
    `#!/bin/sh
if [ "$1" = "plugin" ] && [ "$2" = "marketplace" ] && [ "$3" = "add" ]; then
  ${failBlock}
fi
exit 0
`,
  );
  chmodSync(path, 0o755);
  return path;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("ensureAlexandriaCodexPluginInstalled", () => {
  test("tolerates a marketplace already added from a different source", async () => {
    const projectRoot = makeProjectWithMarketplace();
    const fakeCodex = makeFakeCodex(
      "Error: marketplace 'alexandria' is already added from a different source; remove it before adding this source",
    );

    const result = await ensureAlexandriaCodexPluginInstalled({
      env: { ...process.env, ALEXANDRIA_CODEX_BIN: fakeCodex, HOME: projectRoot },
      projectRoot,
    });

    // The existing marketplace still serves the plugin: `plugin add` runs and
    // the install succeeds instead of aborting `ax start all`.
    expect(result).toBeNull();
  });

  test("still surfaces other marketplace add failures", async () => {
    const projectRoot = makeProjectWithMarketplace();
    const fakeCodex = makeFakeCodex("Error: codex config is corrupted");

    const result = await ensureAlexandriaCodexPluginInstalled({
      env: { ...process.env, ALEXANDRIA_CODEX_BIN: fakeCodex, HOME: projectRoot },
      projectRoot,
    });

    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toContain("codex config is corrupted");
  });

  test("succeeds cleanly when marketplace add works", async () => {
    const projectRoot = makeProjectWithMarketplace();
    const fakeCodex = makeFakeCodex(null);

    const result = await ensureAlexandriaCodexPluginInstalled({
      env: { ...process.env, ALEXANDRIA_CODEX_BIN: fakeCodex, HOME: projectRoot },
      projectRoot,
    });

    expect(result).toBeNull();
  });
});
