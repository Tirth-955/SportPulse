import { Router } from "express";

import {
    createMatchSchema,
    listMatchesQuerySchema,
    matchIdParamSchema
} from "../validation/matches.js";
import { matches } from "../db/schema.js";
import { db } from "../db/db.js"
import { getMatchStatus } from "../utils/matchStatus.js";
import { desc, eq } from "drizzle-orm";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { protect } from "../middleware/auth.js";

export const matchRouter = Router();

const MAX_LIMIT = 100;

matchRouter.get("/", catchAsync(async (req, res, next) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query);

    if (!parsed.success) {
        return next(new AppError("Invalid Query.", 400, parsed.error.issues));
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

    const data = await db
        .select()
        .from(matches)
        .orderBy((desc(matches.createdAt)))
        .limit(limit);

    res.json({ data });
}));

matchRouter.get("/:id", catchAsync(async (req, res, next) => {
    const parsed = matchIdParamSchema.safeParse(req.params);

    if (!parsed.success) {
        return next(new AppError("Invalid Match ID.", 400, parsed.error.issues));
    }

    const [match] = await db
        .select()
        .from(matches)
        .where(eq(matches.id, parsed.data.id))
        .limit(1);

    if (!match) {
        return next(new AppError("Match not found.", 404));
    }

    res.json({ data: match });
}));

matchRouter.post("/", protect, catchAsync(async (req, res, next) => {
    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
        return next(new AppError("Invalid Payload.", 400, parsed.error.issues));
    }

    const { data: { startTime, endTime, homeScore, awayScore } } = parsed;

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
}));

matchRouter.patch("/:id/score", protect, catchAsync(async (req, res, next) => {
    const paramsResult = matchIdParamSchema.safeParse(req.params);
    if (!paramsResult.success) {
        return next(new AppError("Invalid Match ID.", 400, paramsResult.error.issues));
    }

    const { updateScoreSchema } = await import("../validation/matches.js");

    const bodyResult = updateScoreSchema.safeParse(req.body);
    if (!bodyResult.success) {
        return next(new AppError("Invalid Score Payload.", 400, bodyResult.error.issues));
    }

    const { id: matchId } = paramsResult.data;
    const { homeScore, awayScore } = bodyResult.data;

    const [updatedMatch] = await db.update(matches)
        .set({ homeScore, awayScore })
        .where(eq(matches.id, matchId))
        .returning();

    if (!updatedMatch) {
        return next(new AppError("Match not found.", 404));
    }

    if (res.app.locals.broadcastScoreUpdate) {
        res.app.locals.broadcastScoreUpdate(matchId, { homeScore, awayScore });
    }

    res.json({ data: updatedMatch });
}));