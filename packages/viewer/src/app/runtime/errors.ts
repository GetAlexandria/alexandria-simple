export class ViewerNetworkError {
  readonly _tag = "ViewerNetworkError";

  constructor(readonly cause: unknown) {}

  get message(): string {
    return `Viewer runtime request failed: ${String(this.cause)}`;
  }
}

export class ViewerHttpError {
  readonly _tag = "ViewerHttpError";

  constructor(
    readonly status: number,
    readonly statusText: string,
    readonly body: string,
  ) {}

  get message(): string {
    return `Viewer runtime responded with ${this.status} ${this.statusText}`;
  }
}

export class ViewerJsonError {
  readonly _tag = "ViewerJsonError";

  constructor(readonly cause: unknown) {}

  get message(): string {
    return `Viewer runtime returned invalid JSON: ${String(this.cause)}`;
  }
}

export class ViewerDecodeError {
  readonly _tag = "ViewerDecodeError";

  constructor(
    readonly label: string,
    readonly cause: unknown,
  ) {}

  get message(): string {
    return `Viewer runtime returned invalid ${this.label}: ${String(this.cause)}`;
  }
}

export class ViewerSubscriptionError {
  readonly _tag = "ViewerSubscriptionError";

  constructor(
    readonly endpoint: string,
    readonly cause: unknown,
  ) {}

  get message(): string {
    return `Viewer runtime subscription failed for ${this.endpoint}: ${String(this.cause)}`;
  }
}

export type ViewerRuntimeError =
  | ViewerDecodeError
  | ViewerHttpError
  | ViewerJsonError
  | ViewerNetworkError
  | ViewerSubscriptionError;
