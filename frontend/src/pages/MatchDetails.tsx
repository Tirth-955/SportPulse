import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Activity } from "lucide-react";
import { Match, Commentary } from "../types";
import { api } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import { LiveFeed } from "../components/LiveFeed";
import { StatusIndicator } from "../components/StatusIndicator";

export default function MatchDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newText, setNewText] = useState("");
  const [minute, setMinute] = useState("");
  const [match, setMatch] = useState<Match | null>(null);

  const { commentary, status, setCommentary } = useWebSocket(id);

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
      await api.postCommentary(id, newText, parseInt(minute));
      setNewText("");
      setMinute("");
      // No state append needed; WebSocket handles the live update
    } catch (err: any) {
      alert(err.message || "Failed to post commentary");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8 border-b border-surface-hover pb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted hover:text-white bg-surface hover:bg-surface-hover rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-semibold tracking-tight">SportPulse Admin</span>
        </div>
      </header>

      <div className="bg-gradient-to-r from-surface to-background border border-surface-hover p-2 mb-4 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
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
          <h1 className="text-4xl font-bold tracking-tight">
            {match
              ? `${match.homeTeam} vs ${match.awayTeam}`
              : "Loading Match..."}
          </h1>
        </div>
        <div>
          <StatusIndicator status={status} />
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-4">
          <div className="bg-surface border border-surface-hover rounded-2xl p-6 sticky top-6 shadow-lg">
            <h2 className="font-semibold mb-6 text-lg flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Post Update
            </h2>
            <form onSubmit={handleAddCommentary} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Minute
                </label>
                <input
                  type="number"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full px-4 py-3 bg-background border border-surface-hover rounded-xl text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Commentary Text
                </label>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Goal! What a fantastic strike..."
                  rows={5}
                  className="w-full px-4 py-3 bg-background border border-surface-hover rounded-xl text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
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

        <div className="md:col-span-8">
          <h2 className="font-semibold mb-1 text-xl flex items-center gap-2">
            Live Feed
          </h2>
          <LiveFeed commentary={commentary} />
        </div>
      </div>
    </div>
  );
}
