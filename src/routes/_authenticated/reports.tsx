import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { candidatesPerRole, pipelineBreakdown, scoreDistribution } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports — HireSense AI" },
      {
        name: "description",
        content:
          "Recruiting analytics: candidates per role, match-score distribution, and pipeline breakdown.",
      },
      { property: "og:title", content: "Reports — HireSense AI" },
      {
        property: "og:description",
        content:
          "Recruiting analytics: candidates per role, match-score distribution, and pipeline breakdown.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reports,
});

const monthlyStats = [
  { label: "Resumes Processed", value: "312", delta: "+18%" },
  { label: "Shortlist Rate", value: "12.1%", delta: "+1.4pt" },
  { label: "Avg Time-to-Shortlist", value: "4.2h", delta: "-36%" },
  { label: "Top Match Score", value: "94%", delta: undefined },
];

function Reports() {
  const maxPerRole = Math.max(...candidatesPerRole.map((r) => r.count));
  const maxBand = Math.max(...scoreDistribution.map((b) => b.count));
  const pipelineTotal = pipelineBreakdown.reduce((sum, s) => sum + s.value, 0);

  return (
    <AppShell title="Reports">
      {/* Monthly summary */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {monthlyStats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 rounded-xl bg-card p-3.5 ring-1 ring-foreground/5"
          >
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-medium tracking-tight">{stat.value}</span>
              {stat.delta && <span className="text-[10px] text-success">{stat.delta}</span>}
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Candidates per role */}
        <section className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/5 md:p-6">
          <h2 className="text-sm font-semibold tracking-tight">Candidates per Role</h2>
          <div className="flex flex-col gap-3">
            {candidatesPerRole.map((row) => (
              <div key={row.role} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-xs text-muted-foreground">{row.role}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-score-track">
                  <div
                    className="score-bar-fill h-full rounded-full bg-primary"
                    style={{ width: `${(row.count / maxPerRole) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums">
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Score distribution */}
        <section className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/5 md:p-6">
          <h2 className="text-sm font-semibold tracking-tight">Match Score Distribution</h2>
          <div className="flex h-44 items-stretch gap-3">
            {scoreDistribution.map((band) => (
              <div key={band.band} className="flex h-full flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                  {band.count}
                </span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-primary"
                    style={{ height: `${(band.count / maxBand) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{band.band}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Pipeline breakdown */}
      <section className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/5 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Pipeline Breakdown</h2>
          <span className="text-xs text-muted-foreground">
            {pipelineTotal.toLocaleString()} total resumes
          </span>
        </div>

        <div className="flex h-2.5 w-full overflow-hidden rounded-full">
          {pipelineBreakdown.map((segment, index) => (
            <div
              key={segment.label}
              className={
                index === 0 ? "bg-success" : index === 1 ? "bg-chart-4" : "bg-muted-foreground/30"
              }
              style={{ width: `${(segment.value / pipelineTotal) * 100}%` }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {pipelineBreakdown.map((segment, index) => (
            <div key={segment.label} className="flex items-center gap-2 text-xs">
              <span
                className={
                  index === 0
                    ? "size-2 rounded-full bg-success"
                    : index === 1
                      ? "size-2 rounded-full bg-chart-4"
                      : "size-2 rounded-full bg-muted-foreground/30"
                }
              />
              <span className="text-muted-foreground">{segment.label}</span>
              <span className="ml-auto font-medium tabular-nums">
                {segment.value.toLocaleString()} · {Math.round((segment.value / pipelineTotal) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Export */}
      <div className="flex justify-end">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-1 ring-primary transition-transform active:scale-[0.98]"
        >
          <Download className="size-4" />
          Export Report (CSV)
        </button>
      </div>
    </AppShell>
  );
}
