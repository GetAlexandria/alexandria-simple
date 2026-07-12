import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join, resolve } from "path";

const INTERNAL_ROOT = resolve(import.meta.dir, "../../..");
const DEFAULT_OUTPUT_DIR = resolve(INTERNAL_ROOT, ".release-artifacts");
const DEFAULT_SITE_REPO_DIR = resolve(INTERNAL_ROOT, "../alexandria-site");

export function parseLatestChangelogEntry(
  changelog: string,
  version: string,
): {
  date: string;
  body: string;
} {
  const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(
    `## \\[${escapedVersion}\\] — (\\d{4}-\\d{2}-\\d{2})\\n([\\s\\S]*?)(?:\\n## \\[|$)`,
  ).exec(changelog);

  if (!match) {
    throw new Error(`Could not find CHANGELOG entry for ${version}`);
  }

  return {
    date: match[1]!,
    body: match[2]!.trim(),
  };
}

function assertCanonicalTarget(value: string | undefined): void {
  if (value == null || value.length === 0 || value === "alexandria") {
    return;
  }

  throw new Error(`Unsupported release target: ${value}`);
}

function removeLegacySiteArchives(downloadsTargetDir: string): void {
  const patterns = [
    "alexandria-plugin-v*.tar.gz",
    "alexandria-next-plugin-v*.tar.gz",
    "ax-v*.tar.gz",
    "ax2-v*.tar.gz",
    "fabro-v*.tar.gz",
  ];

  for (const pattern of patterns) {
    for (const existing of new Bun.Glob(pattern).scanSync(downloadsTargetDir)) {
      rmSync(join(downloadsTargetDir, existing), { force: true });
    }
  }
}

interface UpdateSiteReleaseOptions {
  outputDir?: string;
  siteRepoDir?: string;
  changelogPath?: string;
  prNumber?: number;
  prUrl?: string;
  target?: string;
}

export function updateSiteRelease(
  options: UpdateSiteReleaseOptions = {},
): void {
  assertCanonicalTarget(options.target ?? process.env.ALEXANDRIA_RELEASE_TARGET);

  const outputDir = resolve(
    options.outputDir ?? process.env.ALEXANDRIA_RELEASE_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR,
  );
  const siteRepoDir = resolve(
    options.siteRepoDir ?? process.env.ALEXANDRIA_SITE_REPO_DIR ?? DEFAULT_SITE_REPO_DIR,
  );
  const changelogPath = resolve(options.changelogPath ?? join(INTERNAL_ROOT, "CHANGELOG.md"));
  const prNumber = options.prNumber ?? Number(process.env.ALEXANDRIA_RELEASE_PR_NUMBER ?? "0");
  const prUrl = options.prUrl ?? process.env.ALEXANDRIA_RELEASE_PR_URL ?? "";

  if (!existsSync(join(siteRepoDir, ".git"))) {
    throw new Error(`Expected site repo checkout at ${siteRepoDir}`);
  }

  const downloadsTargetDir = join(siteRepoDir, "public", "downloads");
  mkdirSync(downloadsTargetDir, { recursive: true });
  removeLegacySiteArchives(downloadsTargetDir);
  rmSync(join(downloadsTargetDir, "alexandria-next"), {
    recursive: true,
    force: true,
  });
  rmSync(join(siteRepoDir, "public", "install-next.sh"), { force: true });

  const version = readFileSync(join(outputDir, "downloads", "latest-version.txt"), "utf8").trim();
  cpSync(
    join(outputDir, "downloads", "latest-version.txt"),
    join(downloadsTargetDir, "latest-version.txt"),
  );
  cpSync(join(outputDir, "install.sh"), join(siteRepoDir, "public", "install.sh"));
  writeFileSync(
    join(siteRepoDir, "src", "data", "version.json"),
    JSON.stringify({ version }, null, 2) + "\n",
  );

  const changelogEntry = parseLatestChangelogEntry(readFileSync(changelogPath, "utf8"), version);
  const siteChangelogPath = join(
    siteRepoDir,
    "src",
    "content",
    "changelog",
    `${changelogEntry.date}-v${version.replace(/\./g, "-")}.md`,
  );
  writeFileSync(
    siteChangelogPath,
    [
      "---",
      `version: '${version}'`,
      `date: '${changelogEntry.date}'`,
      `prNumber: ${prNumber}`,
      `prUrl: '${prUrl}'`,
      "---",
      "",
      `# v${version}`,
      "",
      changelogEntry.body,
      "",
    ].join("\n"),
  );

  console.log(`Updated Alexandria site release surfaces in ${siteRepoDir}`);
}

if (import.meta.main) {
  updateSiteRelease();
}
