import { createFileRoute } from "@tanstack/react-router";
import { CloudUpload, FileText, X } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";

import { AppShell } from "@/components/app-shell";
import { useResumes, useUploadResumes } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/upload")({
  head: () => ({
    meta: [
      { title: "Resume Upload — HireSense AI" },
      {
        name: "description",
        content:
          "Batch-upload candidate resumes as PDF or DOCX files and queue them for AI screening against open roles.",
      },
      { property: "og:title", content: "Resume Upload — HireSense AI" },
      {
        property: "og:description",
        content:
          "Batch-upload candidate resumes as PDF or DOCX files and queue them for AI screening against open roles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResumeUpload,
});

interface QueuedFile {
  id: number;
  name: string;
  size: string;
  file: File;
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function ResumeUpload() {
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  const uploadResumes = useUploadResumes();
  const { data: resumes = [] } = useResumes();
  const recentUploads = resumes.slice(0, 5);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const added = Array.from(list).map((file) => ({
      id: nextId.current++,
      name: file.name,
      size: formatSize(file.size),
      file,
    }));
    setMessage(null);
    setFiles((prev) => [...prev, ...added]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const removeFile = (id: number) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleProcess = async () => {
    setMessage(null);
    const count = files.length;
    try {
      const result = await uploadResumes.mutateAsync(files.map((f) => f.file));
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      const base = `Uploaded ${count} resume${count === 1 ? "" : "s"}. Text extracted from ${result.extracted}/${result.total}.`;
      setMessage({
        tone: result.extractionErrors.length > 0 ? "error" : "ok",
        text:
          result.extractionErrors.length > 0
            ? `${base} ${result.extractionErrors.join("; ")}`
            : base,
      });
    } catch (err) {
      setMessage({
        tone: "error",
        text: `Upload failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  };

  return (
    <AppShell title="Resume Upload">
      {/* Dropzone */}
      <section
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-secondary/50 p-10 text-center transition-colors",
          isDragging ? "border-success bg-success/5" : "border-border hover:border-muted-foreground/40"
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-card ring-1 ring-foreground/5">
          <CloudUpload className="size-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Drop resumes here, or click to browse</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            PDF, DOC or DOCX · multiple files supported · up to 20MB each
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </section>

      {message && (
        <p
          className={cn(
            "text-xs",
            message.tone === "error" ? "text-destructive" : "text-success"
          )}
        >
          {message.text}
        </p>
      )}

      {/* Upload queue */}
      {files.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Upload Queue</h2>
            <span className="text-xs text-muted-foreground">
              {files.length} file{files.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/5">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary ring-1 ring-foreground/5">
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground">{file.size}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                    {uploadResumes.isPending ? "Uploading" : "Queued"}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => removeFile(file.id)}
                    disabled={uploadResumes.isPending}
                    className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleProcess}
              disabled={uploadResumes.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-1 ring-primary transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {uploadResumes.isPending
                ? "Processing…"
                : `Process ${files.length} Resume${files.length === 1 ? "" : "s"}`}
            </button>
          </div>
          <p className="-mt-2 text-right text-[11px] text-muted-foreground">
            AI parsing and scoring will be wired up in a later phase.
          </p>
        </section>
      )}

      {/* Recent uploads */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold tracking-tight">Recent Uploads</h2>
        <div className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/5">
          {recentUploads.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">No resumes uploaded yet.</p>
          ) : (
            recentUploads.map((file) => (
              <div key={file.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary ring-1 ring-foreground/5">
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{file.file_name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {file.file_size ? formatSize(file.file_size) : "—"}
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                  Parsed
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}
