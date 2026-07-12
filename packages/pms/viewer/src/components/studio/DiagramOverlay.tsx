import { useCallback, useEffect, useRef, useState } from "react";
import * as Effect from "effect/Effect";
import { fetchStudioFile } from "../../app/runtime/studio";

/**
 * The Play, Drawn — full-screen diagram overlay. Fetches the SVG text
 * for a play's diagram.svg, injects it into a stage, and supports
 * scroll-to-zoom, drag-to-pan, double-click-reset, and esc/✕-to-close.
 * Ported from the old workshop's openDia() (frame-the-problem/index.html).
 */
export function DiagramOverlay(props: { onClose: () => void; path: string }): React.ReactElement {
  const { onClose, path } = props;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const svgHostRef = useRef<HTMLDivElement | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // pan/zoom state lives in a ref so the wheel/drag handlers stay stable
  const view = useRef({ s: 1, tx: 0, ty: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  const apply = useCallback(() => {
    const host = svgHostRef.current;
    if (host == null) {
      return;
    }
    const { s, tx, ty } = view.current;
    host.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
    host.style.transformOrigin = "center center";
  }, []);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setError(null);
    void Effect.runPromise(fetchStudioFile(path)).then(
      (text) => {
        if (!cancelled) {
          setSvg(text);
        }
      },
      (cause: unknown) => {
        if (!cancelled) {
          setError(String(cause));
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [path]);

  // reset the view whenever a fresh diagram lands
  useEffect(() => {
    view.current = { s: 1, tx: 0, ty: 0 };
    apply();
  }, [svg, apply]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Wheel must be a NATIVE non-passive listener: React's synthetic onWheel is
  // registered passive at the root, so event.preventDefault() there is a no-op
  // and the page scrolls behind the overlay while zooming.
  useEffect(() => {
    const stage = stageRef.current;
    if (stage == null) {
      return;
    }
    const onWheel = (event: WheelEvent): void => {
      event.preventDefault();
      const next = view.current.s * (event.deltaY < 0 ? 1.12 : 0.89);
      view.current.s = Math.min(8, Math.max(0.3, next));
      apply();
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [apply]);

  const onMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    drag.current = {
      x: event.clientX - view.current.tx,
      y: event.clientY - view.current.ty,
    };
    if (stageRef.current != null) {
      stageRef.current.style.cursor = "grabbing";
    }
  }, []);

  const onMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (drag.current == null) {
        return;
      }
      view.current.tx = event.clientX - drag.current.x;
      view.current.ty = event.clientY - drag.current.y;
      apply();
    },
    [apply],
  );

  const endDrag = useCallback(() => {
    drag.current = null;
    if (stageRef.current != null) {
      stageRef.current.style.cursor = "grab";
    }
  }, []);

  const onDoubleClick = useCallback(() => {
    view.current = { s: 1, tx: 0, ty: 0 };
    apply();
  }, [apply]);

  const zoomBy = useCallback(
    (factor: number) => {
      view.current.s = Math.min(8, Math.max(0.3, view.current.s * factor));
      apply();
    },
    [apply],
  );

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#0a0704]">
      <div className="flex items-center justify-between border-b border-[#d4a052]/20 px-6 py-3 text-[11.5px] tracking-[0.05em] text-[#9a8c78]">
        <span>The Play, Drawn — scroll to zoom · drag to pan · double-click to reset</span>
        <button
          className="rounded-[3px] border border-[#d4a052]/35 px-3.5 py-1 text-[11px] uppercase tracking-[0.1em] text-[#e8b86d] hover:bg-[#d4a052]/10"
          onClick={onClose}
          type="button"
        >
          ✕ close (esc)
        </button>
      </div>
      <div
        className="flex-1 cursor-grab overflow-hidden"
        onDoubleClick={onDoubleClick}
        onMouseDown={onMouseDown}
        onMouseLeave={endDrag}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        ref={stageRef}
      >
        {error != null ? (
          <p className="p-8 text-[12px] text-[#e08a8a]">{error}</p>
        ) : svg == null ? (
          <p className="p-8 text-[12px] text-[#8f806c]">loading diagram…</p>
        ) : (
          <div
            className="flex h-full w-full items-center justify-center [&_svg]:max-h-full [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
            ref={svgHostRef}
          />
        )}
      </div>
      {/* zoom controls — discoverable alongside scroll-to-zoom */}
      <div className="absolute bottom-5 right-5 flex items-center gap-1 rounded-[8px] border border-[#d4a052]/30 bg-[#0a0704]/90 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
        <button
          aria-label="zoom out"
          className="h-8 w-8 rounded-[5px] text-[18px] text-[#e8b86d] hover:bg-[#d4a052]/15"
          onClick={() => zoomBy(0.8)}
          type="button"
        >
          −
        </button>
        <button
          className="h-8 rounded-[5px] px-3 text-[11px] uppercase tracking-[0.1em] text-[#9a8c78] hover:bg-[#d4a052]/15 hover:text-[#e8b86d]"
          onClick={onDoubleClick}
          type="button"
        >
          fit
        </button>
        <button
          aria-label="zoom in"
          className="h-8 w-8 rounded-[5px] text-[18px] text-[#e8b86d] hover:bg-[#d4a052]/15"
          onClick={() => zoomBy(1.25)}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}
