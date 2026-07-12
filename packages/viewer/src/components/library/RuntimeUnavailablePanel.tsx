import type { ReactElement } from "react";

interface RuntimeUnavailablePanelProps {
  density?: "compact" | "normal";
  message: string;
  onRetry(): Promise<void> | void;
  title: string;
}

export function RuntimeUnavailablePanel({
  density = "normal",
  message,
  onRetry,
  title,
}: RuntimeUnavailablePanelProps): ReactElement {
  const isCompact = density === "compact";

  return (
    <div
      className={`border border-[#4b3827] bg-[#1d140b]/70 text-center shadow-[0_18px_36px_rgba(0,0,0,0.35)] ${
        isCompact ? "p-4" : "p-8"
      }`}
      data-testid="runtime-unavailable-panel"
      role="status"
    >
      <h2 className={`font-display text-[#d4a052] ${isCompact ? "text-[16px]" : "text-[20px]"}`}>
        {title}
      </h2>
      <p
        className={`mx-auto mt-3 leading-6 text-[#9a8c78] ${
          isCompact ? "max-w-none text-[13px]" : "max-w-[480px] text-[13px]"
        }`}
      >
        {message}
      </p>
      <button
        className="mt-5 rounded-[3px] border border-[#6a5132] bg-[#21170f]/80 px-4 py-1.5 text-[12px] uppercase tracking-[0.12em] text-[#d4a052] hover:text-[#e8b86d]"
        onClick={() => {
          void onRetry();
        }}
        type="button"
      >
        Retry
      </button>
    </div>
  );
}
