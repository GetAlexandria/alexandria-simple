import { useState, type DragEvent } from "react";
import * as Effect from "effect/Effect";
import type { ViewerRuntimeClient } from "../../../app/runtime/client";
import type { ViewerRuntimeError } from "../../../app/runtime/errors";
import type {
  RuntimeRavenVisionProjection,
  RuntimeSourceCreateResult,
} from "../../../app/runtime/schemas";
import { errorMessage } from "../error-message";

type SourceInputMode = "file" | "url" | "note";

const sourceModes = [
  ["file", "File drop"],
  ["url", "URL capture"],
  ["note", "Typed note"],
] as const;

interface VisionSourceIntakeProps {
  canRequestDrafting: boolean;
  draftRequestTitle: string | undefined;
  onRequestDrafting(): void;
  onVisionChange(vision: RuntimeRavenVisionProjection): void;
  requestingDraft: boolean;
  runtimeClient: ViewerRuntimeClient;
  sourceItems: RuntimeRavenVisionProjection["sourceItems"];
}

export function VisionSourceIntake({
  canRequestDrafting,
  draftRequestTitle,
  onRequestDrafting,
  onVisionChange,
  requestingDraft,
  runtimeClient,
  sourceItems,
}: VisionSourceIntakeProps) {
  const [sourceMode, setSourceMode] = useState<SourceInputMode>("file");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceFileDragging, setSourceFileDragging] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [addingSource, setAddingSource] = useState(false);

  function sourceCreateEffect(): Effect.Effect<
    RuntimeSourceCreateResult,
    ViewerRuntimeError
  > | null {
    const title = sourceTitle.trim();
    const titleInput = title.length === 0 ? {} : { title };

    if (sourceMode === "file") {
      if (sourceFile == null) {
        setSourceError("Choose one file source.");
        return null;
      }

      return runtimeClient.createFileSource({
        file: sourceFile,
        ...titleInput,
      });
    }

    if (sourceMode === "url") {
      const url = sourceUrl.trim();
      if (url.length === 0) {
        setSourceError("Enter one source URL.");
        return null;
      }

      return runtimeClient.createUrlSource({ url, ...titleInput });
    }

    const text = sourceNote.trim();
    if (text.length === 0) {
      setSourceError("Enter a typed source note.");
      return null;
    }

    return runtimeClient.createNoteSource({ text, ...titleInput });
  }

  async function addSource(): Promise<void> {
    setSourceError(null);

    const effect = sourceCreateEffect();
    if (effect == null) {
      return;
    }

    setAddingSource(true);
    try {
      const result = await Effect.runPromise(effect);
      onVisionChange(result.vision);
      setSourceTitle("");
      setSourceUrl("");
      setSourceNote("");
      setSourceFile(null);
    } catch (caught: unknown) {
      setSourceError(errorMessage(caught));
    } finally {
      setAddingSource(false);
    }
  }

  function chooseSourceFile(file: File | null): void {
    setSourceFile(file);
    setSourceError(null);
  }

  function handleSourceFileDrop(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    event.stopPropagation();
    setSourceFileDragging(false);

    const [file, ...rest] = Array.from(event.dataTransfer.files);
    if (file == null || rest.length > 0) {
      setSourceFile(null);
      setSourceError("Drop one file source.");
      return;
    }

    chooseSourceFile(file);
  }

  return (
    <section
      aria-label="Add sources"
      className="vision-source-panel mt-6"
      data-testid="vision-source-intake"
    >
      <div>
        <div className="flex items-center justify-between gap-4 max-[760px]:items-start max-[760px]:flex-col">
          <div className="flex min-w-0 items-center gap-3">
            <div
              aria-hidden="true"
              className="relative h-[58px] w-[58px] shrink-0 rounded-full bg-[radial-gradient(circle_at_30%_28%,rgba(255,222,180,0.16)_0%,transparent_45%),radial-gradient(circle_at_72%_78%,rgba(20,10,4,0.55)_0%,transparent_50%),linear-gradient(135deg,#4a3520_0%,#2e1f10_55%,#15100a_100%)] shadow-[inset_2px_2px_4px_rgba(255,220,180,0.20),inset_-2px_-2px_4px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(212,160,82,0.28),0_4px_16px_rgba(0,0,0,0.48),0_0_18px_rgba(212,160,82,0.12)]"
              data-testid="vision-source-raven-coin"
            >
              <span className="absolute inset-[7px] rounded-full bg-[#0a0606] shadow-[inset_2px_2px_6px_rgba(0,0,0,0.82),inset_-1px_-1px_3px_rgba(255,220,180,0.10)]" />
              <span className="absolute inset-[11px] overflow-hidden rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.70),inset_0_1px_1px_rgba(255,230,200,0.08)]">
                <img
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-90"
                  src="/raven-assets/raven-unlit.png"
                />
                <img
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                  src="/raven-assets/raven-lit.png"
                />
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d4a052]">
                Add sources
              </h2>
              <p className="mt-1 truncate font-display text-[15px] italic leading-5 text-[#b3a48d]">
                {sourceItems.length} attached to Raven
              </p>
            </div>
          </div>

          <div
            aria-label="Source type"
            className="flex flex-wrap items-center justify-end gap-2 max-[760px]:justify-start"
          >
            {sourceModes.map(([mode, label]) => (
              <button
                aria-pressed={sourceMode === mode}
                className="vision-source-mode focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]"
                data-testid={`vision-source-mode-${mode}`}
                key={mode}
                onClick={() => {
                  setSourceMode(mode);
                  setSourceError(null);
                }}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(164px,0.34fr)_auto] gap-3 max-[900px]:grid-cols-1">
          {sourceMode === "file" ? (
            <label
              className={[
                "vision-source-dropzone relative grid min-h-[72px] cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3",
                sourceFileDragging ? "is-dragging" : "",
              ].join(" ")}
              data-testid="vision-source-file-dropzone"
              onDragEnter={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setSourceFileDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (
                  event.relatedTarget instanceof Node &&
                  event.currentTarget.contains(event.relatedTarget)
                ) {
                  return;
                }
                setSourceFileDragging(false);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.stopPropagation();
                event.dataTransfer.dropEffect = "copy";
                setSourceFileDragging(true);
              }}
              onDrop={handleSourceFileDrop}
            >
              <span className="min-w-0">
                <span className="block font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[#b8863a]">
                  Source file
                </span>
                <span className="mt-1 block truncate font-display text-[15px] italic leading-5 text-[#f4ecdc]">
                  {sourceFile == null ? "Drop or choose one file" : sourceFile.name}
                </span>
              </span>
              <span className="rounded-full border border-[rgba(212,160,82,0.32)] px-3 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-[#d4a052]">
                Browse
              </span>
              <input
                className="sr-only"
                data-testid="vision-source-file-input"
                onChange={(event) => {
                  chooseSourceFile(event.target.files?.[0] ?? null);
                }}
                type="file"
              />
            </label>
          ) : sourceMode === "url" ? (
            <input
              aria-label="Source URL"
              className="vision-source-field h-11 px-3 text-[13px]"
              data-testid="vision-source-url-input"
              onChange={(event) => {
                setSourceUrl(event.target.value);
                setSourceError(null);
              }}
              placeholder="https://example.com/source"
              type="url"
              value={sourceUrl}
            />
          ) : (
            <textarea
              aria-label="Typed source note"
              className="vision-source-field min-h-[78px] resize-y px-3 py-2 text-[13px] leading-5"
              data-testid="vision-source-note-input"
              onChange={(event) => {
                setSourceNote(event.target.value);
                setSourceError(null);
              }}
              placeholder="Typed note"
              value={sourceNote}
            />
          )}

          <input
            aria-label="Source title"
            className="vision-source-field h-11 px-3 text-[13px]"
            data-testid="vision-source-title-input"
            onChange={(event) => setSourceTitle(event.target.value)}
            placeholder="Title"
            type="text"
            value={sourceTitle}
          />

          <button
            className="raven-btn-primary h-11 px-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]"
            data-testid="vision-source-add-button"
            disabled={addingSource}
            onClick={() => {
              void addSource();
            }}
            type="button"
          >
            {addingSource ? "Adding" : "Add"}
          </button>
        </div>

        {sourceError == null ? null : (
          <p
            className="raven-etched-note raven-etched-note-danger mt-3 px-3 py-2"
            data-testid="vision-source-error"
          >
            {sourceError}
          </p>
        )}

        <div className="vision-source-strip mt-4 p-2" data-testid="vision-source-strip">
          {sourceItems.length === 0 ? (
            <div className="raven-etched-note px-3 py-2" data-testid="vision-source-empty">
              No sources attached
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sourceItems.map((sourceItem) => (
                <article
                  className="vision-source-card"
                  data-testid="vision-source-card"
                  key={sourceItem.id}
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-[#4fb8a8] shadow-[0_0_10px_rgba(79,184,168,0.42)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-sans text-[12px] font-semibold leading-4 text-[#f4ecdc]">
                      {sourceItem.title}
                    </span>
                    <span className="block truncate font-display text-[12px] italic leading-4 text-[#b3a48d]">
                      {sourceItem.sourcePath}
                    </span>
                  </span>
                  <span className="raven-status-pip raven-status-pip-compact raven-status-pip-neutral shrink-0">
                    {sourceItem.status}
                  </span>
                  <span className="sr-only">
                    {sourceItem.kind} / {sourceItem.pathType}
                  </span>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            className={[
              "raven-btn-primary h-11 px-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]",
              canRequestDrafting ? "" : "cursor-not-allowed",
            ].join(" ")}
            data-testid="vision-start-drafting-button"
            disabled={!canRequestDrafting}
            onClick={onRequestDrafting}
            title={draftRequestTitle}
            type="button"
          >
            {requestingDraft ? "Requesting" : "Start drafting"}
          </button>
        </div>
      </div>
    </section>
  );
}
