import { Router } from "express";

import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches.js";
import { matches } from "../db/schema.js";
import { db } from "../db/db.js"
import { getMatchStatus } from "../utils/matchStatus.js";
import { desc } from "drizzle-orm";

export const matchRouter = Router();

const MAX_LIMIT = 100;

matchRouter.get("/", async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid Query.",
            details: parsed.error.issues,
        });
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

    try {
        const data = await db
            .select()
            .from(matches)
            .orderBy((desc(matches.createdAt)))
            .limit(limit)

        res.json({ data });
    } catch (e) {
        res.status(500).json({
            error: "Failed to list matches",
            details: JSON.stringify(e),
        });
    }
});

matchRouter.post("/", async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid Payload.",
            details: parsed.error.issues,
        });
    }

    const { data: { startTime, endTime, homeScore, awayScore } } = parsed;

    try {
        const [event] = await db.insert(matches).values({
            sport: parsed.data.sport,
            homeTeam: parsed.data.homeTeam,
            awayTeam: parsed.data.awayTeam,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(startTime, endTime),
        }).returning();

        try {
            if (res.app.locals.broadcastMatchCreated) {
                res.app.locals.broadcastMatchCreated(event);
            }
        } catch (broadcastError) {
            console.error("Failed to broadcast match creation:", broadcastError);
            // We don't fail the request if broadcasting fails
        }

        res.status(201).json({ data: event });
    } catch (e) {
        console.error("Match Creation Error Full Object:", e);
        res.status(500).json({
            error: "Failed to create match",
            details: e.message || String(e),
            pgError: e.detail || e.hint || e.code // Capture Postgres-specific details if available
        });
    }
});