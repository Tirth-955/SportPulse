import { useState, useEffect, useCallback, useRef } from "react";
import { Commentary, ConnectionStatus } from "../types";

export function useWebSocket(matchId?: string) {
  const [commentary, setCommentary] = useState<Commentary[]>([]);
  const [liveScore, setLiveScore] = useState<{ homeScore: number; awayScore: number } | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setStatus("connected");
      // Explicitly subscribe to this match ID!
      if (matchId) {
        ws.current?.send(
          JSON.stringify({ type: "subscribe", matchId: parseInt(matchId) })
        );
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (String(data.data?.matchId || matchId) === matchId) {
          if (data.type === "commentary") {
            setCommentary((prev) => [data.data, ...prev]);
          } else if (data.type === "score_update") {
            setLiveScore({
              homeScore: data.data.homeScore,
              awayScore: data.data.awayScore,
            });
          }
        }
      } catch (err) {
        console.error("WS parsing error", err);
      }
    };

    ws.current.onclose = () => {
      setStatus("disconnected");
      // Attempt auto-reconnect after 3s
      setTimeout(connect, 3000);
    };

    ws.current.onerror = () => {
      setStatus("error");
    };
  }, [matchId]);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        if (matchId) {
          // Clean up by unsubscribing
          ws.current.send(
            JSON.stringify({ type: "unsubscribe", matchId: parseInt(matchId) })
          );
        }
        ws.current.close();
      }
    };
  }, [connect, matchId]);

  return { commentary, status, liveScore, setCommentary };
}
