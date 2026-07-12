import { readFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

export interface AxBuildInfo {
  buildDate: string;
  gitSha: string;
  version: string;
}

function readPackageVersion(): string | null {
  try {
    const packageJson = JSON.parse(
      readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
    ) as { version?: unknown };
    return typeof packageJson.version === "string" && packageJson.version.length > 0
      ? packageJson.version
      : null;
  } catch {
    return null;
  }
}

function runGitShaLookup(): string | null {
  let proc: Bun.SyncSubprocess<"pipe", "ignore">;
  try {
    proc = Bun.spawnSync(["git", "rev-parse", "--short=7", "HEAD"], {
      cwd: dirname(fileURLToPath(import.meta.url)),
      stdout: "pipe",
      stderr: "ignore",
    });
  } catch {
    return null;
  }

  if ((proc.exitCode ?? 1) !== 0) {
    return null;
  }

  const sha = proc.stdout.toString().trim();
  return sha.length > 0 ? sha : null;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function readAxBuildInfo(): AxBuildInfo {
  return {
    version: process.env.AX_BUILD_VERSION ?? readPackageVersion() ?? "unknown",
    gitSha: process.env.AX_BUILD_GIT_SHA ?? runGitShaLookup() ?? "unknown",
    buildDate: process.env.AX_BUILD_DATE ?? todayUtc(),
  };
}
