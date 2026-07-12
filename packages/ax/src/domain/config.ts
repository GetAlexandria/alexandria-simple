import { Data, Either } from "effect";
import * as Schema from "effect/Schema";
import { DEFAULT_SOURCES_PATH } from "./paths.js";

export const CONFIG_SCHEMA_VERSION = 1;
export const DEFAULT_ACP_PROVIDER = "codex";

export type AcpProvider = "codex" | "claude";

export interface AlexandriaCodexSubscriptionConfig {
  id: string;
  types: string[];
}

export interface AlexandriaCodexConfig {
  enabled?: boolean;
  startTurn?: boolean;
  subscriptions?: AlexandriaCodexSubscriptionConfig[];
}

export interface AlexandriaAgentResourcesConfig {
  claudeAgentPromptPath?: string;
  codexAgentPromptPath?: string;
  referencePaths: string[];
  skillPaths: string[];
  workflowPaths: string[];
}

export interface AlexandriaAgentResourceOverridesConfig {
  claudeAgentPromptPath?: string;
  codexAgentPromptPath?: string;
  referencePaths?: string[];
  skillPaths?: string[];
  workflowPaths?: string[];
}

export interface AlexandriaAgentOverrideConfig {
  knowledgeBankAreaIds?: string[];
  jobTitle?: string;
  name?: string;
  resources?: AlexandriaAgentResourceOverridesConfig;
  status?: "available" | "locked";
}

export interface AlexandriaAgentConfig {
  id: string;
  knowledgeBankAreaIds: string[];
  jobTitle: string;
  name: string;
  resources: AlexandriaAgentResourcesConfig;
  status: "available" | "locked";
}

export interface AlexandriaAgentsConfig {
  custom?: AlexandriaAgentConfig[];
  overrides?: Record<string, AlexandriaAgentOverrideConfig>;
  /**
   * Legacy compatibility for projects initialized while the full product roster
   * lived in config. New configs should use `overrides` and `custom` instead.
   */
  roster?: AlexandriaAgentConfig[];
  [key: string]: unknown;
}

export interface AlexandriaOrchestrationAcpConfig {
  provider: AcpProvider;
}

export interface AlexandriaOrchestrationConfig {
  acp?: AlexandriaOrchestrationAcpConfig;
}

export interface AlexandriaLibraryConfig {
  root?: string;
  [key: string]: unknown;
}

export interface AlexandriaNextConfig {
  schemaVersion: typeof CONFIG_SCHEMA_VERSION;
  sourcesPath: string;
  workspace: string;
  codex?: AlexandriaCodexConfig;
  agents?: AlexandriaAgentsConfig;
  library?: AlexandriaLibraryConfig;
  orchestration?: AlexandriaOrchestrationConfig;
  [key: string]: unknown;
}

export class ConfigParseError extends Data.TaggedError("ConfigParseError")<{
  readonly cause?: unknown;
  readonly message: string;
}> {}

const JsonObjectSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
});

const CodexSubscriptionConfigSchema = Schema.Struct({
  id: Schema.NonEmptyString,
  types: Schema.NonEmptyArray(Schema.NonEmptyString),
});

const CodexConfigSchema = Schema.Struct({
  enabled: Schema.optionalWith(Schema.NullOr(Schema.Boolean), { exact: true }),
  startTurn: Schema.optionalWith(Schema.NullOr(Schema.Boolean), {
    exact: true,
  }),
  subscriptions: Schema.optionalWith(Schema.NullOr(Schema.Array(CodexSubscriptionConfigSchema)), {
    exact: true,
  }),
});

const AgentResourcesConfigSchema = Schema.Struct({
  claudeAgentPromptPath: Schema.optionalWith(Schema.NullOr(Schema.NonEmptyString), {
    exact: true,
  }),
  codexAgentPromptPath: Schema.optionalWith(Schema.NullOr(Schema.NonEmptyString), {
    exact: true,
  }),
  referencePaths: Schema.optionalWith(Schema.NullOr(Schema.Array(Schema.NonEmptyString)), {
    exact: true,
  }),
  skillPaths: Schema.optionalWith(Schema.NullOr(Schema.Array(Schema.NonEmptyString)), {
    exact: true,
  }),
  workflowPaths: Schema.optionalWith(Schema.NullOr(Schema.Array(Schema.NonEmptyString)), {
    exact: true,
  }),
});

const AgentResourceOverridesConfigSchema = Schema.Struct({
  claudeAgentPromptPath: Schema.optionalWith(Schema.NullOr(Schema.NonEmptyString), {
    exact: true,
  }),
  codexAgentPromptPath: Schema.optionalWith(Schema.NullOr(Schema.NonEmptyString), {
    exact: true,
  }),
  referencePaths: Schema.optionalWith(Schema.NullOr(Schema.Array(Schema.NonEmptyString)), {
    exact: true,
  }),
  skillPaths: Schema.optionalWith(Schema.NullOr(Schema.Array(Schema.NonEmptyString)), {
    exact: true,
  }),
  workflowPaths: Schema.optionalWith(Schema.NullOr(Schema.Array(Schema.NonEmptyString)), {
    exact: true,
  }),
});

const AgentOverrideConfigSchema = Schema.Struct({
  knowledgeBankAreaIds: Schema.optionalWith(Schema.NullOr(Schema.Array(Schema.NonEmptyString)), {
    exact: true,
  }),
  jobTitle: Schema.optionalWith(Schema.NullOr(Schema.NonEmptyString), {
    exact: true,
  }),
  name: Schema.optionalWith(Schema.NullOr(Schema.NonEmptyString), {
    exact: true,
  }),
  resources: Schema.optionalWith(Schema.NullOr(AgentResourceOverridesConfigSchema), {
    exact: true,
  }),
  status: Schema.optionalWith(Schema.NullOr(Schema.Literal("available", "locked")), {
    exact: true,
  }),
});

const AgentOverridesConfigSchema = Schema.Record({
  key: Schema.NonEmptyString,
  value: AgentOverrideConfigSchema,
});

const AgentConfigSchema = Schema.Struct({
  id: Schema.NonEmptyString,
  knowledgeBankAreaIds: Schema.optionalWith(Schema.NullOr(Schema.Array(Schema.NonEmptyString)), {
    exact: true,
  }),
  jobTitle: Schema.NonEmptyString,
  name: Schema.NonEmptyString,
  resources: Schema.optionalWith(Schema.NullOr(AgentResourcesConfigSchema), {
    exact: true,
  }),
  status: Schema.optionalWith(Schema.NullOr(Schema.Literal("available", "locked")), {
    exact: true,
  }),
});

const AgentCustomConfigSchema = Schema.Array(AgentConfigSchema);
const AgentRosterConfigSchema = Schema.Array(AgentConfigSchema);

const AcpProviderSchema = Schema.Literal("codex", "claude");

const OrchestrationAcpConfigSchema = Schema.Struct({
  provider: Schema.optionalWith(Schema.NullOr(AcpProviderSchema), {
    exact: true,
  }),
});

const OrchestrationConfigSchema = Schema.Struct({
  acp: Schema.optionalWith(Schema.NullOr(OrchestrationAcpConfigSchema), {
    exact: true,
  }),
});

const AlexandriaNextConfigSchema = Schema.Struct({
  schemaVersion: Schema.Literal(CONFIG_SCHEMA_VERSION),
  sourcesPath: Schema.optionalWith(Schema.NullOr(Schema.NonEmptyString), {
    default: () => DEFAULT_SOURCES_PATH,
  }),
  workspace: Schema.NonEmptyString,
  codex: Schema.optionalWith(Schema.NullOr(CodexConfigSchema), {
    exact: true,
  }),
  agents: Schema.optionalWith(Schema.NullOr(JsonObjectSchema), {
    exact: true,
  }),
  library: Schema.optionalWith(Schema.NullOr(JsonObjectSchema), {
    exact: true,
  }),
  orchestration: Schema.optionalWith(Schema.NullOr(OrchestrationConfigSchema), {
    exact: true,
  }),
});

type DecodedCodexConfig = Schema.Schema.Type<typeof CodexConfigSchema>;
type DecodedAgentConfig = Schema.Schema.Type<typeof AgentConfigSchema>;
type DecodedAgentResourcesConfig = Schema.Schema.Type<typeof AgentResourcesConfigSchema>;
type DecodedAgentOverrideConfig = Schema.Schema.Type<typeof AgentOverrideConfigSchema>;
type DecodedAgentResourceOverridesConfig = Schema.Schema.Type<
  typeof AgentResourceOverridesConfigSchema
>;
type DecodedOrchestrationAcpConfig = Schema.Schema.Type<typeof OrchestrationAcpConfigSchema>;
type DecodedOrchestrationConfig = Schema.Schema.Type<typeof OrchestrationConfigSchema>;
type DecodedConfig = Schema.Schema.Type<typeof AlexandriaNextConfigSchema>;

export function createConfig(
  workspace: string,
  acpProvider: AcpProvider = DEFAULT_ACP_PROVIDER,
): AlexandriaNextConfig {
  return {
    orchestration: {
      acp: {
        provider: acpProvider,
      },
    },
    schemaVersion: CONFIG_SCHEMA_VERSION,
    sourcesPath: DEFAULT_SOURCES_PATH,
    workspace,
  };
}

function configParseError(message: string, cause?: unknown): ConfigParseError {
  return new ConfigParseError({ cause, message });
}

function schemaErrorMessage(label: string, error: unknown): string {
  return `Invalid ${label}: ${String(error)}`;
}

export function parseConfig(content: string): AlexandriaNextConfig {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw configParseError(error instanceof Error ? error.message : String(error), error);
  }

  const recordResult = Schema.decodeUnknownEither(JsonObjectSchema)(parsed, {
    errors: "all",
    onExcessProperty: "preserve",
  });
  if (Either.isLeft(recordResult)) {
    throw configParseError("Alexandria config must be a JSON object.", recordResult.left);
  }
  const parsedRecord = recordResult.right;

  const configResult = Schema.decodeUnknownEither(AlexandriaNextConfigSchema)(parsedRecord, {
    errors: "all",
    onExcessProperty: "preserve",
  });
  if (Either.isLeft(configResult)) {
    if (parsedRecord.schemaVersion !== CONFIG_SCHEMA_VERSION) {
      throw configParseError(
        `Unsupported Alexandria config schema version: ${String(parsedRecord.schemaVersion)}`,
        configResult.left,
      );
    }

    if (typeof parsedRecord.workspace !== "string" || parsedRecord.workspace.length === 0) {
      throw configParseError("Alexandria config must include a workspace path.", configResult.left);
    }

    if (
      parsedRecord.sourcesPath != null &&
      (typeof parsedRecord.sourcesPath !== "string" || parsedRecord.sourcesPath.length === 0)
    ) {
      throw configParseError(
        "Alexandria config sourcesPath must be a non-empty string.",
        configResult.left,
      );
    }

    throw configParseError(
      schemaErrorMessage("Alexandria config", configResult.left),
      configResult.left,
    );
  }

  const decoded = configResult.right;
  const codex = normalizeCodexConfig(decoded.codex);
  const agents = parseAgentsConfig(decoded.agents);
  const library = parseLibraryConfig(decoded.library);
  const orchestration = normalizeOrchestrationConfig(decoded.orchestration);

  return {
    ...Object.fromEntries(
      Object.entries(parsedRecord).filter(
        ([key]) =>
          key !== "schemaVersion" &&
          key !== "workspace" &&
          key !== "sourcesPath" &&
          key !== "codex" &&
          key !== "agents" &&
          key !== "library" &&
          key !== "orchestration",
      ),
    ),
    schemaVersion: CONFIG_SCHEMA_VERSION,
    sourcesPath: decoded.sourcesPath ?? DEFAULT_SOURCES_PATH,
    workspace: decoded.workspace,
    ...(codex == null ? {} : { codex }),
    ...(agents == null ? {} : { agents }),
    ...(library == null ? {} : { library }),
    ...(orchestration == null ? {} : { orchestration }),
  };
}

function normalizeCodexConfig(
  value: DecodedCodexConfig | null | undefined,
): AlexandriaCodexConfig | undefined {
  if (value == null) {
    return undefined;
  }

  const config: AlexandriaCodexConfig = {};

  if (value.enabled != null) {
    config.enabled = value.enabled;
  }

  if (value.startTurn != null) {
    config.startTurn = value.startTurn;
  }

  if (value.subscriptions != null) {
    config.subscriptions = value.subscriptions.map((subscription) => ({
      id: subscription.id,
      types: [...subscription.types],
    }));
  }

  return config;
}

function normalizeOrchestrationAcpConfig(
  value: DecodedOrchestrationAcpConfig | null | undefined,
): AlexandriaOrchestrationAcpConfig | undefined {
  if (value == null) {
    return undefined;
  }

  if (value.provider == null) {
    return undefined;
  }

  return {
    provider: value.provider,
  };
}

function normalizeOrchestrationConfig(
  value: DecodedOrchestrationConfig | null | undefined,
): AlexandriaOrchestrationConfig | undefined {
  if (value == null) {
    return undefined;
  }

  const acp = normalizeOrchestrationAcpConfig(value.acp);
  return {
    ...(acp == null ? {} : { acp }),
  };
}

function parseAgentsConfig(value: DecodedConfig["agents"]): AlexandriaAgentsConfig | undefined {
  if (value == null) {
    return undefined;
  }

  const agentsConfig: AlexandriaAgentsConfig = {
    ...Object.fromEntries(
      Object.entries(value).filter(
        ([key]) => key !== "custom" && key !== "overrides" && key !== "roster",
      ),
    ),
  };

  if (value.overrides != null) {
    const overridesResult = Schema.decodeUnknownEither(AgentOverridesConfigSchema)(
      value.overrides,
      {
        errors: "all",
        onExcessProperty: "error",
      },
    );
    if (Either.isLeft(overridesResult)) {
      throw configParseError(
        schemaErrorMessage("Alexandria config agents.overrides", overridesResult.left),
        overridesResult.left,
      );
    }

    agentsConfig.overrides = Object.fromEntries(
      Object.entries(overridesResult.right).map(([agentId, override]) => [
        agentId,
        normalizeAgentOverrideConfig(override),
      ]),
    );
  }

  if (value.custom != null) {
    const customResult = Schema.decodeUnknownEither(AgentCustomConfigSchema)(value.custom, {
      errors: "all",
      onExcessProperty: "error",
    });
    if (Either.isLeft(customResult)) {
      throw configParseError(
        schemaErrorMessage("Alexandria config agents.custom", customResult.left),
        customResult.left,
      );
    }

    agentsConfig.custom = customResult.right.map(normalizeAgentConfig);
  }

  if (value.roster == null) {
    return agentsConfig;
  }

  const rosterResult = Schema.decodeUnknownEither(AgentRosterConfigSchema)(value.roster, {
    errors: "all",
    onExcessProperty: "error",
  });
  if (Either.isLeft(rosterResult)) {
    throw configParseError(
      schemaErrorMessage("Alexandria config agents.roster", rosterResult.left),
      rosterResult.left,
    );
  }

  agentsConfig.roster = rosterResult.right.map(normalizeAgentConfig);
  return agentsConfig;
}

function parseLibraryConfig(value: DecodedConfig["library"]): AlexandriaLibraryConfig | undefined {
  if (value == null) {
    return undefined;
  }

  const libraryConfig: AlexandriaLibraryConfig = {
    ...Object.fromEntries(Object.entries(value).filter(([key]) => key !== "root")),
  };

  if (value.root != null) {
    if (typeof value.root !== "string" || value.root.length === 0) {
      throw configParseError("Alexandria config library.root must be a non-empty string.");
    }
    libraryConfig.root = value.root;
  }

  return Object.keys(libraryConfig).length === 0 ? undefined : libraryConfig;
}

function normalizeAgentResourceOverridesConfig(
  value: DecodedAgentResourceOverridesConfig | null | undefined,
): AlexandriaAgentResourceOverridesConfig | undefined {
  if (value == null) {
    return undefined;
  }

  return {
    ...(value.claudeAgentPromptPath == null
      ? {}
      : { claudeAgentPromptPath: value.claudeAgentPromptPath }),
    ...(value.codexAgentPromptPath == null
      ? {}
      : { codexAgentPromptPath: value.codexAgentPromptPath }),
    ...(value.referencePaths == null ? {} : { referencePaths: [...value.referencePaths] }),
    ...(value.skillPaths == null ? {} : { skillPaths: [...value.skillPaths] }),
    ...(value.workflowPaths == null ? {} : { workflowPaths: [...value.workflowPaths] }),
  };
}

function normalizeAgentOverrideConfig(
  value: DecodedAgentOverrideConfig,
): AlexandriaAgentOverrideConfig {
  const resources = normalizeAgentResourceOverridesConfig(value.resources);

  return {
    ...(value.jobTitle == null ? {} : { jobTitle: value.jobTitle }),
    ...(value.knowledgeBankAreaIds == null
      ? {}
      : { knowledgeBankAreaIds: [...value.knowledgeBankAreaIds] }),
    ...(value.name == null ? {} : { name: value.name }),
    ...(resources == null ? {} : { resources }),
    ...(value.status == null ? {} : { status: value.status }),
  };
}

function normalizeAgentResourcesConfig(
  value: DecodedAgentResourcesConfig | null | undefined,
): AlexandriaAgentResourcesConfig {
  return {
    ...(value?.claudeAgentPromptPath == null
      ? {}
      : { claudeAgentPromptPath: value.claudeAgentPromptPath }),
    ...(value?.codexAgentPromptPath == null
      ? {}
      : { codexAgentPromptPath: value.codexAgentPromptPath }),
    referencePaths: [...(value?.referencePaths ?? [])],
    skillPaths: [...(value?.skillPaths ?? [])],
    workflowPaths: [...(value?.workflowPaths ?? [])],
  };
}

function normalizeAgentConfig(value: DecodedAgentConfig): AlexandriaAgentConfig {
  return {
    id: value.id,
    jobTitle: value.jobTitle,
    knowledgeBankAreaIds: [...(value.knowledgeBankAreaIds ?? [])],
    name: value.name,
    resources: normalizeAgentResourcesConfig(value.resources),
    status: value.status ?? "available",
  };
}

export function acpProviderForConfig(config: AlexandriaNextConfig): AcpProvider {
  return config.orchestration?.acp?.provider ?? DEFAULT_ACP_PROVIDER;
}

export function withAcpProvider(
  config: AlexandriaNextConfig,
  provider: AcpProvider,
): AlexandriaNextConfig {
  return {
    ...config,
    orchestration: {
      ...(config.orchestration ?? {}),
      acp: {
        ...(config.orchestration?.acp ?? {}),
        provider,
      },
    },
  };
}

export function serializeConfig(config: AlexandriaNextConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}
