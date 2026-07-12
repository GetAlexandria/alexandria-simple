interface PlaceholderPanelProps {
  body: string;
  eyebrow: string;
  title: string;
}

function PlaceholderPanel({ body, eyebrow, title }: PlaceholderPanelProps) {
  return (
    <section className="raven-canvas-section min-h-[calc(100vh-84px-220px)] px-6 py-10">
      <div className="mx-auto max-w-[1120px] border border-[#4b3827] bg-[#1d140b]/70 p-7 font-display shadow-[0_18px_36px_rgba(0,0,0,0.35)]">
        <p className="text-[12px] uppercase tracking-[0.2em] text-[#8f806c]">{eyebrow}</p>
        <h1 className="mt-2 text-[30px] font-normal text-[#d4a052]">{title}</h1>
        <p className="mt-3 max-w-[620px] text-[16px] leading-7 text-[#b9aa91]">{body}</p>
      </div>
    </section>
  );
}

export function NotFoundView({ path }: { path: string }) {
  return (
    <PlaceholderPanel
      body={`No Alexandria viewer route exists for ${path}.`}
      eyebrow="route"
      title="Not found"
    />
  );
}
