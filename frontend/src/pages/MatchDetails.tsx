import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Activity } from "lucide-react";
import { Match } from "../types";
import { api } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import { LiveFeed } from "../components/LiveFeed";
import { StatusIndicator } from "../components/StatusIndicator";

export default function MatchDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newText, setNewText] = useState("");
  const [minute, setMinute] = useState("");
  const [period, setPeriod] = useState("");
  const [eventType, setEventType] = useState("");
  const [actor, setActor] = useState("");
  const [team, setTeam] = useState("");
  const [match, setMatch] = useState<Match | null>(null);

  const { commentary, status, liveScore, setCommentary } = useWebSocket(id);

  const isAdmin = !!localStorage.getItem("token");

  const currentHomeScore = liveScore?.homeScore ?? match?.homeScore ?? 0;
  const currentAwayScore = liveScore?.awayScore ?? match?.awayScore ?? 0;

  const handleUpdateScore = async (homeScore: number, awayScore: number) => {
    if (!id) return;
    try {
      await api.updateScore(id, homeScore, awayScore);
    } catch (err: any) {
      alert(err.message || "Failed to update score");
    }
  };

  // Fetch initial match info & past commentary
  useEffect(() => {
    const fetchMatchAndCommentary = async () => {
      if (!id) return;
      try {
        const [matchData, commData] = await Promise.all([
          api.getMatch(id),
          api.getCommentary(id),
        ]);
        setMatch(matchData);
        setCommentary(commData);
      } catch (err) {
        console.error("Failed to load match data", err);
      }
    };
    fetchMatchAndCommentary();
  }, [id, setCommentary]);

  const handleAddCommentary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newText || !minute) return;

    try {
      await api.postCommentary(id, {
        message: newText,
        minute: parseInt(minute),
        ...(period && { period }),
        ...(eventType && { eventType }),
        ...(actor && { actor }),
        ...(team && { team }),
      });
      setNewText("");
      setMinute("");
      setPeriod("");
      setEventType("");
      setActor("");
      setTeam("");
      // No state append needed; WebSocket handles the live update
    } catch (err: any) {
      alert(err.message || "Failed to post commentary");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-center pb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted hover:text-white bg-surface hover:bg-surface-hover rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-semibold tracking-tight">
            {isAdmin ? "SportPulse Admin" : "SportPulse Live"}
          </span>
        </div>
      </header>

      <div className="from-surface to-background border border-surface-hover p-2 mb-4 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              {match ? match.status : "LIVE"}
            </span>
            <span className="text-sm font-medium text-text-muted">
              Match ID: {id}
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-center md:text-left">
            {match ? (
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-1">{match.homeTeam}</span>
                  <div className="flex items-center gap-3">
                    {isAdmin && (
                      <button onClick={() => handleUpdateScore(Math.max(0, currentHomeScore - 1), currentAwayScore)} className="w-8 h-8 rounded-full bg-surface-hover hover:bg-primary text-white flex items-center justify-center font-bold transition-colors">-</button>
                    )}
                    <span className="text-5xl text-primary font-black">{currentHomeScore}</span>
                    {isAdmin && (
                      <button onClick={() => handleUpdateScore(currentHomeScore + 1, currentAwayScore)} className="w-8 h-8 rounded-full bg-surface-hover hover:bg-primary text-white flex items-center justify-center font-bold transition-colors">+</button>
                    )}
                  </div>
                </div>
                <span className="text-3xl text-text-muted font-light mt-8">
                  -
                </span>
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-1">{match.awayTeam}</span>
                  <div className="flex items-center gap-3">
                    {isAdmin && (
                      <button onClick={() => handleUpdateScore(currentHomeScore, Math.max(0, currentAwayScore - 1))} className="w-8 h-8 rounded-full bg-surface-hover hover:bg-primary text-white flex items-center justify-center font-bold transition-colors">-</button>
                    )}
                    <span className="text-5xl text-primary font-black">{currentAwayScore}</span>
                    {isAdmin && (
                      <button onClick={() => handleUpdateScore(currentHomeScore, currentAwayScore + 1)} className="w-8 h-8 rounded-full bg-surface-hover hover:bg-primary text-white flex items-center justify-center font-bold transition-colors">+</button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              "Loading Match..."
            )}
          </h1>
        </div>
        <div>
          <StatusIndicator status={status} />
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {isAdmin && (
          <div className="md:col-span-4">
            <div className="bg-surface border border-surface-hover rounded-2xl p-6 sticky top-6 shadow-lg">
              <h2 className="font-semibold mb-6 text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" /> Post Update
              </h2>
              <form onSubmit={handleAddCommentary} className="space-y-4">
                {/* ... existing form fields ... */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      Minute *
                    </label>
                    <input
                      type="number"
                      value={minute}
                      onChange={(e) => setMinute(e.target.value)}
                      placeholder="e.g. 45"
                      className="w-full px-3 py-2 bg-background border border-surface-hover rounded-xl text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      Period
                    </label>
                    <input
                      type="text"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      placeholder="e.g. 1H, 2H"
                      className="w-full px-3 py-2 bg-background border border-surface-hover rounded-xl text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      Event Type
                    </label>
                    <input
                      type="text"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      placeholder="e.g. goal, foul"
                      className="w-full px-3 py-2 bg-background border border-surface-hover rounded-xl text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      Team
                    </label>
                    <input
                      type="text"
                      value={team}
                      onChange={(e) => setTeam(e.target.value)}
                      placeholder="e.g. Real Madrid"
                      className="w-full px-3 py-2 bg-background border border-surface-hover rounded-xl text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    Actor / Player
                  </label>
                  <input
                    type="text"
                    value={actor}
                    onChange={(e) => setActor(e.target.value)}
                    placeholder="e.g. Sunil Chettri"
                    className="w-full px-3 py-2 bg-background border border-surface-hover rounded-xl text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    Commentary Text *
                  </label>
                  <textarea
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="GOAL! Sunil cuts inside..."
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-surface-hover rounded-xl text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 mt-2"
                >
                  Broadcast Event
                </button>
              </form>
            </div>
          </div>
        )}

        <div className={isAdmin ? "md:col-span-8" : "md:col-span-12 max-w-3xl mx-auto w-full"}>
          <h2 className="font-semibold mb-6 text-xl flex items-center gap-2">
            Live Feed
          </h2>
          <LiveFeed commentary={commentary} />
        </div>
      </div>
    </div>
  );
}
