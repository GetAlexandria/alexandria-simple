export const LIBRARY_SEARCH_PRIOR_FILE = "library-search-prior.json";
export const LIBRARY_SEARCH_PRIOR_SCHEMA_VERSION = "library-search-prior.v1";

export const LIBRARY_SEARCH_PRIOR_CONFIDENCES = ["high", "medium", "low"] as const;
export type LibrarySearchPriorConfidence = (typeof LIBRARY_SEARCH_PRIOR_CONFIDENCES)[number];

export interface LibrarySearchPriorConfidentValue {
  confidence: LibrarySearchPriorConfidence;
  value: string;
}

export interface LibrarySearchPriorDomain {
  actors: LibrarySearchPriorConfidentValue[];
  capability: LibrarySearchPriorConfidentValue;
  category: LibrarySearchPriorConfidentValue;
  vocabulary: LibrarySearchPriorConfidentValue[];
}

export interface LibrarySearchPriorPathStep {
  activity: LibrarySearchPriorConfidentValue;
  advance: LibrarySearchPriorConfidentValue;
  place: LibrarySearchPriorConfidentValue;
}

export interface LibrarySearchPriorShape {
  basis: string;
  confidence: LibrarySearchPriorConfidence;
  value: string;
}

export interface LibrarySearchPriorWorkThread {
  path: LibrarySearchPriorPathStep[];
  places: LibrarySearchPriorConfidentValue[];
  shape: LibrarySearchPriorShape;
  stateField: LibrarySearchPriorConfidentValue;
  unit: LibrarySearchPriorConfidentValue;
}

export interface LibrarySearchPriorFence {
  external: LibrarySearchPriorConfidentValue[];
  lookAlikes: LibrarySearchPriorConfidentValue[];
  outOfScope: LibrarySearchPriorConfidentValue[];
}

export interface LibrarySearchPriorOpenQuestion {
  about: string;
  question: string;
}

export interface LibrarySearchPrior {
  domain: LibrarySearchPriorDomain;
  fence: LibrarySearchPriorFence;
  openQuestions: LibrarySearchPriorOpenQuestion[];
  schemaVersion: typeof LIBRARY_SEARCH_PRIOR_SCHEMA_VERSION;
  workThread: LibrarySearchPriorWorkThread;
}

export interface LibrarySearchPriorFile {
  metadataIssues: string[];
  prior?: LibrarySearchPrior;
}

export interface LibrarySearchPriorFenceValues {
  external: string[];
  lookAlikes: string[];
  outOfScope: string[];
}

interface LowConfidenceClaim {
  aliases: string[];
  path: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function recordString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function isLibrarySearchPriorConfidence(
  value: unknown,
): value is LibrarySearchPriorConfidence {
  return (
    typeof value === "string" &&
    LIBRARY_SEARCH_PRIOR_CONFIDENCES.includes(value as LibrarySearchPriorConfidence)
  );
}

function normalizeQuestionKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function fieldAliases(path: string): string[] {
  const withoutIndexes = path.replace(/\[\d+\]/g, "");
  const pieces = withoutIndexes.split(".");
  const leaf = pieces[pieces.length - 1] ?? withoutIndexes;
  const parent = pieces.length > 1 ? pieces.slice(0, -1).join(".") : leaf;
  return Array.from(new Set([path, withoutIndexes, parent, leaf]));
}

function parseConfidentValue(
  value: unknown,
  path: string,
  issues: string[],
  lowConfidenceClaims: LowConfidenceClaim[],
): LibrarySearchPriorConfidentValue | undefined {
  if (!isRecord(value)) {
    issues.push(`Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: ${path} must be an object`);
    return undefined;
  }

  const text = recordString(value, "value");
  const confidence = value.confidence;
  const fieldIssues = [
    ...(text == null ? ["missing value"] : []),
    ...(confidence === undefined
      ? ["missing confidence"]
      : isLibrarySearchPriorConfidence(confidence)
        ? []
        : ["invalid confidence"]),
  ];

  if (fieldIssues.length > 0) {
    issues.push(`Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: ${path}: ${fieldIssues.join(", ")}`);
    return undefined;
  }

  if (text == null || !isLibrarySearchPriorConfidence(confidence)) {
    return undefined;
  }

  if (confidence === "low") {
    lowConfidenceClaims.push({ aliases: fieldAliases(path), path });
  }

  return { confidence, value: text };
}

function parseConfidentValueArray(
  value: unknown,
  path: string,
  issues: string[],
  lowConfidenceClaims: LowConfidenceClaim[],
): LibrarySearchPriorConfidentValue[] | undefined {
  if (!Array.isArray(value)) {
    issues.push(`Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: ${path} must be an array`);
    return undefined;
  }

  const parsed: LibrarySearchPriorConfidentValue[] = [];
  value.forEach((item, index) => {
    const confidentValue = parseConfidentValue(
      item,
      `${path}[${index}]`,
      issues,
      lowConfidenceClaims,
    );
    if (confidentValue != null) {
      parsed.push(confidentValue);
    }
  });
  return parsed;
}

function parseDomain(
  value: unknown,
  issues: string[],
  lowConfidenceClaims: LowConfidenceClaim[],
): LibrarySearchPriorDomain | undefined {
  if (!isRecord(value)) {
    issues.push(`Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: domain must be an object`);
    return undefined;
  }

  const actors = parseConfidentValueArray(
    value.actors,
    "domain.actors",
    issues,
    lowConfidenceClaims,
  );
  const capability = parseConfidentValue(
    value.capability,
    "domain.capability",
    issues,
    lowConfidenceClaims,
  );
  const category = parseConfidentValue(
    value.category,
    "domain.category",
    issues,
    lowConfidenceClaims,
  );
  const vocabulary = parseConfidentValueArray(
    value.vocabulary,
    "domain.vocabulary",
    issues,
    lowConfidenceClaims,
  );

  if (actors == null || capability == null || category == null || vocabulary == null) {
    return undefined;
  }

  return { actors, capability, category, vocabulary };
}

function parsePathStep(
  value: unknown,
  index: number,
  issues: string[],
  lowConfidenceClaims: LowConfidenceClaim[],
): LibrarySearchPriorPathStep | undefined {
  if (!isRecord(value)) {
    issues.push(
      `Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: workThread.path[${index}] must be an object`,
    );
    return undefined;
  }

  const activity = parseConfidentValue(
    value.activity,
    `workThread.path[${index}].activity`,
    issues,
    lowConfidenceClaims,
  );
  const place = parseConfidentValue(
    value.place,
    `workThread.path[${index}].place`,
    issues,
    lowConfidenceClaims,
  );
  const advance = parseConfidentValue(
    value.advance,
    `workThread.path[${index}].advance`,
    issues,
    lowConfidenceClaims,
  );

  if (activity == null || place == null || advance == null) {
    return undefined;
  }

  return { activity, advance, place };
}

function parsePath(
  value: unknown,
  issues: string[],
  lowConfidenceClaims: LowConfidenceClaim[],
): LibrarySearchPriorPathStep[] | undefined {
  if (!Array.isArray(value)) {
    issues.push(`Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: workThread.path must be an array`);
    return undefined;
  }

  const parsed: LibrarySearchPriorPathStep[] = [];
  value.forEach((item, index) => {
    const step = parsePathStep(item, index, issues, lowConfidenceClaims);
    if (step != null) {
      parsed.push(step);
    }
  });
  return parsed;
}

function parseShape(
  value: unknown,
  issues: string[],
  lowConfidenceClaims: LowConfidenceClaim[],
): LibrarySearchPriorShape | undefined {
  if (!isRecord(value)) {
    issues.push(`Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: workThread.shape must be an object`);
    return undefined;
  }

  const shape = recordString(value, "value");
  const basis = recordString(value, "basis");
  const confidence = value.confidence;
  const fieldIssues = [
    ...(shape == null ? ["missing value"] : []),
    ...(confidence === undefined
      ? ["missing confidence"]
      : isLibrarySearchPriorConfidence(confidence)
        ? []
        : ["invalid confidence"]),
    ...(basis == null ? ["missing basis"] : []),
  ];

  if (fieldIssues.length > 0) {
    issues.push(
      `Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: workThread.shape: ${fieldIssues.join(", ")}`,
    );
    return undefined;
  }

  if (shape == null || basis == null || !isLibrarySearchPriorConfidence(confidence)) {
    return undefined;
  }

  if (confidence === "low") {
    lowConfidenceClaims.push({
      aliases: fieldAliases("workThread.shape"),
      path: "workThread.shape",
    });
  }

  return { basis, confidence, value: shape };
}

function parseWorkThread(
  value: unknown,
  issues: string[],
  lowConfidenceClaims: LowConfidenceClaim[],
): LibrarySearchPriorWorkThread | undefined {
  if (!isRecord(value)) {
    issues.push(`Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: workThread must be an object`);
    return undefined;
  }

  const unit = parseConfidentValue(value.unit, "workThread.unit", issues, lowConfidenceClaims);
  const path = parsePath(value.path, issues, lowConfidenceClaims);
  const stateField = parseConfidentValue(
    value.stateField,
    "workThread.stateField",
    issues,
    lowConfidenceClaims,
  );
  const places = parseConfidentValueArray(
    value.places,
    "workThread.places",
    issues,
    lowConfidenceClaims,
  );
  const shape = parseShape(value.shape, issues, lowConfidenceClaims);

  if (unit == null || path == null || stateField == null || places == null || shape == null) {
    return undefined;
  }

  return { path, places, shape, stateField, unit };
}

function parseFence(
  value: unknown,
  issues: string[],
  lowConfidenceClaims: LowConfidenceClaim[],
): LibrarySearchPriorFence | undefined {
  if (!isRecord(value)) {
    issues.push(`Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: fence must be an object`);
    return undefined;
  }

  const outOfScope = parseConfidentValueArray(
    value.outOfScope,
    "fence.outOfScope",
    issues,
    lowConfidenceClaims,
  );
  const external = parseConfidentValueArray(
    value.external,
    "fence.external",
    issues,
    lowConfidenceClaims,
  );
  const lookAlikes = parseConfidentValueArray(
    value.lookAlikes,
    "fence.lookAlikes",
    issues,
    lowConfidenceClaims,
  );

  if (outOfScope == null || external == null || lookAlikes == null) {
    return undefined;
  }

  return { external, lookAlikes, outOfScope };
}

function parseOpenQuestions(value: unknown, issues: string[]): LibrarySearchPriorOpenQuestion[] {
  if (!Array.isArray(value)) {
    issues.push(`Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: openQuestions must be an array`);
    return [];
  }

  const questions: LibrarySearchPriorOpenQuestion[] = [];
  const seen = new Set<string>();
  value.forEach((item, index) => {
    if (!isRecord(item)) {
      issues.push(
        `Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: openQuestions[${index}] must be an object`,
      );
      return;
    }
    const about = recordString(item, "about");
    const question = recordString(item, "question");
    const fieldIssues = [
      ...(about == null ? ["missing about"] : []),
      ...(question == null ? ["missing question"] : []),
    ];
    if (fieldIssues.length > 0) {
      issues.push(
        `Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: openQuestions[${index}]: ${fieldIssues.join(", ")}`,
      );
      return;
    }
    if (about == null || question == null) {
      return;
    }
    const key = `${normalizeQuestionKey(about)}:${normalizeQuestionKey(question)}`;
    if (seen.has(key)) {
      issues.push(`Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: duplicate open question "${about}"`);
      return;
    }
    seen.add(key);
    questions.push({ about, question });
  });
  return questions;
}

function checkLowConfidenceQuestions(
  lowConfidenceClaims: LowConfidenceClaim[],
  openQuestions: LibrarySearchPriorOpenQuestion[],
  issues: string[],
): void {
  const questionAbouts = new Set(
    openQuestions.map((question) => normalizeQuestionKey(question.about)),
  );
  for (const claim of lowConfidenceClaims) {
    const hasQuestion = claim.aliases.some((alias) =>
      questionAbouts.has(normalizeQuestionKey(alias)),
    );
    if (!hasQuestion) {
      issues.push(
        `Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: low-confidence ${claim.path} must have an openQuestions entry`,
      );
    }
  }
}

export function librarySearchPriorHighConfidenceFence(
  prior: LibrarySearchPrior,
): LibrarySearchPriorFenceValues {
  return {
    external: prior.fence.external
      .filter((entry) => entry.confidence === "high")
      .map((entry) => entry.value),
    lookAlikes: prior.fence.lookAlikes
      .filter((entry) => entry.confidence === "high")
      .map((entry) => entry.value),
    outOfScope: prior.fence.outOfScope
      .filter((entry) => entry.confidence === "high")
      .map((entry) => entry.value),
  };
}

export function parseLibrarySearchPrior(content: string): LibrarySearchPriorFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    return {
      metadataIssues: [
        `Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
    };
  }

  if (!isRecord(parsed)) {
    return { metadataIssues: [`Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: expected object`] };
  }

  if (parsed.schemaVersion !== LIBRARY_SEARCH_PRIOR_SCHEMA_VERSION) {
    return {
      metadataIssues: [
        `Invalid ${LIBRARY_SEARCH_PRIOR_FILE}: schemaVersion must be ${LIBRARY_SEARCH_PRIOR_SCHEMA_VERSION}`,
      ],
    };
  }

  const metadataIssues: string[] = [];
  const lowConfidenceClaims: LowConfidenceClaim[] = [];
  const domain = parseDomain(parsed.domain, metadataIssues, lowConfidenceClaims);
  const workThread = parseWorkThread(parsed.workThread, metadataIssues, lowConfidenceClaims);
  const fence = parseFence(parsed.fence, metadataIssues, lowConfidenceClaims);
  const openQuestions = parseOpenQuestions(parsed.openQuestions, metadataIssues);
  checkLowConfidenceQuestions(lowConfidenceClaims, openQuestions, metadataIssues);

  if (metadataIssues.length > 0 || domain == null || workThread == null || fence == null) {
    return { metadataIssues };
  }

  return {
    metadataIssues,
    prior: {
      domain,
      fence,
      openQuestions,
      schemaVersion: LIBRARY_SEARCH_PRIOR_SCHEMA_VERSION,
      workThread,
    },
  };
}
