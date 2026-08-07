import { createFileRoute, Link } from "@tanstack/react-router";
import { CloudUpload, Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { ScoreBar, ScoreValue } from "@/components/score";
import { useJobs, useResumes } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — HireSense AI" },
      {
        name: "description",
        content:
          "Recruiting overview: total resumes screened, shortlisted candidates, open roles, and top candidate matches.",
      },
      { property: "og:title", content: "Dashboard — HireSense AI" },
      {
        property: "og:description",
        content:
          "Recruiting overview: total resumes screened, shortlisted candidates, open roles, and top candidate matches.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: resumes = [] } = useResumes();
  const { data: jobs = [] } = useJobs();

  const shortlisted = resumes.filter((r) => r.status === "shortlisted").length;
  const scores = resumes.map((r) => r.match_score ?? 0).filter((s) => s > 0);
  const avgMatch = scores.length
    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
    : 0;

  const kpis = [
    { label: "Total Resumes", value: resumes.length.toLocaleString() },
    { label: "Shortlisted", value: shortlisted.toLocaleString() },
    { label: "Open Roles", value: jobs.filter((j) => j.status === "active").length.toString() },
    { label: "Avg Match", value: `${avgMatch}%` },
  ];

  const topCandidates = resumes.slice(0, 3);

  return (
    <AppShell title="Dashboard">
      {/* KPI grid */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col gap-1 rounded-xl bg-card p-3.5 ring-1 ring-foreground/5"
          >
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {kpi.label}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-medium tracking-tight">{kpi.value}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Quick upload dropzone */}
      <Link
        to="/upload"
        className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/50 p-8 transition-colors hover:border-muted-foreground/40"
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-card ring-1 ring-foreground/5">
          <CloudUpload className="size-4 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Upload Resumes</p>
          <p className="text-xs text-muted-foreground">Drop PDF or DOCX files here</p>
        </div>
      </Link>

      {/* Top candidates */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Top Candidates</h2>
          <Link to="/ranking" className="text-xs font-medium text-success">
            View All
          </Link>
        </div>

        <div className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/5">
          {topCandidates.map((candidate) => (
            <div key={candidate.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-[11px] font-medium text-secondary-foreground ring-1 ring-foreground/5">
                  {candidate.candidate_name.slice(0, 2).toUpperCase() || "??"}
                </span>
                <div>
                  <p className="text-sm font-medium">{candidate.candidate_name || "Unnamed"}</p>
                  <p className="text-[11px] text-muted-foreground">{candidate.file_name}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <ScoreValue score={candidate.match_score ?? 0} />
                <ScoreBar score={candidate.match_score ?? 0} className="w-12 md:w-24" />
              </div>
            </div>
          ))}
          {topCandidates.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Upload resumes to see your top matches here.
            </p>
          )}
        </div>
      </section>

      {/* Primary action */}
      <div className="pt-2">
        <Link
          to="/jobs"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 pl-2 pr-3 text-sm font-medium text-primary-foreground ring-1 ring-primary transition-transform active:scale-[0.98]"
        >
          <Plus className="size-4 shrink-0" />
          Create New Job Post
        </Link>
      </div>
    </AppShell>
  );
}
