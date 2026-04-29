import { Match } from "../types";
import { Calendar, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function MatchCard({ match }: { match: Match }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/match/${match.id}`)}
      className="group flex items-center justify-between p-5 bg-surface border border-surface-hover hover:border-primary/50 rounded-xl cursor-pointer transition-all hover:shadow-lg"
    >
      <div>
        <div className="flex items-center gap-3 mb-2">
          {match.status === "LIVE" ? (
            <span className="px-2.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
              LIVE
            </span>
          ) : (
            <span className="px-2.5 py-0.5 text-xs font-semibold text-primary bg-primary/10 rounded-full uppercase">
              {match.status}
            </span>
          )}
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
            {match.homeTeam} vs {match.awayTeam}
          </h3>
        </div>
        <div className="flex gap-4 text-sm text-text-muted">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />{" "}
            {new Date(match.startTime).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1.5 uppercase tracking-wide text-xs font-bold">
            {match.sport}
          </span>
        </div>
      </div>
      <div className="p-2 bg-background rounded-full group-hover:bg-primary/10 transition-colors">
        <ChevronRight className="w-6 h-6 text-text-muted group-hover:text-primary transition-colors group-hover:translate-x-1" />
      </div>
    </div>
  );
}
