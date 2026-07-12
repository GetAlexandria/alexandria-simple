import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { syncPublicRepo } from "./sync-public-repo.ts";

const INTERNAL_ROOT = resolve(import.meta.dir, "../../..");
const tempDirs: string[] = [];

function makeTempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("syncPublicRepo", () => {
  test("syncs shared marketplace metadata and the canonical plugin payload", () => {
    const targetRoot = makeTempDir("alexandria-public-sync-");
    mkdirSync(join(targetRoot, ".git"), { recursive: true });
    writeFileSync(join(targetRoot, "stale.txt"), "remove me");

    syncPublicRepo({
      targetRoot,
      logger: { log() {} },
    });

    expect(existsSync(join(targetRoot, "stale.txt"))).toBeFalse();
    expect(existsSync(join(targetRoot, "install.sh"))).toBeTrue();
    expect(existsSync(join(targetRoot, "install-next.sh"))).toBeFalse();
    // packages/alexandria-marketplace (source of the root
    // .claude-plugin/marketplace.json) was removed in the alexandria-simple
    // pare-back, so the public repo no longer gets one synced.
    expect(existsSync(join(targetRoot, ".claude-plugin", "marketplace.json"))).toBeFalse();
    expect(existsSync(join(targetRoot, ".claude-plugin", "plugin.json"))).toBeFalse();
    expect(existsSync(join(targetRoot, ".agents", "plugins", "marketplace.json"))).toBeTrue();

    const codexMarketplace = JSON.parse(
      readFileSync(join(targetRoot, ".agents", "plugins", "marketplace.json"), "utf8"),
    ) as {
      interface: { displayName: string };
      name: string;
      plugins: Array<{
        name: string;
        source: { path: string; source: string };
      }>;
    };
    expect(codexMarketplace.name).toBe("alexandria");
    expect(codexMarketplace.interface.displayName).toBe("Alexandria");
    expect(codexMarketplace.plugins).toHaveLength(1);
    expect(codexMarketplace.plugins[0]).toEqual(
      expect.objectContaining({
        name: "alexandria",
        source: {
          source: "local",
          path: "./alexandria",
        },
      }),
    );

    expect(existsSync(join(targetRoot, "alexandria", ".claude-plugin", "plugin.json"))).toBeTrue();
    expect(existsSync(join(targetRoot, "alexandria", "agents", "openai.yaml"))).toBeTrue();
    expect(existsSync(join(targetRoot, "alexandria", "agents", "damien.md"))).toBeTrue();
    expect(existsSync(join(targetRoot, "alexandria", "agents", "raven.md"))).toBeTrue();
    expect(
      existsSync(join(targetRoot, "alexandria", "agents", "raven-resources", "library-model.md")),
    ).toBeTrue();
    expect(
      existsSync(join(targetRoot, "alexandria", "skills", "ax-library", "SKILL.md")),
    ).toBeFalse();
    expect(existsSync(join(targetRoot, "alexandria", "skills", "ax-start", "SKILL.md"))).toBeTrue();
    expect(
      existsSync(
        join(targetRoot, "alexandria", "workflows", "source-assessment", "workflow.fabro"),
      ),
    ).toBeTrue();

    const nextPackage = JSON.parse(
      readFileSync(join(INTERNAL_ROOT, "packages", "alexandria-plugin", "package.json"), "utf8"),
    ) as { version: string };
    expect(readFileSync(join(targetRoot, "alexandria", "VERSION"), "utf8")).toBe(
      `${nextPackage.version}\n`,
    );
  });
});
