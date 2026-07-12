import { Effect } from "effect";
import { existsSync } from "fs";
import type { CliResult } from "../cli/result.js";
import type { AcpProvider } from "../domain/config.js";
import { readConfiguredAcpProvider } from "../domain/orchestration-config.js";
import {
  commandEnv,
  resolveAlexandriaRuntimePaths,
  resolveAcpCommand,
  resolveFabroBinary,
  runCommandSync,
} from "../domain/orchestration.js";

export interface DoctorOptions {
  cwd: string;
  json: boolean;
}

interface CheckResult {
  detail: string;
  name: string;
  ok: boolean;
  reason?: string;
  remedy?: string;
  status: DoctorCheckStatus;
}

interface DoctorSummary {
  checks: CheckResult[];
  orchestrationReady: boolean;
  provider: AcpProvider;
  status: "ok" | "degraded";
}

export const DOCTOR_EXIT_CODES = {
  success: 0,
  degraded: 1,
  invalidInput: 2,
} as const;

type DoctorCheckStatus = "ok" | "warn" | "fail";

const AUTH_PROBE_TIMEOUT_MS = 8_000;
const PROBE_DETAIL_LIMIT = 500;

export function formatDoctorHelp(): string {
  return [
    "Usage: ax doctor [--json]",
    "",
    "Check Alexandria local orchestration readiness.",
    "",
    "Options:",
    "  --json      Emit machine-readable JSON.",
    "  --help, -h  Show this help message.",
    "",
    "Exit codes:",
    "  0  Orchestration is ready.",
    "  1  Orchestration is unavailable or degraded.",
    "  2  Invalid input.",
  ].join("\n");
}

function invalidInput(message: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${formatDoctorHelp()}`,
    exitCode: DOCTOR_EXIT_CODES.invalidInput,
  };
}

export function parseDoctorArgs(args: string[], cwd: string): CliResult | DoctorOptions {
  let json = false;

  for (const arg of args) {
    if (arg === "--json") {
      json = true;
      continue;
    }

    return invalidInput(`Unknown option for ax doctor: ${arg}`);
  }

  return { cwd, json };
}

function okCheck(name: string, detail: string): CheckResult {
  return {
    detail,
    name,
    ok: true,
    status: "ok",
  };
}

function failCheck(options: {
  detail: string;
  name: string;
  reason?: string;
  remedy?: string;
}): CheckResult {
  return {
    detail: options.detail,
    name: options.name,
    ok: false,
    ...(options.reason == null ? {} : { reason: options.reason }),
    ...(options.remedy == null ? {} : { remedy: options.remedy }),
    status: "fail",
  };
}

function warnCheck(options: { detail: string; name: string; reason?: string }): CheckResult {
  return {
    detail: options.detail,
    name: options.name,
    ok: false,
    ...(options.reason == null ? {} : { reason: options.reason }),
    status: "warn",
  };
}

function checkFabro(cwd: string): CheckResult {
  const paths = resolveAlexandriaRuntimePaths();
  const fabroBin = resolveFabroBinary();
  const result = runCommandSync({
    command: fabroBin,
    args: ["--version"],
    cwd,
    env: commandEnv(paths),
  });

  return result.exitCode === 0
    ? okCheck("fabro", `${fabroBin}: ${result.stdout.trim()}`)
    : failCheck({
        name: "fabro",
        detail: `Fabro unavailable via ${fabroBin}: ${result.stderr || result.stdout}`,
        reason: "fabro-unavailable",
      });
}

function probeOutput(result: { stderr: string; stdout: string }): string {
  return [result.stderr, result.stdout].filter((value) => value.trim().length > 0).join("\n");
}

function compactProbeOutput(output: string): string {
  const compacted = output.replace(/\s+/g, " ").trim();
  return compacted.length > PROBE_DETAIL_LIMIT
    ? `${compacted.slice(0, PROBE_DETAIL_LIMIT - 3)}...`
    : compacted;
}

function outputIncludesAny(normalizedOutput: string, patterns: string[]): boolean {
  return patterns.some((pattern) => normalizedOutput.includes(pattern));
}

function isMissingExecutable(normalizedOutput: string, command: string): boolean {
  return (
    normalizedOutput.includes(`executable not found: ${command}`) ||
    (normalizedOutput.includes("enoent") && normalizedOutput.includes(command))
  );
}

function isUnsupportedProbe(normalizedOutput: string): boolean {
  return outputIncludesAny(normalizedOutput, [
    "unknown command",
    "unrecognized command",
    "invalid command",
    "no such command",
    "unrecognized subcommand",
    "unexpected argument",
  ]);
}

function isAuthFailure(normalizedOutput: string): boolean {
  return outputIncludesAny(normalizedOutput, [
    "access token could not be refreshed",
    "refresh token",
    "invalid_grant",
    "401",
    "unauthorized",
    "not logged in",
    "not authenticated",
    "login required",
    "authentication required",
    "credentials expired",
  ]);
}

function isNetworkFailure(normalizedOutput: string): boolean {
  return outputIncludesAny(normalizedOutput, [
    "fetch failed",
    "enotfound",
    "eai_again",
    "econnrefused",
    "econnreset",
    "etimedout",
    "timed out",
    "timeout",
    "network",
    "connection refused",
    "connection reset",
    "could not resolve",
    "dns",
    "tls",
    "certificate",
    "ssl",
    "temporary failure",
    "no route to host",
    "network is unreachable",
  ]);
}

interface AuthProbeSpec {
  args: string[];
  authDetail: string;
  authRemedy: string;
  command: string;
  isLoggedOut?: (output: string) => boolean;
  missingDetail: string;
  missingRemedy: string;
  name: string;
  okDetail: string;
  probeFailedDetail: string;
  unsupported?: { detail: string; remedy: string };
}

function checkAuthProbe(cwd: string, spec: AuthProbeSpec): CheckResult {
  const result = runCommandSync({
    command: spec.command,
    args: spec.args,
    cwd,
    timeoutMs: AUTH_PROBE_TIMEOUT_MS,
  });

  const output = probeOutput(result);
  const loggedOut = spec.isLoggedOut?.(output) ?? false;

  if (result.exitCode === 0 && !loggedOut) {
    return okCheck(spec.name, spec.okDetail);
  }

  const normalized = output.toLowerCase();

  if (isMissingExecutable(normalized, spec.command)) {
    return failCheck({
      name: spec.name,
      detail: spec.missingDetail,
      reason: "missing-executable",
      remedy: spec.missingRemedy,
    });
  }

  if (spec.unsupported != null && isUnsupportedProbe(normalized)) {
    return failCheck({
      name: spec.name,
      detail: spec.unsupported.detail,
      reason: "unsupported-probe",
      remedy: spec.unsupported.remedy,
    });
  }

  if (isAuthFailure(normalized) || loggedOut) {
    return failCheck({
      name: spec.name,
      detail: spec.authDetail,
      reason: "credentials-expired",
      remedy: spec.authRemedy,
    });
  }

  if (result.timedOut === true || isNetworkFailure(normalized)) {
    return warnCheck({
      name: spec.name,
      detail: "could not verify (network)",
      reason: "network-unreachable",
    });
  }

  return failCheck({
    name: spec.name,
    detail: `${spec.probeFailedDetail}: ${compactProbeOutput(output) || `exit ${result.exitCode}`}`,
    reason: "probe-failed",
  });
}

function checkCodexCli(cwd: string): CheckResult {
  return checkAuthProbe(cwd, {
    name: "codex-auth",
    command: "codex",
    args: ["debug", "models"],
    okDetail: "Codex credentials verified.",
    missingDetail: "Codex CLI is unavailable - install Codex and run codex login.",
    missingRemedy: "Install Codex and run codex login.",
    unsupported: {
      detail: "Codex auth probe is unsupported - update Codex, then run codex login.",
      remedy: "Update Codex, then run codex login.",
    },
    authDetail: "credentials expired - run codex login",
    authRemedy: "codex login",
    probeFailedDetail: "Codex auth probe failed",
  });
}

function checkClaudeCli(cwd: string): CheckResult {
  return checkAuthProbe(cwd, {
    name: "claude-auth",
    command: "claude",
    args: ["auth", "status", "--json"],
    okDetail: "Claude credentials verified.",
    missingDetail: "Claude CLI is unavailable - install Claude Code and run claude auth login.",
    missingRemedy: "Install Claude Code and run claude auth login.",
    authDetail: "credentials expired - run claude auth login",
    authRemedy: "claude auth login",
    probeFailedDetail: "Claude auth probe failed",
    isLoggedOut: claudeStatusIndicatesLoggedOut,
  });
}

function claudeStatusIndicatesLoggedOut(output: string): boolean {
  if (output.trim().length === 0) {
    return false;
  }

  try {
    const parsed: unknown = JSON.parse(output);
    if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return false;
    }

    const record = parsed as Record<string, unknown>;
    for (const key of ["loggedIn", "authenticated", "isAuthenticated"]) {
      const value = record[key];
      if (value === false) {
        return true;
      }
    }

    const status = record.status;
    if (typeof status === "string" && isAuthFailure(status.toLowerCase())) {
      return true;
    }

    const message = record.message;
    if (typeof message === "string" && isAuthFailure(message.toLowerCase())) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

function checkAcpAdapter(cwd: string, provider: AcpProvider): CheckResult {
  const paths = resolveAlexandriaRuntimePaths();
  const command = resolveAcpCommand({ paths, provider });

  if (provider === "claude") {
    const npx = runCommandSync({
      command: "npx",
      args: ["--version"],
      cwd,
    });
    const installed = existsSync(paths.claudeAcpWrapperPath);
    return command != null && npx.exitCode === 0
      ? okCheck("claude-acp", installed ? paths.claudeAcpWrapperPath : command)
      : failCheck({
          name: "claude-acp",
          detail: `Claude ACP adapter is unavailable. Run \`ax init orchestration\`.\n${npx.stderr || npx.stdout}`,
          reason: "acp-adapter-unavailable",
          remedy: "ax init orchestration",
        });
  }

  const installed = existsSync(paths.codexAcpBinaryPath);
  return command != null
    ? okCheck(
        "codex-acp",
        installed ? paths.codexAcpBinaryPath : "ALEXANDRIA_CODEX_ACP_COMMAND is configured.",
      )
    : failCheck({
        name: "codex-acp",
        detail: "Codex ACP adapter is not installed. Run `ax init orchestration`.",
        reason: "acp-adapter-unavailable",
        remedy: "ax init orchestration",
      });
}

function humanCheckLabel(check: CheckResult): string {
  if (check.status === "ok") {
    return "OK";
  }

  if (check.status === "warn") {
    return "WARN";
  }

  return check.name.endsWith("-auth") ? "FAIL" : "MISSING";
}

function toCliResult(summary: DoctorSummary, json: boolean): CliResult {
  if (json) {
    return {
      stdout: JSON.stringify(summary, null, 2),
      stderr: "",
      exitCode: summary.orchestrationReady ? DOCTOR_EXIT_CODES.success : DOCTOR_EXIT_CODES.degraded,
    };
  }

  return {
    stdout: [
      `Orchestration: ${summary.orchestrationReady ? "ready" : "unavailable"}`,
      "",
      ...summary.checks.map((check) => `${humanCheckLabel(check)} ${check.name}: ${check.detail}`),
      "",
      `Provider: ${summary.provider}`,
    ].join("\n"),
    stderr: "",
    exitCode: summary.orchestrationReady ? DOCTOR_EXIT_CODES.success : DOCTOR_EXIT_CODES.degraded,
  };
}

export function runDoctor(options: DoctorOptions): Effect.Effect<CliResult, never> {
  return Effect.try({
    try: () => {
      const provider = readConfiguredAcpProvider(options.cwd);
      const checks = [
        checkFabro(options.cwd),
        provider === "claude" ? checkClaudeCli(options.cwd) : checkCodexCli(options.cwd),
        checkAcpAdapter(options.cwd, provider),
      ];
      const orchestrationReady = checks.every((check) => check.ok);

      return toCliResult(
        {
          checks,
          orchestrationReady,
          provider,
          status: orchestrationReady ? "ok" : "degraded",
        },
        options.json,
      );
    },
    catch: (error) => (error instanceof Error ? error : new Error(String(error))),
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: `Failed to check Alexandria orchestration: ${error.message}`,
        exitCode: DOCTOR_EXIT_CODES.degraded,
      }),
    ),
  );
}
