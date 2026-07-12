import { Context, Effect, Layer } from "effect";
import { startAlexandriaRuntimeServer } from "./runtime-server.js";

export interface ViewerServerOptions {
  assetRoot: string;
  host: string;
  libraryRoot?: string;
  port: number;
  projectRoot: string;
  workspacePath: string;
}

export interface StartedViewerServer {
  url: string;
  stop: Effect.Effect<void>;
}

export interface ViewerServerService {
  start(options: ViewerServerOptions): Effect.Effect<StartedViewerServer, Error>;
}

export class ViewerServer extends Context.Tag("ViewerServer")<
  ViewerServer,
  ViewerServerService
>() {}

export const NodeViewerServer = Layer.succeed(ViewerServer, {
  start: (options) =>
    startAlexandriaRuntimeServer({
      ...options,
      mode: "viewer",
    }),
});
