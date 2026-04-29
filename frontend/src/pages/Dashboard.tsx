import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, LogOut, X } from "lucide-react";
import { useMatches } from "../hooks/useMatches";
import { MatchCard } from "../components/MatchCard";
import { api } from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    pagedMatches,
    matches,
    isLoading,
    currentPage,
    totalPages,
    setCurrentPage,
    refreshMatches,
  } = useMatches(5);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sport, setSport] = useState("football");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMatch({
        sport,
        homeTeam,
        awayTeam,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        homeScore: 0,
        awayScore: 0,
      });

      setIsModalOpen(false);
      setHomeTeam("");
      setAwayTeam("");
      setStartTime("");
      setEndTime("");
      refreshMatches();
    } catch (err: any) {
      alert(err.message || "Failed to create match");
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

      {isLoading ? (
        <div className="p-12 text-center text-text-muted">
          Loading matches...
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {pagedMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
            {matches.length === 0 && (
              <div className="p-12 text-center text-text-muted bg-surface/30 rounded-2xl border border-dashed border-surface-hover">
                No matches found.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {matches.length > 0 && (
            <div className="mt-6 flex items-center justify-between px-2">
              <span className="text-sm text-text-muted font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    currentPage === 1
                      ? "bg-surface text-text-muted cursor-not-allowed opacity-50"
                      : "bg-surface hover:bg-surface-hover text-text hover:text-white"
                  }`}
                >
                  Prev
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    currentPage === totalPages
                      ? "bg-surface text-text-muted cursor-not-allowed opacity-50"
                      : "bg-surface hover:bg-surface-hover text-text hover:text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

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
