import type { Components } from "react-markdown";

/**
 * Shared Markdown component map — the brand standard for rendered prose in
 * viewer. Display-font headings with a real size hierarchy, spaced
 * paragraphs/lists, and styled blockquote/table/code/hr/links in the warm
 * binder palette. Used by both the library card drawer (CardMarkdown) and the
 * Play Maker's Studio (StudioMarkdown).
 *
 * This is presentation only — it does not transform link targets or strip
 * headings. Callers layer those concerns on (e.g. CardMarkdown handles
 * card:// wikilinks + the duplicate-H1 strip via its own normalize step).
 */
export const markdownComponents: Components = {
  a({ children, href }) {
    if (href?.startsWith("card://") === true) {
      return (
        <span className="inline-flex rounded-[2px] border border-[#7b613a] bg-[#2f2418] px-1.5 py-0.5 align-baseline font-display text-[0.88em] tracking-[0.03em] text-[#e7bd67] shadow-[inset_0_1px_0_rgba(255,230,170,0.08)]">
          {children}
        </span>
      );
    }

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
  blockquote({ children }) {
    return (
      <blockquote className="my-5 border-l-2 border-[#b98b46] bg-[#1a120c]/70 py-2 pl-4 pr-3 font-display text-[15px] italic leading-7 text-[#d2b984]">
        {children}
      </blockquote>
    );
  },
  code({ children, className }) {
    return (
      <code
        className={[
          className,
          "rounded-[2px] border border-[#493520] bg-[#120d09] px-1.5 py-0.5 font-mono text-[0.9em] text-[#f0d49a]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </code>
    );
  },
  em({ children }) {
    return <em className="text-[#d7c6a7]">{children}</em>;
  },
  h1({ children }) {
    return (
      <h1 className="mb-5 border-b border-[#4a3725] pb-3 font-display text-[22px] font-normal leading-7 text-[#f0d49a]">
        {children}
      </h1>
    );
  },
  h2({ children }) {
    return (
      <h2 className="mb-3 mt-7 border-l-2 border-[#d4a052] pl-3 font-display text-[13px] font-normal uppercase tracking-[0.18em] text-[#d4a052]">
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return (
      <h3 className="mb-2 mt-5 font-display text-[16px] font-normal uppercase tracking-[0.12em] text-[#e8c77d]">
        {children}
      </h3>
    );
  },
  h4({ children }) {
    return (
      <h4 className="mb-2 mt-4 font-display text-[14px] font-normal uppercase tracking-[0.1em] text-[#d8b36b]">
        {children}
      </h4>
    );
  },
  hr() {
    return <hr className="my-6 border-[#3b2c20]" />;
  },
  li({ children }) {
    return <li className="pl-1 leading-7 marker:text-[#c89b52]">{children}</li>;
  },
  ol({ children }) {
    return <ol className="my-4 list-decimal space-y-1 pl-6 text-[#d6c8b0]">{children}</ol>;
  },
  p({ children }) {
    return <p className="my-3 leading-7 text-[#d6c8b0]">{children}</p>;
  },
  pre({ children }) {
    return (
      <pre className="my-4 overflow-auto rounded-[3px] border border-[#493520] bg-[#0f0a07] p-3 text-[12px] leading-6 text-[#d7c6a7] shadow-[inset_0_1px_10px_rgba(0,0,0,0.55)]">
        {children}
      </pre>
    );
  },
  strong({ children }) {
    return <strong className="font-semibold text-[#f0d49a]">{children}</strong>;
  },
  table({ children }) {
    return (
      <div className="my-5 overflow-auto border border-[#493520]">
        <table className="w-full border-collapse text-left text-[13px]">{children}</table>
      </div>
    );
  },
  tbody({ children }) {
    return <tbody className="divide-y divide-[#332519]">{children}</tbody>;
  },
  td({ children }) {
    return (
      <td className="border-r border-[#332519] px-3 py-2 align-top text-[#d6c8b0] last:border-r-0">
        {children}
      </td>
    );
  },
  th({ children }) {
    return (
      <th className="border-r border-[#5b432b] bg-[#2a1e14] px-3 py-2 font-display text-[11px] uppercase tracking-[0.12em] text-[#d4a052] last:border-r-0">
        {children}
      </th>
    );
  },
  thead({ children }) {
    return <thead>{children}</thead>;
  },
  ul({ children }) {
    return <ul className="my-4 list-disc space-y-1 pl-6 text-[#d6c8b0]">{children}</ul>;
  },
};
