import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Calendar,
  MapPin,
  ChevronRight,
  LogOut,
  X,
} from "lucide-react";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  startTime: string;
  endTime: string;
  status: "UPCOMING" | "LIVE" | "FINISHED";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sport, setSport] = useState("football");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/v1/matches");
      const json = await res.json();
      if (res.ok) {
        setMatches(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch matches:", err);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sport,
          homeTeam,
          awayTeam,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setHomeTeam("");
        setAwayTeam("");
        setStartTime("");
        setEndTime("");
        fetchMatches(); // refresh list
      } else {
        const error = await res.json();
        alert(error.message || "Failed to create match");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 relative">
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
        >
          + New Match
        </button>
      </div>

      <div className="grid gap-4">
        {matches.map((match) => (
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
        ))}
      </div>

      {/* New Match Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-surface-hover rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-surface-hover bg-surface/50">
              <h2 className="text-xl font-bold">Create New Match</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">
                  Sport
                </label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-surface-hover rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="football">Football</option>
                  <option value="basketball">Basketball</option>
                  <option value="tennis">Tennis</option>
                  <option value="cricket">Cricket</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">
                    Home Team
                  </label>
                  <input
                    type="text"
                    required
                    value={homeTeam}
                    onChange={(e) => setHomeTeam(e.target.value)}
                    placeholder="Home Team"
                    className="w-full px-4 py-2.5 bg-background border border-surface-hover rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">
                    Away Team
                  </label>
                  <input
                    type="text"
                    required
                    value={awayTeam}
                    onChange={(e) => setAwayTeam(e.target.value)}
                    placeholder="Away Team"
                    className="w-full px-4 py-2.5 bg-background border border-surface-hover rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-surface-hover rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-surface-hover rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-text-muted hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary/20"
                >
                  Create Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
