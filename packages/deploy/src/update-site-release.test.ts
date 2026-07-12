import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { updateSiteRelease } from "./update-site-release.ts";

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

describe("updateSiteRelease", () => {
  test("updates canonical Alexandria site surfaces and removes legacy release files", () => {
    const outputDir = makeTempDir("site-release-output-");
    const siteRepoDir = makeTempDir("site-release-repo-");
    const changelogPath = join(makeTempDir("site-release-changelog-"), "CHANGELOG.md");

    mkdirSync(join(outputDir, "downloads"), { recursive: true });
    writeFileSync(join(outputDir, "downloads", "latest-version.txt"), "0.12.0\n");
    writeFileSync(join(outputDir, "install.sh"), "#!/bin/sh\necho installer\n");

    mkdirSync(join(siteRepoDir, ".git"), { recursive: true });
    mkdirSync(join(siteRepoDir, "public", "downloads"), { recursive: true });
    mkdirSync(join(siteRepoDir, "public", "downloads", "alexandria-next"), {
      recursive: true,
    });
    mkdirSync(join(siteRepoDir, "src", "data"), { recursive: true });
    mkdirSync(join(siteRepoDir, "src", "content", "changelog"), {
      recursive: true,
    });
    writeFileSync(join(siteRepoDir, "public", "install-next.sh"), "#!/bin/sh\necho old\n");
    writeFileSync(join(siteRepoDir, "public", "downloads", "ax-v0.11.0-linux-x64.tar.gz"), "old");
    writeFileSync(join(siteRepoDir, "public", "downloads", "ax2-v1.0.0-linux-x64.tar.gz"), "old");
    writeFileSync(
      join(siteRepoDir, "public", "downloads", "alexandria-plugin-v0.11.0.tar.gz"),
      "old",
    );
    writeFileSync(
      join(siteRepoDir, "public", "downloads", "alexandria-next-plugin-v1.0.0.tar.gz"),
      "old",
    );
    writeFileSync(join(siteRepoDir, "public", "downloads", "fabro-v0.11.0-linux-x64.tar.gz"), "old");
    writeFileSync(
      join(siteRepoDir, "public", "downloads", "alexandria-next", "latest-version.txt"),
      "1.0.0\n",
    );
    writeFileSync(join(siteRepoDir, "public", "downloads", "keep.txt"), "keep");

    writeFileSync(
      changelogPath,
      [
        "## [0.12.0] — 2026-06-16",
        "",
        "- Replace the legacy Alexandria release with Alexandria Next.",
        "- Publish one CLI, plugin, and installer.",
        "",
      ].join("\n"),
    );

    updateSiteRelease({
      outputDir,
      siteRepoDir,
      changelogPath,
      prNumber: 42,
      prUrl: "https://example.com/release",
    });

    expect(
      readFileSync(join(siteRepoDir, "public", "downloads", "latest-version.txt"), "utf8"),
    ).toBe("0.12.0\n");
    expect(readFileSync(join(siteRepoDir, "public", "install.sh"), "utf8")).toContain("installer");
    expect(existsSync(join(siteRepoDir, "public", "install-next.sh"))).toBeFalse();
    expect(existsSync(join(siteRepoDir, "public", "downloads", "alexandria-next"))).toBeFalse();
    expect(readFileSync(join(siteRepoDir, "src", "data", "version.json"), "utf8")).toBe(
      '{\n  "version": "0.12.0"\n}\n',
    );
    expect(
      existsSync(join(siteRepoDir, "public", "downloads", "ax-v0.11.0-linux-x64.tar.gz")),
    ).toBeFalse();
    expect(
      existsSync(join(siteRepoDir, "public", "downloads", "ax2-v1.0.0-linux-x64.tar.gz")),
    ).toBeFalse();
    expect(
      existsSync(join(siteRepoDir, "public", "downloads", "alexandria-plugin-v0.11.0.tar.gz")),
    ).toBeFalse();
    expect(
      existsSync(join(siteRepoDir, "public", "downloads", "alexandria-next-plugin-v1.0.0.tar.gz")),
    ).toBeFalse();
    expect(
      existsSync(join(siteRepoDir, "public", "downloads", "fabro-v0.11.0-linux-x64.tar.gz")),
    ).toBeFalse();
    expect(readFileSync(join(siteRepoDir, "public", "downloads", "keep.txt"), "utf8")).toBe("keep");

    const siteChangelog = readFileSync(
      join(siteRepoDir, "src", "content", "changelog", "2026-06-16-v0-12-0.md"),
      "utf8",
    );
    expect(siteChangelog).toContain("version: '0.12.0'");
    expect(siteChangelog).toContain("prNumber: 42");
    expect(siteChangelog).toContain("- Replace the legacy Alexandria release with Alexandria Next.");
    expect(siteChangelog).toContain("- Publish one CLI, plugin, and installer.");
  });

  test("rejects the removed Alexandria Next release target", () => {
    const outputDir = makeTempDir("site-release-output-");
    const siteRepoDir = makeTempDir("site-release-repo-");

    mkdirSync(join(outputDir, "downloads"), { recursive: true });
    writeFileSync(join(outputDir, "downloads", "latest-version.txt"), "0.12.0\n");
    writeFileSync(join(outputDir, "install.sh"), "#!/bin/sh\necho installer\n");
    mkdirSync(join(siteRepoDir, ".git"), { recursive: true });

    expect(() =>
      updateSiteRelease({
        outputDir,
        siteRepoDir,
        target: "alexandria-next",
      }),
    ).toThrow("Unsupported release target: alexandria-next");
  });
});
