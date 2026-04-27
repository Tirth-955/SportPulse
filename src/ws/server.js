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
        noServer: true,
        path: "/ws",
        maxPayload: 1024 * 1024,
        perMessageDeflate: false,
    });

    server.on('upgrade', async (req, socket, head) => {
        const { pathname } = new URL(req.url, `http://${req.headers.host}`);

        if (pathname !== '/ws') {
            socket.destroy();
            return;
        }

        if (wsArcjet) {
            try {
                const decision = await wsArcjet.protect(req);

                if (decision.conclusion === "ERROR") {
                    console.error("Arcjet WS error:", decision.reason);
                    socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');
                    socket.destroy();
                    return;
                }

                if (decision.isDenied()) {
                    const isRateLimit = decision.reason?.isRateLimit?.();

                    socket.write(
                        `HTTP/1.1 ${isRateLimit ? 429 : 403} ${isRateLimit ? 'Too Many Requests' : 'Forbidden'}\r\n\r\n`
                    );
                    socket.destroy();
                    return;
                }
            } catch (e) {
                // console.error('WS upgrade protection error', e);
                socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
                socket.destroy();
                return;
            }
        }

        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
        });
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