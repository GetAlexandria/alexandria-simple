import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import { makeViewerRuntimeClient, type ViewerRuntimeClient } from "./client";

// Staged for the next slice that wires shell data reads through Effect layers.
export class ViewerRuntime extends Context.Tag("ViewerRuntime")<
  ViewerRuntime,
  ViewerRuntimeClient
>() {}

export const ViewerRuntimeLive = Layer.succeed(
  ViewerRuntime,
  makeViewerRuntimeClient(),
);
