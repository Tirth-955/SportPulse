import { Commentary } from "../types";
import { Clock } from "lucide-react";

interface LiveFeedProps {
  commentary: Commentary[];
}

export function LiveFeed({ commentary }: LiveFeedProps) {
  if (commentary.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center bg-surface/30 border border-surface-hover rounded-3xl border-dashed h-full min-h-[300px]">
        <div className="p-4 bg-background rounded-full mb-4 shadow-inner">
          <Clock className="w-8 h-8 text-text-muted" />
        </div>
        <h3 className="text-lg font-medium mb-1">Awaiting updates</h3>
        <p className="text-text-muted max-w-sm text-sm">
          No commentary events have been broadcast for this match yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
      {commentary.map((c, index) => (
        <div
          key={c.id || index}
          className="group flex gap-5 p-5 bg-surface border border-surface-hover hover:border-primary/30 rounded-2xl shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-background flex items-center justify-center font-bold text-lg text-primary border border-surface-hover group-hover:border-primary/50 group-hover:scale-110 transition-all shadow-inner">
            {c.minute}'
          </div>
          <div className="pt-1 w-full">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {c.period && (
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary bg-primary/10 rounded uppercase">
                  {c.period}
                </span>
              )}
              {c.eventType && (
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider text-purple-400 bg-purple-400/10 rounded uppercase">
                  {c.eventType}
                </span>
              )}
              {(c.actor || c.team) && (
                <span className="text-sm font-semibold text-text">
                  {c.actor} {c.actor && c.team && "-"} {c.team}
                </span>
              )}
            </div>
            <p className="text-text leading-relaxed text-[15px]">{c.message}</p>
            <p className="text-xs text-text-muted mt-3 font-medium flex items-center gap-1.5">
              <Clock className="w-3 h-3" />{" "}
              {c.createdAt
                ? new Date(c.createdAt).toLocaleTimeString()
                : "Just now"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
