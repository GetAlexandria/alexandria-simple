export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  keepsProcessAlive?: boolean;
}

export function withTrailingNewline(text: string): string {
  return text.endsWith("\n") ? text : `${text}\n`;
}

function writeStream(stream: NodeJS.WriteStream, text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    stream.write(withTrailingNewline(text), (error?: Error | null) => {
      if (error != null) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export async function writeCliResult(result: CliResult): Promise<void> {
  if (result.stdout.length > 0) {
    await writeStream(process.stdout, result.stdout);
  }

  if (result.stderr.length > 0) {
    await writeStream(process.stderr, result.stderr);
  }
}
