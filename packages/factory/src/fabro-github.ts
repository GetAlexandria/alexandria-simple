export interface GitHubLabel {
  readonly name: string;
}

export interface GitHubIssue {
  readonly number: number;
  readonly title: string;
  readonly body?: string | null;
  readonly html_url: string;
  readonly labels: readonly GitHubLabel[];
  readonly pull_request?: unknown;
}

export interface GitHubIssueRef {
  readonly owner: string;
  readonly repo: string;
  readonly number: number;
}

export interface GitHubClient {
  readonly listReadyIssues: () => Promise<readonly GitHubIssue[]>;
  readonly getIssue: (number: number) => Promise<GitHubIssue>;
  readonly setLabels: (number: number, labels: readonly string[]) => Promise<GitHubIssue>;
  readonly createComment: (number: number, body: string) => Promise<void>;
}

export interface GitHubClientConfig {
  readonly owner: string;
  readonly repo: string;
  readonly token: string;
  readonly apiBaseUrl: string;
  readonly readyLabel: string;
}

const jsonHeaders = (token: string): Record<string, string> => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "X-GitHub-Api-Version": "2022-11-28",
});

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub request failed: ${response.status} ${response.statusText} ${body}`);
  }
  return (await response.json()) as T;
};

export const issueLabelNames = (issue: GitHubIssue): readonly string[] =>
  issue.labels.map((label) => label.name);

export const replaceLabelState = (
  labels: readonly string[],
  remove: readonly string[],
  add: readonly string[],
): readonly string[] => {
  const next = new Set(labels.filter((label) => !remove.includes(label)));
  for (const label of add) {
    next.add(label);
  }
  return [...next];
};

export const parseGitHubIssueUrl = (issueUrl: string): GitHubIssueRef | undefined => {
  const match = issueUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)$/);
  if (match === null) {
    return undefined;
  }
  const [, owner, repo, numberText] = match;
  const number = Number(numberText);
  if (owner === undefined || repo === undefined || !Number.isInteger(number) || number <= 0) {
    return undefined;
  }
  return { owner, repo, number };
};

export const extractIssueUrl = (text: string): string | undefined =>
  text.match(/https:\/\/github\.com\/[^\s)/]+\/[^\s)/]+\/issues\/\d+/)?.[0];

export const createGitHubClient = (config: GitHubClientConfig): GitHubClient => {
  const apiBaseUrl = config.apiBaseUrl.replace(/\/+$/, "");
  const repoPath = `/repos/${config.owner}/${config.repo}`;

  return {
    async listReadyIssues() {
      const url = new URL(`${apiBaseUrl}${repoPath}/issues`);
      url.searchParams.set("state", "open");
      url.searchParams.set("labels", config.readyLabel);
      url.searchParams.set("per_page", "100");
      const response = await fetch(url, {
        headers: jsonHeaders(config.token),
      });
      const issues = await parseJsonResponse<readonly GitHubIssue[]>(response);
      return issues.filter((issue) => !issue.pull_request);
    },

    async getIssue(number) {
      const response = await fetch(`${apiBaseUrl}${repoPath}/issues/${number}`, {
        headers: jsonHeaders(config.token),
      });
      return await parseJsonResponse<GitHubIssue>(response);
    },

    async setLabels(number, labels) {
      const response = await fetch(`${apiBaseUrl}${repoPath}/issues/${number}`, {
        method: "PATCH",
        headers: jsonHeaders(config.token),
        body: JSON.stringify({ labels }),
      });
      return await parseJsonResponse<GitHubIssue>(response);
    },

    async createComment(number, body) {
      const response = await fetch(`${apiBaseUrl}${repoPath}/issues/${number}/comments`, {
        method: "POST",
        headers: jsonHeaders(config.token),
        body: JSON.stringify({ body }),
      });
      await parseJsonResponse<unknown>(response);
    },
  };
};
