import express from "express";
import http from "http";

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import { matchRouter } from "./routes/matches.js";
import { attachWebSocketServer } from "./ws/server.js";
import { securityMiddleware } from "./arcjet.js";
import { commentaryRouter } from "./routes/commentary.js";
import { authRouter } from "./routes/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { AppError } from "./utils/AppError.js";

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello From SERVER");
});

app.use(securityMiddleware());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/matches", matchRouter);
app.use("/api/v1/matches/:id/commentary", commentaryRouter);

// Catch unhandled routes
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(errorHandler);

const { broadcastMatchCreated, broadcastCommentary } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;

server.listen(PORT, HOST, () => {
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

    console.log(`Server is running on ${baseUrl}`);
    console.log(`WebSocket Server is running on ${baseUrl.replace('http', 'ws')}/ws`);
});