import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { ScoreBar, ScoreValue, StatusBadge } from "@/components/score";
import { useResumes } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/ranking")({
  head: () => ({
    meta: [
      { title: "Candidate Ranking — HireSense AI" },
      {
        name: "description",
        content:
          "Ranked candidate list with AI match scores, key skills, and shortlist status for every open role.",
      },
      { property: "og:title", content: "Candidate Ranking — HireSense AI" },
      {
        property: "og:description",
        content:
          "Ranked candidate list with AI match scores, key skills, and shortlist status for every open role.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CandidateRanking,
});

const filters = ["All", "Shortlisted", "In Review", "On Hold"] as const;

function label(status: string) {
  return status
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function CandidateRanking() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const { data: candidates = [], isLoading } = useResumes();

  const visible =
    filter === "All" ? candidates : candidates.filter((c) => label(c.status) === filter);

  return (
    <AppShell title="Candidate Ranking">
      {/* Filter chips */}
      <section className="flex flex-wrap items-center gap-2">
        {filters.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              filter === option
                ? "bg-primary text-primary-foreground ring-1 ring-primary"
                : "bg-card text-muted-foreground ring-1 ring-foreground/10 hover:text-foreground"
            )}
          >
            {option}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {visible.length} candidate{visible.length === 1 ? "" : "s"} · Placeholder scores
        </span>
      </section>

      {/* Ranking list */}
      <section className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/5">
        {visible.map((candidate, index) => (
          <div key={candidate.id} className="flex items-center gap-3 p-4 md:gap-4">
            <span className="w-5 shrink-0 text-center text-xs font-medium tabular-nums text-muted-foreground">
              {index + 1}
            </span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-[11px] font-medium text-secondary-foreground ring-1 ring-foreground/5">
              {candidate.candidate_name.slice(0, 2).toUpperCase() || "??"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{candidate.candidate_name || "Unnamed"}</p>
              <p className="text-[11px] text-muted-foreground">
                {candidate.file_name} · Uploaded{" "}
                {new Date(candidate.created_at).toLocaleDateString()}
              </p>
              <div className="mt-1.5 hidden gap-1 sm:flex">
                {candidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex w-20 shrink-0 flex-col items-end gap-1.5 md:w-28">
              <ScoreValue score={candidate.match_score ?? 0} />
              <ScoreBar score={candidate.match_score ?? 0} className="w-full" />
            </div>
            <div className="hidden shrink-0 md:block">
              <StatusBadge status={label(candidate.status)} />
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
          </div>
        ))}
        {visible.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {isLoading ? "Loading candidates…" : "No candidates match this filter."}
          </p>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        Match scores are placeholders — AI scoring against your job descriptions lands in the next
        phase.
      </p>
    </AppShell>
  );
}
