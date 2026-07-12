export interface CommandResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
  readonly timedOut: boolean;
}

export interface CommandOptions {
  readonly cwd?: string;
}

export const runTextCommand = async (
  command: readonly string[],
  timeoutSeconds: number,
  options: CommandOptions = {},
): Promise<CommandResult> => {
  let didTimeout = false;
  const child = Bun.spawn([...command], {
    stdout: "pipe",
    stderr: "pipe",
    env: process.env,
    ...(options.cwd === undefined ? {} : { cwd: options.cwd }),
  });
  const timeout = setTimeout(() => {
    didTimeout = true;
    child.kill();
  }, timeoutSeconds * 1000);

  try {
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    return {
      stdout,
      stderr,
      exitCode,
      timedOut: didTimeout,
    };
  } finally {
    clearTimeout(timeout);
  }
};

export const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

export const envString = (name: string): string | undefined => {
  const value = process.env[name];
  return value === undefined || value === "" ? undefined : value;
};

export const readStdinOrFile = async (envPathName: string): Promise<string | undefined> => {
  const contextPath = envString(envPathName);
  if (contextPath !== undefined) {
    const file = Bun.file(contextPath);
    if (await file.exists()) {
      return await file.text();
    }
  }

  if (!process.stdin.isTTY) {
    const stdin = await Bun.stdin.text();
    return stdin.trim().length > 0 ? stdin : undefined;
  }

  return undefined;
};
