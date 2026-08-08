import { createFileRoute } from "@tanstack/react-router";
import { CloudUpload, FileText, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/score";
import { useCreateJob, useJobs, useResumes } from "@/lib/api";
import { JD_ACCEPT, extractJdText, validateJdFile } from "@/lib/jd-extract";

export const Route = createFileRoute("/_authenticated/jobs")({
  head: () => ({
    meta: [
      { title: "Job Descriptions — HireSense AI" },
      {
        name: "description",
        content:
          "Create and manage job descriptions: paste role text or upload a JD file to drive AI resume matching.",
      },
      { property: "og:title", content: "Job Descriptions — HireSense AI" },
      {
        property: "og:description",
        content:
          "Create and manage job descriptions: paste role text or upload a JD file to drive AI resume matching.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JobDescriptions,
});

function formatPosted(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function JobDescriptions() {
  const { data: jobs = [], isLoading, error: jobsError } = useJobs();
  const { data: resumes = [] } = useResumes();
  const createJob = useCreateJob();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const handleFile = async (picked: File | null) => {
    if (!picked) return;
    setMessage(null);
    const invalid = validateJdFile(picked);
    if (invalid) {
      setFile(null);
      setMessage({ tone: "error", text: invalid });
      return;
    }
    setFile(picked);
    setParsing(true);
    try {
      const text = await extractJdText(picked);
      if (text) {
        setDescription(text);
      } else {
        setMessage({
          tone: "error",
          text: "No readable text found in that file — paste the description manually.",
        });
      }
    } catch (err) {
      setMessage({
        tone: "error",
        text: `Could not read that file: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    setMessage(null);
    if (!title.trim()) {
      setMessage({ tone: "error", text: "Job title is required." });
      return;
    }
    if (!description.trim()) {
      setMessage({ tone: "error", text: "Description text is required." });
      return;
    }
    try {
      await createJob.mutateAsync({
        title: title.trim(),
        department: department.trim() || "General",
        description: description.trim(),
        file,
      });
      setTitle("");
      setDepartment("");
      setDescription("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setMessage({ tone: "ok", text: "Job description saved." });
    } catch (err) {
      setMessage({
        tone: "error",
        text: `Save failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  };

  const saving = createJob.isPending;

  return (
    <AppShell title="Job Descriptions">
      {/* New job description */}
      <section className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/5 md:p-6">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">New Job Description</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Paste the role text or upload a JD file — it becomes the matching baseline.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="job-title" className="text-xs font-medium text-muted-foreground">
              Job title
            </label>
            <input
              id="job-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="job-dept" className="text-xs font-medium text-muted-foreground">
              Department
            </label>
            <input
              id="job-dept"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Engineering"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="job-text" className="text-xs font-medium text-muted-foreground">
            Description text
          </label>
          <textarea
            id="job-text"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste the full job description here — responsibilities, required skills, experience level…"
            className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
          />
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/50 p-6 text-center transition-colors hover:border-ring"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-card ring-1 ring-foreground/5">
            {parsing ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <CloudUpload className="size-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {file ? file.name : parsing ? "Reading file…" : "Upload JD file"}
            </p>
            <p className="text-xs text-muted-foreground">PDF, DOCX or TXT up to 10MB</p>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={JD_ACCEPT}
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
        />

        {message ? (
          <p
            role="status"
            className={
              message.tone === "ok"
                ? "text-xs font-medium text-success"
                : "text-xs font-medium text-destructive"
            }
          >
            {message.text}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || parsing}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-1 ring-primary transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Job Description"}
          </button>
        </div>
      </section>

      {/* Existing job descriptions */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Active Job Descriptions</h2>
          <span className="text-xs text-muted-foreground">{jobs.length} roles</span>
        </div>

        <div className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/5">
          {isLoading ? (
            <p className="p-4 text-xs text-muted-foreground">Loading job descriptions…</p>
          ) : jobsError ? (
            <p className="p-4 text-xs text-destructive">
              {jobsError instanceof Error ? jobsError.message : "Could not load job descriptions."}
            </p>
          ) : jobs.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">
              No job descriptions yet — create your first one above.
            </p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary ring-1 ring-foreground/5">
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{job.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {job.department} · {job.location} · Posted {formatPosted(job.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-[11px] text-muted-foreground sm:block">
                    {resumes.filter((r) => r.job_description_id === job.id).length} candidates
                  </span>
                  <StatusBadge status={job.status.charAt(0).toUpperCase() + job.status.slice(1)} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}
