import { ConnectionStatus } from "../types";
import { Activity, Wifi, WifiOff, Loader2, AlertCircle } from "lucide-react";

export function StatusIndicator({ status }: { status: ConnectionStatus }) {
  if (status === "connected") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.1)]">
        <Wifi className="w-4 h-4" />
        <span className="text-sm font-semibold tracking-wide">
          Live Connection
        </span>
      </div>
    );
  }

  if (status === "connecting" || status === "reconnecting") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm font-semibold tracking-wide">
          Connecting...
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-semibold tracking-wide">Disconnected</span>
    </div>
  );
}
