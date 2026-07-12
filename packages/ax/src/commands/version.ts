import type { CliResult } from "../cli/result.js";
import { readAxBuildInfo } from "../domain/version.js";

export const VERSION_EXIT_CODES = {
  success: 0,
  invalidInput: 2,
} as const;

export function formatVersionHelp(): string {
  return [
    "Usage: ax version",
    "",
    "Print the installed Alexandria CLI version and build metadata.",
    "",
    "Options:",
    "  --help, -h  Show this help message.",
    "",
    "Exit codes:",
    "  0  Version printed.",
    "  2  Invalid input.",
  ].join("\n");
}

function formatField(label: string, value: string): string {
  return `${label.padEnd(14)}${value}`;
}

export function formatVersionOutput(): string {
  const buildInfo = readAxBuildInfo();

  return [
    formatField("Version:", buildInfo.version),
    formatField("Git SHA:", buildInfo.gitSha),
    formatField("Build Date:", buildInfo.buildDate),
  ].join("\n");
}

export function runVersion(args: string[]): CliResult {
  if (args.length > 0) {
    return {
      stdout: "",
      stderr: `Unknown option for ax version: ${args[0]}\n\n${formatVersionHelp()}`,
      exitCode: VERSION_EXIT_CODES.invalidInput,
    };
  }

  return {
    stdout: formatVersionOutput(),
    stderr: "",
    exitCode: VERSION_EXIT_CODES.success,
  };
}
