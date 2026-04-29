import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { matchIdParamSchema } from "../validation/matches.js";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/commentary.js";
import { db } from "../db/db.js";
import { commentary } from "../db/schema.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { protect } from "../middleware/auth.js";

const MAX_LIMIT = 100;

export const commentaryRouter = Router({ mergeParams: true });

commentaryRouter.get("/", catchAsync(async (req, res, next) => {
    const paramsResult = matchIdParamSchema.safeParse(req.params);

    if (!paramsResult.success) {
        return next(new AppError("Invalid match ID.", 400, paramsResult.error.issues));
    }

    const queryResult = listCommentaryQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
        return next(new AppError("Invalid query parameters.", 400, queryResult.error.issues));
    }

    const { id: matchId } = paramsResult.data;
    const { limit = 10 } = queryResult.data;

    const safeLimit = Math.min(limit, MAX_LIMIT);

    const results = await db
        .select()
        .from(commentary)
        .where(eq(commentary.matchId, matchId))
        .orderBy(desc(commentary.createdAt))
        .limit(safeLimit);

    res.status(200).json({ data: results });
}));

commentaryRouter.post("/", protect, catchAsync(async (req, res, next) => {
    const paramsResult = matchIdParamSchema.safeParse(req.params);

    if (!paramsResult.success) {
        return next(new AppError("Invalid match ID.", 400, paramsResult.error.issues));
    }

    const bodyResult = createCommentarySchema.safeParse(req.body);

    if (!bodyResult.success) {
        return next(new AppError("Invalid commentary payload.", 400, bodyResult.error.issues));
    }

    const { minute, ...rest } = bodyResult.data;
    const [result] = await db.insert(commentary).values({
        matchId: paramsResult.data.id,
        minute,
        ...rest
    }).returning();

    if (res.app.locals.broadcastCommentary) {
        res.app.locals.broadcastCommentary(result.matchId, result);
    }

    res.status(201).json({ data: result });
}));