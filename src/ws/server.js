import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet.js";

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) {
        return;
    };

    socket.send(JSON.stringify(payload));
};

function broadcastToAll(wss, payload) {
    console.log(`Broadcasting to ${wss.clients.size} clients`);
    try {
        for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(JSON.stringify(payload));
                } catch (sendError) {
                    console.error("Error sending to client:", sendError);
                }
            }
        }
    } catch (broadcastError) {
        console.error("Broadcast failed:", broadcastError);
        throw broadcastError; // Re-throw to be caught by the route handler
    }
}

export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({
        server,
        path: "/ws",
        maxPayload: 1024 * 1024,
    });

    wss.on("connection", async (socket, req) => {
        if (wsArcjet) {
            try {
                const decision = await wsArcjet.protect(req);

                if (decision.conclusion === "ERROR") {
                    console.error("Arcjet WS error:", decision.reason);
                    socket.close(1011, "Internal error");
                    return;
                }

                if (decision.isDenied()) {
                    const isRateLimit = decision.reason?.isRateLimit?.();

                    socket.close(
                        1008,
                        isRateLimit ? "Rate limit exceeded" : "Forbidden"
                    );
                    return;
                }
            } catch (e) {
                console.error("WS protection error", e);
                socket.close(1011, "Internal error");
                return;
            }
        }

        socket.isAlive = true;

        socket.on("pong", () => {
            socket.isAlive = true;
        });

        sendJson(socket, { type: "welcome" });

        socket.on("error", console.error);
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on("close", () => clearInterval(interval));

    function broadcastMatchCreated(match) {
        broadcastToAll(wss, { type: "match_created", data: match });
    };

    return { broadcastMatchCreated };
};