import { existsSync, readdirSync, statSync } from "fs";
import { basename, join, relative, resolve } from "path";

const INTERNAL_ROOT = resolve(import.meta.dir, "../../..");
const DEFAULT_OUTPUT_DIR = resolve(INTERNAL_ROOT, ".release-artifacts");

interface UploadSpec {
  contentType: string;
  cacheControl: string;
  path: string;
  targetKey: string;
}

interface PublishReleaseDownloadsOptions {
  outputDir?: string;
  target?: string;
  env?: NodeJS.ProcessEnv;
  commandRunner?: (command: string[], env: NodeJS.ProcessEnv) => void;
  logger?: Pick<Console, "log">;
}

function assertCanonicalTarget(value: string | undefined): void {
  if (value == null || value.length === 0 || value === "alexandria") {
    return;
  }

  throw new Error(`Unsupported release target: ${value}`);
}

function requireEnv(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function isReleaseUpload(targetKey: string): boolean {
  return (
    targetKey === "latest-version.txt" ||
    targetKey.startsWith("alexandria-plugin-v") ||
    targetKey.startsWith("ax-v") ||
    targetKey.startsWith("fabro-v")
  );
}

function resolveUploadSpecs(downloadsDir: string): UploadSpec[] {
  const uploads: UploadSpec[] = [];
  const scan = (currentDir: string): void => {
    for (const entry of readdirSync(currentDir).sort()) {
      const path = join(currentDir, entry);
      if (statSync(path).isDirectory()) {
        scan(path);
        continue;
      }

      if (!statSync(path).isFile()) {
        continue;
      }

      const targetKey = relative(downloadsDir, path);
      if (!isReleaseUpload(targetKey)) {
        continue;
      }

      if (entry === "latest-version.txt") {
        uploads.push({
          path,
          targetKey,
          contentType: "text/plain; charset=utf-8",
          cacheControl: "no-store, must-revalidate",
        });
        continue;
      }

      if (!entry.endsWith(".tar.gz")) {
        continue;
      }

      uploads.push({
        path,
        targetKey,
        contentType: "application/gzip",
        cacheControl: "public, max-age=31536000, immutable",
      });
    }
  };

  scan(downloadsDir);
  return uploads;
}

function assertRequiredReleaseArtifacts(uploads: UploadSpec[]): void {
  const requiredArtifacts = [
    {
      description: "Alexandria latest-version.txt",
      exists: (upload: UploadSpec) => upload.targetKey === "latest-version.txt",
    },
    {
      description: "Alexandria plugin tarball",
      exists: (upload: UploadSpec) =>
        upload.targetKey.startsWith("alexandria-plugin-v"),
    },
    {
      description: "Alexandria CLI tarball",
      exists: (upload: UploadSpec) => upload.targetKey.startsWith("ax-v"),
    },
    {
      description: "Fabro sidecar tarball",
      exists: (upload: UploadSpec) => upload.targetKey.startsWith("fabro-v"),
    },
  ];

  for (const artifact of requiredArtifacts) {
    if (uploads.some(artifact.exists)) {
      continue;
    }

    throw new Error(`Missing required release artifact: ${artifact.description}`);
  }
}

function runCommand(command: string[], env: NodeJS.ProcessEnv): void {
  const proc = Bun.spawnSync(command, {
    cwd: INTERNAL_ROOT,
    env,
    stdout: "inherit",
    stderr: "inherit",
  });

  if ((proc.exitCode ?? 1) !== 0) {
    throw new Error(`Command failed: ${command.join(" ")}`);
  }
}

export function publishReleaseDownloads(
  options: PublishReleaseDownloadsOptions = {},
): void {
  const env = options.env ?? process.env;
  assertCanonicalTarget(options.target ?? env.ALEXANDRIA_RELEASE_TARGET);

  const outputDir = resolve(
    options.outputDir ?? env.ALEXANDRIA_RELEASE_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR,
  );
  const downloadsDir = join(outputDir, "downloads");

  if (!existsSync(downloadsDir)) {
    throw new Error(`Expected downloads directory at ${downloadsDir}`);
  }

  const bucket = requireEnv(env, "ALEXANDRIA_R2_BUCKET");
  const dryRun =
    env.ALEXANDRIA_R2_DRY_RUN === "1" ||
    env.ALEXANDRIA_R2_DRY_RUN === "true";

  const uploads = resolveUploadSpecs(downloadsDir);
  assertRequiredReleaseArtifacts(uploads);
  const commandRunner = options.commandRunner ?? runCommand;
  const logger = options.logger ?? console;
  const accountId = requireEnv(env, "ALEXANDRIA_R2_ACCOUNT_ID");

  for (const upload of uploads) {
    const command = [
      "wrangler",
      "r2",
      "object",
      "put",
      `${bucket}/${upload.targetKey}`,
      "--remote",
      "--file",
      upload.path,
      "--content-type",
      upload.contentType,
      "--cache-control",
      upload.cacheControl,
    ];

    if (dryRun) {
      logger.log(`[dry-run] ${command.join(" ")}`);
      continue;
    }

    const wranglerEnv: NodeJS.ProcessEnv = {
      ...env,
      CLOUDFLARE_API_TOKEN: requireEnv(env, "CLOUDFLARE_API_TOKEN"),
      CLOUDFLARE_ACCOUNT_ID: accountId,
    };

    commandRunner(command, wranglerEnv);
    logger.log(
      `Uploaded ${basename(upload.path)} to r2://${bucket}/${upload.targetKey}`,
    );
  }
}

if (import.meta.main) {
  publishReleaseDownloads();
}
