/**
 * Parser for a play's authored `improvements.md` — the living backlog of work
 * that would make the play better, the scratch pad that shipping-small doesn't
 * erase. It is the home for two things that used to be separate: growth edges
 * (the frozen prototype's "Growth plan") *and* open decisions on the play —
 * because closing a decision is itself an improvement. Anyone can pull an item.
 *
 * It is a kanban as plain markdown: H2 = a column (Backlog / In progress /
 * Shipped — or whatever the author names), and each `- ` under it is a card.
 *
 *   ## Backlog
 *   - [decision] **Word-count software node** — build the wc SW node + trim bounce.
 *   - **Raise eval N on the hunch rule** — add hard-case fixtures until it's trusted.
 *
 *   ## Shipped
 *   - **Example gallery** — done-right/wrong pairs in a neutral domain. (2026-06-11)
 *
 * A card is `- [tag] **Title** — detail`: the `[tag]` is optional (e.g.
 * `decision`); the `**Title**` is the headline; everything after the first
 * dash is the detail. A `- (none yet)` line is a column placeholder and is
 * dropped. Both bold and dashes are optional — `- Title` alone is a valid card.
 */

export interface ImprovementItem {
  /** optional kind tag, lowercased, e.g. "decision" — or null */
  tag: string | null;
  /** the headline */
  title: string;
  /** the one-line detail, or "" */
  detail: string;
}

export interface ImprovementColumn {
  /** the column heading, e.g. "Backlog" */
  title: string;
  items: ImprovementItem[];
}

const COLUMN = /^##\s+(.+?)\s*$/;
const ITEM = /^[-*]\s+(.+)$/;
const TAG = /^\[([^\]]+)\]\s*/;
const SPLIT = /^(.*?)\s+[—–-]\s+(.*)$/;

/** Parse `improvements.md` into kanban columns, in document order. */
export function parseImprovements(text: string): ImprovementColumn[] {
  const lines = text.split("\n");
  const columns: ImprovementColumn[] = [];
  let column: ImprovementColumn | null = null;

  for (const raw of lines) {
    const line = raw ?? "";
    const head = COLUMN.exec(line);
    if (head != null) {
      column = { items: [], title: (head[1] ?? "").trim() };
      columns.push(column);
      continue;
    }
    if (column == null) {
      continue;
    }
    const item = ITEM.exec(line);
    if (item == null) {
      continue;
    }
    let body = (item[1] ?? "").trim();
    if (body.length === 0 || /^\(none\b/i.test(body)) {
      continue; // an empty-column placeholder like "(none yet)"
    }
    let tag: string | null = null;
    const tagMatch = TAG.exec(body);
    if (tagMatch != null) {
      tag = (tagMatch[1] ?? "").trim().toLowerCase();
      body = body.slice(tagMatch[0].length);
    }
    const split = SPLIT.exec(body);
    const titleRaw = split != null ? (split[1] ?? "") : body;
    const detail = split != null ? (split[2] ?? "").trim() : "";
    const title = titleRaw.replace(/\*\*/g, "").trim();
    column.items.push({ detail, tag, title });
  }
  return columns;
}
