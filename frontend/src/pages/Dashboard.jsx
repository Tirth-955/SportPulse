import { useNavigate } from "react-router-dom";
import { Activity, Calendar, MapPin, ChevronRight, LogOut } from "lucide-react";

const DUMMY_MATCHES = [
  {
    id: "1",
    title: "Manchester City vs Arsenal",
    date: "2026-05-12",
    venue: "Etihad Stadium",
    status: "LIVE",
  },
  {
    id: "2",
    title: "Real Madrid vs Barcelona",
    date: "2026-05-14",
    venue: "Santiago Bernabéu",
    status: "UPCOMING",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-center py-6 mb-8 border-b border-surface-hover">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            SportPulse Admin
          </h1>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:text-white bg-surface hover:bg-surface-hover rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-semibold mb-1">Matches</h2>
          <p className="text-sm text-text-muted">
            Manage active and upcoming matches
          </p>
        </div>
        <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary/20">
          + New Match
        </button>
      </div>

      <div className="grid gap-4">
        {DUMMY_MATCHES.map((match) => (
          <div
            key={match.id}
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
                  <span className="px-2.5 py-0.5 text-xs font-semibold text-primary bg-primary/10 rounded-full">
                    UPCOMING
                  </span>
                )}
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                  {match.title}
                </h3>
              </div>
              <div className="flex gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> {match.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {match.venue}
                </span>
              </div>
            </div>
            <div className="p-2 bg-background rounded-full group-hover:bg-primary/10 transition-colors">
              <ChevronRight className="w-6 h-6 text-text-muted group-hover:text-primary transition-colors group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
