import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const ravenNotesMarkdownComponents: Components = {
  a({ children, href }) {
    return (
      <a
        className="text-[#e7bd67] underline decoration-[#8b6a3d] underline-offset-4 transition-colors hover:text-[#f2d99b]"
        href={href}
        rel="noreferrer"
        target={href?.startsWith("http") === true ? "_blank" : undefined}
      >
        {children}
      </a>
    );
  },
  code({ children }) {
    return (
      <code className="rounded-[2px] border border-[rgba(212,160,82,0.22)] bg-[rgba(10,6,4,0.55)] px-1 py-0.5 font-mono text-[0.92em] text-[#f0d49a]">
        {children}
      </code>
    );
  },
  li({ children }) {
    return <li className="pl-1 marker:text-[#c89b52]">{children}</li>;
  },
  ol({ children }) {
    return <ol>{children}</ol>;
  },
  p({ children }) {
    return <p>{children}</p>;
  },
  strong({ children }) {
    return <strong className="font-semibold text-[#f0d49a]">{children}</strong>;
  },
  ul({ children }) {
    return <ul>{children}</ul>;
  },
};

export function RavenNotesMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown components={ravenNotesMarkdownComponents} remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  );
}
