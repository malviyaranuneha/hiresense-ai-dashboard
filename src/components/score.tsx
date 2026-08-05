import { scoreTone } from "@/lib/data";
import { cn } from "@/lib/utils";

export function ScoreBar({ score, className }: { score: number; className?: string }) {
  const tone = scoreTone(score);
  return (
    <div className={cn("h-1 overflow-hidden rounded-full bg-score-track", className)}>
      <div
        className={cn(
          "score-bar-fill h-full rounded-full",
          tone === "success" && "bg-success",
          tone === "warning" && "bg-warning",
          tone === "muted" && "bg-muted-foreground/40"
        )}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

export function ScoreValue({ score, className }: { score: number; className?: string }) {
  const tone = scoreTone(score);
  return (
    <span
      className={cn(
        "text-[11px] font-semibold tabular-nums",
        tone === "success" && "text-success",
        tone === "warning" && "text-warning",
        tone === "muted" && "text-muted-foreground",
        className
      )}
    >
      {score}%
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium",
        status === "Shortlisted" && "bg-success/10 text-success",
        status === "In Review" && "bg-secondary text-secondary-foreground",
        status === "On Hold" && "bg-warning/10 text-warning",
        status === "Active" && "bg-success/10 text-success",
        status === "Paused" && "bg-warning/10 text-warning",
        status === "Draft" && "bg-secondary text-secondary-foreground"
      )}
    >
      {status}
    </span>
  );
}
