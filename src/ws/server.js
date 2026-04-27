import { WebSocket, WebSocketServer } from "ws";

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

    wss.on("connection", (socket) => {
        sendJson(socket, { type: "welcome" });

        socket.on("error", console.error);
    });

    function broadcastMatchCreated(match) {
        broadcastToAll(wss, { type: 'match_created', data: match });
    };

    return { broadcastMatchCreated };
};