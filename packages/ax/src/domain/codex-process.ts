export function resolveCodexBinary(env: NodeJS.ProcessEnv = process.env): string {
  const explicit = env.ALEXANDRIA_CODEX_BIN?.trim();
  return explicit == null || explicit.length === 0 ? "codex" : explicit;
}
