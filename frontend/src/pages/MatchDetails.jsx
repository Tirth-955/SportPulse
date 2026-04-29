import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Clock, Activity } from 'lucide-react';

export default function MatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commentary, setCommentary] = useState([]);
  const [newText, setNewText] = useState('');
  const [minute, setMinute] = useState('');

  // Example match data
  const match = { title: 'Manchester City vs Arsenal', status: 'LIVE' };

  const handleAddCommentary = (e) => {
    e.preventDefault();
    if (!newText || !minute) return;

    // Simulate sending to backend API (Port 8000)
    const newEntry = { id: Date.now(), text: newText, minute: parseInt(minute), timestamp: new Date().toISOString() };
    setCommentary([newEntry, ...commentary]);
    setNewText('');
    setMinute('');
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8 border-b border-surface-hover pb-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted hover:text-white bg-surface hover:bg-surface-hover rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-semibold tracking-tight">SportPulse Admin</span>
        </div>
      </header>

      <div className="bg-gradient-to-r from-surface to-background border border-surface-hover rounded-2xl p-8 mb-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            {match.status}
          </span>
          <span className="text-sm font-medium text-text-muted">Match ID: {id}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">{match.title}</h1>
        <p className="text-primary text-sm font-medium mt-2">API Connection: WebSocket = ws://localhost:8000 ready</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-4">
          <div className="bg-surface border border-surface-hover rounded-2xl p-6 sticky top-6 shadow-lg">
            <h2 className="font-semibold mb-6 text-lg flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Post Update
            </h2>
            <form onSubmit={handleAddCommentary} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Minute</label>
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
                <label className="block text-sm font-medium text-text-muted mb-2">Commentary Text</label>
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
          <h2 className="font-semibold mb-6 text-xl flex items-center gap-2">
             Live Feed
          </h2>
          {commentary.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center bg-surface/30 border border-surface-hover rounded-3xl border-dashed">
              <div className="p-4 bg-background rounded-full mb-4 shadow-inner">
                <Clock className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-medium mb-1">Awaiting updates</h3>
              <p className="text-text-muted max-w-sm text-sm">Post the first event to begin the live commentary broadcast for this match.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commentary.map((c) => (
                <div key={c.id} className="group flex gap-5 p-5 bg-surface border border-surface-hover hover:border-primary/30 rounded-2xl shadow-sm transition-all hover:shadow-md">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-background flex items-center justify-center font-bold text-lg text-primary border border-surface-hover group-hover:border-primary/50 group-hover:scale-110 transition-all shadow-inner">
                    {c.minute}'
                  </div>
                  <div className="pt-1">
                    <p className="text-text leading-relaxed text-[15px]">{c.text}</p>
                    <p className="text-xs text-text-muted mt-3 font-medium flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Just now via Admin Dashboard
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
