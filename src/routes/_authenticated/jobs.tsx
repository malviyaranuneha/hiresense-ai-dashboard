import { createFileRoute } from "@tanstack/react-router";
import { CloudUpload, FileText } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/score";
import { jobDescriptions } from "@/lib/data";

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

function JobDescriptions() {
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
            placeholder="Paste the full job description here — responsibilities, required skills, experience level…"
            className="resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/50 p-6 text-center">
          <div className="flex size-9 items-center justify-center rounded-full bg-card ring-1 ring-foreground/5">
            <CloudUpload className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Upload JD file</p>
            <p className="text-xs text-muted-foreground">PDF, DOCX or TXT up to 10MB</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-1 ring-primary transition-transform active:scale-[0.98]"
          >
            Save Job Description
          </button>
        </div>
      </section>

      {/* Existing job descriptions */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Active Job Descriptions</h2>
          <span className="text-xs text-muted-foreground">{jobDescriptions.length} roles</span>
        </div>

        <div className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/5">
          {jobDescriptions.map((job) => (
            <div key={job.id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary ring-1 ring-foreground/5">
                  <FileText className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{job.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {job.department} · {job.location} · Posted {job.posted}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-[11px] text-muted-foreground sm:block">
                  {job.candidates} candidates
                </span>
                <StatusBadge status={job.status} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
