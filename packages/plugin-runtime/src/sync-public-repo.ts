import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "fs";
import { dirname, join, resolve } from "path";

const INTERNAL_ROOT = resolve(import.meta.dir, "../../..");
const DEFAULT_PUBLIC_REPO_DIR = resolve(INTERNAL_ROOT, "../alexandria");
const PUBLIC_PLUGIN_DIR = "alexandria";

interface SyncItem {
  source: string;
  destination: string;
  filterMaintainerSkills?: boolean;
  optional?: boolean;
}

interface SyncPublicRepoOptions {
  targetRoot?: string;
  logger?: Pick<Console, "log">;
}

// packages/alexandria-marketplace (source of the public repo's root
// .claude-plugin/marketplace.json) was removed in the alexandria-simple
// pare-back; this needs revisiting once the release mechanism is decided.
const ROOT_SYNC_ITEMS: SyncItem[] = [
  { source: "README.public.md", destination: "README.md" },
  { source: "install.sh", destination: "install.sh" },
  {
    source: "packages/plugin-runtime/public/.github",
    destination: ".github",
  },
];

const ALEXANDRIA_PLUGIN_SYNC_ITEMS: SyncItem[] = [
  { source: "packages/alexandria-plugin/README.md", destination: "README.md" },
  { source: "LICENSE", destination: "LICENSE" },
  { source: "CHANGELOG.md", destination: "CHANGELOG.md" },
  {
    source: "packages/alexandria-plugin/.claude-plugin",
    destination: ".claude-plugin",
  },
  {
    source: "packages/alexandria-plugin/.codex-plugin",
    destination: ".codex-plugin",
  },
  {
    source: "packages/alexandria-plugin/monitors",
    destination: "monitors",
  },
  {
    source: "packages/alexandria-plugin/scripts",
    destination: "scripts",
  },
  {
    source: "packages/alexandria-plugin/agents",
    destination: "agents",
    optional: true,
  },
  {
    source: "packages/alexandria-plugin/skills",
    destination: "skills",
  },
  {
    source: "packages/alexandria-plugin/workflows",
    destination: "workflows",
  },
  {
    source: "packages/alexandria-plugin/docs",
    destination: "docs",
    optional: true,
  },
];

function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true });
}

function resetPublicRepo(targetRoot: string): void {
  for (const entry of readdirSync(targetRoot)) {
    if (entry === ".git" || entry === ".tmp") {
      continue;
    }

    rmSync(join(targetRoot, entry), { recursive: true, force: true });
  }
}

function shouldSkipSkillPath(relativePath: string): boolean {
  return relativePath === "maintainer" || relativePath.startsWith("maintainer/");
}

function copyDirectoryFiltered(
  sourceRoot: string,
  destinationRoot: string,
  skipPath: (relativePath: string) => boolean,
): void {
  ensureDirectory(destinationRoot);

  for (const entry of readdirSync(sourceRoot)) {
    const sourcePath = join(sourceRoot, entry);
    const destinationPath = join(destinationRoot, entry);
    const relativePath = sourcePath.slice(sourceRoot.length + 1);

    if (skipPath(relativePath)) {
      continue;
    }

    if (statSync(sourcePath).isDirectory()) {
      copyDirectoryFiltered(sourcePath, destinationPath, skipPath);
      continue;
    }

    ensureDirectory(dirname(destinationPath));
    cpSync(sourcePath, destinationPath, { dereference: true });
  }
}

function copyItem(item: SyncItem, targetRoot: string): void {
  const sourcePath = resolve(INTERNAL_ROOT, item.source);
  const destinationPath = resolve(targetRoot, item.destination);

  if (!existsSync(sourcePath)) {
    if (item.optional) {
      return;
    }

    throw new Error(`Missing sync source: ${item.source}`);
  }

  if (statSync(sourcePath).isDirectory()) {
    if (item.filterMaintainerSkills) {
      copyDirectoryFiltered(sourcePath, destinationPath, shouldSkipSkillPath);
      return;
    }

    ensureDirectory(dirname(destinationPath));
    cpSync(sourcePath, destinationPath, {
      recursive: true,
      dereference: true,
    });
    return;
  }

  ensureDirectory(dirname(destinationPath));
  cpSync(sourcePath, destinationPath, { dereference: true });
}

function copyItems(items: SyncItem[], targetRoot: string): void {
  for (const item of items) {
    copyItem(item, targetRoot);
  }
}

function writePublicGitignore(targetRoot: string): void {
  writeFileSync(join(targetRoot, ".gitignore"), [".tmp/", ".DS_Store"].join("\n") + "\n");
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function writePublicCodexMarketplace(targetRoot: string): void {
  const marketplacePath = resolve(INTERNAL_ROOT, ".agents/plugins/marketplace.json");
  const marketplace = JSON.parse(readFileSync(marketplacePath, "utf8")) as Record<string, unknown>;
  const plugins = marketplace.plugins;
  if (!Array.isArray(plugins)) {
    throw new Error(`Missing plugins array in ${marketplacePath}`);
  }

  const selectedPlugin = plugins.find(
    (plugin): plugin is Record<string, unknown> =>
      isJsonObject(plugin) && plugin.name === "alexandria",
  );
  if (selectedPlugin == null) {
    throw new Error(`Missing alexandria plugin in ${marketplacePath}`);
  }

  const outputPath = join(targetRoot, ".agents", "plugins", "marketplace.json");
  ensureDirectory(dirname(outputPath));
  writeFileSync(
    outputPath,
    `${JSON.stringify(
      {
        ...marketplace,
        name: "alexandria",
        interface: {
          ...(isJsonObject(marketplace.interface) ? marketplace.interface : {}),
          displayName: "Alexandria",
        },
        plugins: [
          {
            ...selectedPlugin,
            source: {
              source: "local",
              path: `./${PUBLIC_PLUGIN_DIR}`,
            },
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
}

function readPackageVersion(packageJsonPath: string): string {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
    version?: string;
  };

  if (!packageJson.version) {
    throw new Error(`Missing version in ${packageJsonPath}`);
  }

  return packageJson.version;
}

function readPluginManifestVersion(pluginJsonPath: string): string {
  const pluginJson = JSON.parse(readFileSync(pluginJsonPath, "utf8")) as {
    version?: string;
  };

  if (!pluginJson.version) {
    throw new Error(`Missing version in ${pluginJsonPath}`);
  }

  return pluginJson.version;
}

function writeGeneratedVersion(
  sourcePackageJson: string,
  sourcePluginJson: string,
  destinationRoot: string,
): void {
  const version = readPackageVersion(resolve(INTERNAL_ROOT, sourcePackageJson));
  const pluginVersion = readPluginManifestVersion(resolve(INTERNAL_ROOT, sourcePluginJson));
  if (version !== pluginVersion) {
    throw new Error(
      `Version mismatch: ${sourcePackageJson}=${version} ${sourcePluginJson}=${pluginVersion}`,
    );
  }

  writeFileSync(join(destinationRoot, "VERSION"), `${version}\n`);
}

export function syncPublicRepo(options: SyncPublicRepoOptions = {}): void {
  const targetRoot = resolve(
    options.targetRoot ?? process.env.ALEXANDRIA_PUBLIC_REPO_DIR ?? DEFAULT_PUBLIC_REPO_DIR,
  );

  if (!existsSync(join(targetRoot, ".git"))) {
    throw new Error(
      `Expected a git checkout at ${targetRoot}. Set ALEXANDRIA_PUBLIC_REPO_DIR if needed.`,
    );
  }

  resetPublicRepo(targetRoot);

  copyItems(ROOT_SYNC_ITEMS, targetRoot);

  const alexandriaRoot = join(targetRoot, PUBLIC_PLUGIN_DIR);
  copyItems(ALEXANDRIA_PLUGIN_SYNC_ITEMS, alexandriaRoot);
  writeGeneratedVersion(
    "packages/alexandria-plugin/package.json",
    "packages/alexandria-plugin/.claude-plugin/plugin.json",
    alexandriaRoot,
  );
  writePublicCodexMarketplace(targetRoot);

  writePublicGitignore(targetRoot);
  const logger = options.logger ?? console;
  logger.log(`Synced public payload into ${targetRoot}`);
}

if (import.meta.main) {
  syncPublicRepo();
}
