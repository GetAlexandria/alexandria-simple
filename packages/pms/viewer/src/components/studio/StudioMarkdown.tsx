import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "../markdown/markdownComponents";

/**
 * Renders a full studio document (story, brief, read-out, research, …) with the
 * shared brand Markdown component map so headings get a real hierarchy and
 * paragraphs/lists get spacing. Unlike the library card drawer, the studio
 * shows whole documents: it keeps the H1 title (no duplicate-heading strip) and
 * does not transform link targets (no card:// wikilinks).
 */
export function StudioMarkdown({ content }: { content: string }): React.ReactElement {
  return (
    <div className="max-w-[820px] font-sans text-[14px] leading-7 text-[#d6c8b0]">
      <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
