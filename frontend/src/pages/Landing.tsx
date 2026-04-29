import { useNavigate } from "react-router-dom";
import { Activity, ShieldCheck, PlayCircle } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      <div className="max-w-4xl w-full z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-surface border border-surface-hover rounded-3xl mb-6 shadow-2xl">
            <Activity className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black ">
            Welcome to SportPulse
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            The ultimate real-time sports dashboard. Choose your experience
            below to get started.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Admin Option */}
          <button
            onClick={() => navigate("/login")}
            className="group relative flex flex-col items-center text-center p-10 bg-surface border-2 border-surface-hover rounded-4xl"
          >
            <div className="w-20 h-20 rounded-2xl bg-background flex items-center justify-center mb-6 border border-surface-hover group-hover:scale-110 group-hover:border-primary/30 transition-all">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
              Login (Admin)
            </h2>
            <p className="text-text-muted">
              Access the secure dashboard to create matches, post live
              commentary, and manage scoreboards.
            </p>
          </button>

          {/* Public Option */}
          <button
            onClick={() => {
              localStorage.removeItem("token"); // Ensure pure public view
              navigate("/dashboard");
            }}
            className="group relative flex flex-col items-center text-center p-10 bg-surface border-2 border-surface-hover rounded-4xl"
          >
            <div className="w-20 h-20 rounded-2xl bg-background flex items-center justify-center mb-6 border border-surface-hover group-hover:scale-110 group-hover:border-purple-500/30 transition-all">
              <PlayCircle className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3 group-hover:text-purple-400 transition-colors">
              Just Watch (Public)
            </h2>
            <p className="text-text-muted">
              Enter as a viewer to check live scores and watch real-time match
              commentary as it happens.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
