import { existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// Invoke this same CLI as a child process: the compiled binary re-executes
// itself; source runs go through the entry module.
export function axCliCommand(args: string[]): string[] {
  const entryPath = resolve(dirname(fileURLToPath(import.meta.url)), "../cli/main.ts");
  return existsSync(entryPath)
    ? [process.execPath, entryPath, ...args]
    : [process.execPath, ...args];
}
