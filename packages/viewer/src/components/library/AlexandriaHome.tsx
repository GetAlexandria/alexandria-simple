import type { RavenConnectionState } from "./types";

interface AlexandriaHomeProps {
  ravenConnectionState: RavenConnectionState;
  visionStartError?: string | null;
  visionStartPending?: boolean;
  onRavenAction(): void;
  onVisionStart(): void;
}

export function AlexandriaHome({
  ravenConnectionState,
  visionStartError = null,
  visionStartPending = false,
  onRavenAction,
  onVisionStart,
}: AlexandriaHomeProps) {
  const isConnected = ravenConnectionState === "connected";
  const ctaLabel = isConnected ? "Power up Raven: Vision" : "Connect Raven";
  const statusLabel = isConnected ? "Raven connection active" : "No active Raven connection";
  const statusTone = isConnected ? "raven-status-pip-connected" : "raven-status-pip-disconnected";

  return (
    <section className="raven-canvas-section min-h-[calc(100vh-84px-220px)] px-6 py-12">
      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-[minmax(0,1fr)_320px] items-center gap-10 max-[860px]:grid-cols-1">
        <div className="max-w-[620px]">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b8863a]">
            Alexandria Home
          </p>
          <h1 className="mt-3 font-display text-[64px] font-normal leading-none text-[#f1d9aa] max-[640px]:text-[46px]">
            Raven
          </h1>
          <p
            className={["raven-status-pip mt-5", statusTone].join(" ")}
            data-testid="raven-home-status"
          >
            {statusLabel}
          </p>
          <div className="mt-8">
            <button
              className={[
                "raven-btn-primary min-w-[230px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]",
                visionStartPending ? "cursor-wait" : "",
              ].join(" ")}
              data-testid="raven-home-cta"
              disabled={visionStartPending}
              onClick={isConnected ? onVisionStart : onRavenAction}
              type="button"
            >
              {ctaLabel}
            </button>
            {visionStartError == null ? null : (
              <p
                className="raven-etched-note raven-etched-note-danger mt-3 max-w-[460px] px-4 py-3"
                data-testid="raven-home-vision-error"
              >
                {visionStartError}
              </p>
            )}
          </div>
        </div>

        <div
          aria-label={`Raven coin: ${statusLabel}`}
          className="raven-home-coin relative mx-auto grid h-[300px] w-[300px] place-items-center max-[420px]:h-[248px] max-[420px]:w-[248px]"
          data-raven-connection-state={ravenConnectionState}
          data-testid="home-raven-coin"
        >
          <span className="raven-home-medallion absolute inset-[36px] max-[420px]:inset-[30px]">
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              src="/raven-assets/raven-unlit.png"
            />
            <img
              alt=""
              className={[
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
                isConnected ? "opacity-100" : "opacity-0",
              ].join(" ")}
              data-testid="home-raven-lit-layer"
              src="/raven-assets/raven-lit.png"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
