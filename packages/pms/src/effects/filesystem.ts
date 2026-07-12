import { Context, Effect, Layer } from "effect";
import { randomUUID } from "crypto";
import { access, appendFile, mkdir, readFile, readdir, rename, writeFile } from "fs/promises";
import { dirname } from "path";

export interface DirectoryEntry {
  name: string;
  type: "directory" | "file" | "other";
}

export interface FileSystemService {
  appendText(path: string, content: string): Effect.Effect<void, Error>;
  makeDirectory(path: string): Effect.Effect<void, Error>;
  pathExists(path: string): Effect.Effect<boolean, Error>;
  readBytes(path: string): Effect.Effect<Uint8Array, Error>;
  readDirectory(path: string): Effect.Effect<DirectoryEntry[], Error>;
  readText(path: string): Effect.Effect<string, Error>;
  writeText(path: string, content: string): Effect.Effect<void, Error>;
  writeTextAtomic(path: string, content: string): Effect.Effect<void, Error>;
}

export class FileSystem extends Context.Tag("FileSystem")<FileSystem, FileSystemService>() {}

export function isMissingFileError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

export const NodeFileSystem = Layer.succeed(FileSystem, {
  appendText: (path, content) =>
    Effect.tryPromise({
      try: () => appendFile(path, content, "utf8").then(() => undefined),
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    }),
  makeDirectory: (path) =>
    Effect.tryPromise({
      try: () => mkdir(path, { recursive: true }).then(() => undefined),
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    }),
  pathExists: (path) =>
    Effect.tryPromise({
      try: () =>
        access(path).then(
          () => true,
          () => false,
        ),
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    }),
  readBytes: (path) =>
    Effect.tryPromise({
      try: () => readFile(path),
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    }),
  readDirectory: (path) =>
    Effect.tryPromise({
      try: () =>
        readdir(path, { withFileTypes: true }).then((entries) =>
          entries.map((entry) => ({
            name: entry.name,
            type: entry.isDirectory() ? "directory" : entry.isFile() ? "file" : "other",
          })),
        ),
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    }),
  readText: (path) =>
    Effect.tryPromise({
      try: () => readFile(path, "utf8"),
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    }),
  writeText: (path, content) =>
    Effect.tryPromise({
      try: () => writeFile(path, content, { flag: "wx" }).then(() => undefined),
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    }),
  writeTextAtomic: (path, content) =>
    Effect.tryPromise({
      try: async () => {
        await mkdir(dirname(path), { recursive: true });
        const tempPath = `${path}.${process.pid}.${Date.now()}.${randomUUID()}.tmp`;
        await writeFile(tempPath, content, { encoding: "utf8", flag: "wx" });
        await rename(tempPath, path);
      },
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    }),
});
