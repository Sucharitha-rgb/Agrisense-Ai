import type { Action, DecisionResult, Priority, RiskLevel } from "@/domain/decisionEngine";
import { cn } from "@/lib/utils";

const riskStyles: Record<RiskLevel, { bar: string; chip: string; emoji: string; label: string }> = {
  healthy: {
    bar: "bg-success",
    chip: "bg-success/15 text-success border-success/40",
    emoji: "🟢",
    label: "Healthy",
  },
  watch: {
    bar: "bg-warning",
    chip: "bg-warning/15 text-warning-foreground border-warning/40",
    emoji: "🟡",
    label: "Watch closely",
  },
  act: {
    bar: "bg-destructive",
    chip: "bg-destructive/10 text-destructive border-destructive/40",
    emoji: "🔴",
    label: "Act now",
  },
};

const priorityStyles: Record<Priority, { dot: string; label: string; ring: string }> = {
  urgent: { dot: "bg-destructive", label: "Urgent", ring: "ring-destructive/30" },
  soon: { dot: "bg-warning", label: "Soon", ring: "ring-warning/30" },
  routine: { dot: "bg-primary", label: "Routine", ring: "ring-primary/20" },
};

function formatDeadline(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms < 0) return "overdue";
  const hours = Math.round(ms / 3_600_000);
  if (hours < 24) return `in ${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 14) return `in ${days}d`;
  return `in ${Math.round(days / 7)}w`;
}

const categoryIcon: Record<Action["category"], string> = {
  spray: "💧",
  irrigate: "🚿",
  monitor: "🔍",
  prune: "✂️",
  soil: "🌱",
  harvest: "🌾",
  general: "•",
};

export function ActionPlan({ decision }: { decision: DecisionResult }) {
  const r = riskStyles[decision.risk];

  return (
    <div className="card-soft overflow-hidden border-2" style={{ borderColor: "transparent" }}>
      {/* Traffic-light header */}
      <div className={cn("flex items-center gap-3 px-5 py-3", r.bar, "text-white")}>
        <span className="text-2xl leading-none" aria-hidden>{r.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest opacity-90 font-semibold">{r.label}</p>
          <p className="font-display text-base sm:text-lg leading-tight truncate">{decision.headline}</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Action list */}
        <ol className="space-y-3">
          {decision.actions.map((a) => {
            const p = priorityStyles[a.priority];
            return (
              <li
                key={a.id}
                className={cn(
                  "rounded-xl border border-border bg-card p-4 ring-1 ring-inset",
                  p.ring,
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg",
                      "bg-muted",
                    )}
                    aria-hidden
                  >
                    {categoryIcon[a.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sm sm:text-base text-foreground leading-snug">
                        {a.title}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", `${p.dot}/15 text-foreground`)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", p.dot)} />
                          {p.label}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">{a.whenLabel}</span>
                      <span className="mx-1.5 opacity-50">•</span>
                      <span className="tabular-nums">{formatDeadline(a.deadlineIso)}</span>
                    </p>
                    <p className="mt-2 text-sm text-foreground/80 leading-relaxed">{a.reason}</p>
                    {a.blockedBy && (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-warning/15 px-2 py-1 text-[11px] font-medium text-warning-foreground">
                        ⏸ Waiting: {a.blockedBy}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Why these actions — explainability */}
        {decision.factors.length > 0 && (
          <details className="group rounded-xl border border-border bg-muted/40 p-3">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
              Why these actions? ({decision.factors.length} factors)
            </summary>
            <ul className="mt-3 space-y-1.5">
              {decision.factors.map((f, i) => (
                <li key={i} className="flex gap-2 text-xs text-foreground/80">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
