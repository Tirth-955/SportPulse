import { z } from "zod";

export const MATCH_STATUS = {
    SCHEDULED: "scheduled",
    LIVE: "live",
    FINISHED: "finished",
};

// Query - list matches
export const listMatchesQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional(),
});

// Params - match ID
export const matchIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

const isValidISODate = (value) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
};

// Create match
export const createMatchSchema = z
    .object({
        sport: z.string().min(1, "Sport is required"),
        homeTeam: z.string().min(1, "Home team is required"),
        awayTeam: z.string().min(1, "Away team is required"),

        startTime: z
            .string()
            .refine(isValidISODate, { message: "Invalid ISO date string" }),

        endTime: z
            .string()
            .refine(isValidISODate, { message: "Invalid ISO date string" }),

        homeScore: z.coerce.number().int().min(0).optional(),
        awayScore: z.coerce.number().int().min(0).optional(),
    })
    .superRefine((data, ctx) => {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);

        if (end <= start) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "endTime must be after startTime",
                path: ["endTime"],
            });
        }
    });

// Update score
export const updateScoreSchema = z.object({
    homeScore: z.coerce.number().int().min(0),
    awayScore: z.coerce.number().int().min(0),
});