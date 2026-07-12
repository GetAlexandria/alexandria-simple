import type {
  AlexandriaAgentConfig,
  AlexandriaAgentOverrideConfig,
  AlexandriaAgentResourceOverridesConfig,
  AlexandriaNextConfig,
} from "./config.js";
import type { Agent } from "./plays.js";

const LEGACY_AGENT_ID_ALIASES: Readonly<Record<string, string>> = {
  "demo-video": "damien",
};

export const BUILT_IN_AGENTS: Agent[] = [
  {
    id: "raven",
    jobTitle: "Product Owner",
    knowledgeBankAreaIds: ["vision", "vocabulary", "bets", "guardrails", "user-research"],
    name: "Raven",
    resources: {
      claudeAgentPromptPath: "agents/raven.md",
      codexAgentPromptPath: "agents/raven.md",
      referencePaths: [
        "skills/raven-vision-drafting/references/slots/mechanism.md",
        "skills/raven-vision-drafting/references/slots/person.md",
        "skills/raven-vision-drafting/references/slots/refusal.md",
        "skills/raven-vision-drafting/references/slots/the-work.md",
      ],
      skillPaths: [
        "skills/raven-vision-drafting/SKILL.md",
        "skills/raven-vision-elicitation/SKILL.md",
      ],
      workflowPaths: [
        "workflows/frame-the-problem/workflow.fabro",
        "workflows/source-assessment/workflow.fabro",
      ],
    },
    status: "available",
  },
  {
    id: "damien",
    jobTitle: "Executive Producer of New Media",
    knowledgeBankAreaIds: [],
    name: "Damien",
    resources: {
      claudeAgentPromptPath: "agents/damien.md",
      codexAgentPromptPath: "agents/damien.md",
      referencePaths: [
        "skills/demo-thesis/references/demo-thesis-process.md",
        "skills/story-spine/references/story-spine-process.md",
        "skills/demo-path/references/demo-path-process.md",
      ],
      skillPaths: [
        "skills/demo-thesis/SKILL.md",
        "skills/story-spine/SKILL.md",
        "skills/demo-path/SKILL.md",
      ],
      workflowPaths: [],
    },
    status: "available",
  },
];

function canonicalAgentId(agentId: string): string {
  return LEGACY_AGENT_ID_ALIASES[agentId] ?? agentId;
}

function canonicalResourcePath(path: string): string {
  return path === "agents/demo-video.md" ? "agents/damien.md" : path;
}

function cloneResources(resources: Agent["resources"]): Agent["resources"] {
  return {
    ...(resources.claudeAgentPromptPath == null
      ? {}
      : { claudeAgentPromptPath: canonicalResourcePath(resources.claudeAgentPromptPath) }),
    ...(resources.codexAgentPromptPath == null
      ? {}
      : { codexAgentPromptPath: canonicalResourcePath(resources.codexAgentPromptPath) }),
    referencePaths: resources.referencePaths.map(canonicalResourcePath),
    skillPaths: resources.skillPaths.map(canonicalResourcePath),
    workflowPaths: resources.workflowPaths.map(canonicalResourcePath),
  };
}

function cloneAgent(agent: Agent): Agent {
  return {
    id: canonicalAgentId(agent.id),
    jobTitle: agent.jobTitle,
    knowledgeBankAreaIds: [...agent.knowledgeBankAreaIds],
    name: agent.name,
    resources: cloneResources(agent.resources),
    status: agent.status,
  };
}

function agentFromConfig(agent: AlexandriaAgentConfig): Agent {
  return cloneAgent(agent);
}

function mergeResources(
  base: Agent["resources"],
  override: AlexandriaAgentResourceOverridesConfig,
): Agent["resources"] {
  return {
    ...(override.claudeAgentPromptPath == null
      ? base.claudeAgentPromptPath == null
        ? {}
        : { claudeAgentPromptPath: base.claudeAgentPromptPath }
      : { claudeAgentPromptPath: canonicalResourcePath(override.claudeAgentPromptPath) }),
    ...(override.codexAgentPromptPath == null
      ? base.codexAgentPromptPath == null
        ? {}
        : { codexAgentPromptPath: base.codexAgentPromptPath }
      : { codexAgentPromptPath: canonicalResourcePath(override.codexAgentPromptPath) }),
    referencePaths:
      override.referencePaths == null
        ? [...base.referencePaths]
        : override.referencePaths.map(canonicalResourcePath),
    skillPaths:
      override.skillPaths == null
        ? [...base.skillPaths]
        : override.skillPaths.map(canonicalResourcePath),
    workflowPaths:
      override.workflowPaths == null
        ? [...base.workflowPaths]
        : override.workflowPaths.map(canonicalResourcePath),
  };
}

function applyOverride(agent: Agent, override: AlexandriaAgentOverrideConfig): Agent {
  return {
    id: agent.id,
    jobTitle: override.jobTitle ?? agent.jobTitle,
    knowledgeBankAreaIds:
      override.knowledgeBankAreaIds == null
        ? [...agent.knowledgeBankAreaIds]
        : [...override.knowledgeBankAreaIds],
    name: override.name ?? agent.name,
    resources:
      override.resources == null
        ? cloneResources(agent.resources)
        : mergeResources(agent.resources, override.resources),
    status: override.status ?? agent.status,
  };
}

function setAgent(options: {
  agent: Agent;
  agentsById: Map<string, Agent>;
  order: string[];
}): void {
  if (!options.agentsById.has(options.agent.id)) {
    options.order.push(options.agent.id);
  }
  options.agentsById.set(options.agent.id, options.agent);
}

export function agentsForConfig(config: AlexandriaNextConfig): Agent[] {
  const agentsById = new Map<string, Agent>();
  const order: string[] = [];

  for (const builtInAgent of BUILT_IN_AGENTS) {
    setAgent({ agent: cloneAgent(builtInAgent), agentsById, order });
  }

  for (const legacyAgent of config.agents?.roster ?? []) {
    const agent = agentFromConfig(legacyAgent);
    setAgent({ agent, agentsById, order });
  }

  for (const [agentId, override] of Object.entries(config.agents?.overrides ?? {})) {
    const canonicalId = canonicalAgentId(agentId);
    const existing = agentsById.get(canonicalId);
    if (existing == null) {
      continue;
    }
    agentsById.set(canonicalId, applyOverride(existing, override));
  }

  for (const customAgent of config.agents?.custom ?? []) {
    const agent = agentFromConfig(customAgent);
    setAgent({ agent, agentsById, order });
  }

  return order.flatMap((agentId) => {
    const agent = agentsById.get(agentId);
    return agent == null ? [] : [cloneAgent(agent)];
  });
}
