import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "../markdown/markdownComponents";

const WIKILINK_PATTERN = /\[\[([^\]]+)\]\]/g;

function escapeMarkdownLinkLabel(label: string): string {
  return label.replace(/([\\[\]])/g, "\\$1");
}

function markdownLinkForWikilink(rawTarget: string): string {
  const [targetWithSection, alias] = rawTarget.split("|");
  const target = (targetWithSection ?? rawTarget).trim();
  const label = (alias ?? target).trim();

  return `[${escapeMarkdownLinkLabel(label)}](card://${encodeURIComponent(target)})`;
}

function normalizeCardMarkdown(content: string): string {
  // Current library cards use ATX H1 titles; the drawer already renders the
  // card title, so suppress that one duplicate heading before Markdown render.
  return content
    .replace(/^# .*(?:\r?\n){1,2}/, "")
    .replace(WIKILINK_PATTERN, (_match, rawTarget: string) => markdownLinkForWikilink(rawTarget));
}

export function CardMarkdown({ content }: { content: string }) {
  return (
    <article
      className="max-h-[calc(100vh-540px)] overflow-auto border border-[#3b2c20] bg-[#120d09]/72 px-4 py-4 font-sans text-[14px] leading-7 text-[#d6c8b0] shadow-[inset_0_1px_18px_rgba(0,0,0,0.35)]"
      data-testid="card-markdown"
    >
      <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
        {normalizeCardMarkdown(content)}
      </ReactMarkdown>
    </article>
  );
}
