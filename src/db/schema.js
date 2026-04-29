import {
    pgTable,
    serial,
    text,
    integer,
    timestamp,
    pgEnum,
    jsonb,
} from "drizzle-orm/pg-core";

export const matchStatusEnum = pgEnum("match_status", [
    "scheduled",
    "live",
    "finished",
]);

// MATCHES TABLE
export const matches = pgTable("matches", {
    id: serial("id").primaryKey(),

    sport: text("sport", { length: 50 }).notNull(),

    homeTeam: text("home_team", { length: 100 }).notNull(),
    awayTeam: text("away_team", { length: 100 }).notNull(),

    status: matchStatusEnum("status").notNull().default("scheduled"),

    startTime: timestamp("start_time", { withTimezone: true }),
    endTime: timestamp("end_time", { withTimezone: true }),

    homeScore: integer("home_score").notNull().default(0),
    awayScore: integer("away_score").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

// COMMENTARY TABLE
export const commentary = pgTable("commentary", {
    id: serial("id").primaryKey(),

    matchId: integer("match_id")
        .notNull()
        .references(() => matches.id, { onDelete: "cascade" }),

    minute: integer("minute"),
    sequence: integer("sequence"), // ordering within same minute

    period: text("period", { length: 50 }), // example "1H", "2H", "ET"
    eventType: text("event_type", { length: 50 }), // goal, foul, etc.

    actor: text("actor", { length: 100 }), // player name
    team: text("team", { length: 100 }), // team name

    message: text("message").notNull(), // commentary text

    metadata: jsonb("metadata"), // flexible structured data
    tags: text("tags").array(), // array of tags (example ["goal", "highlight"])

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

// USERS TABLE
export const users = pgTable("users", {
    id: serial("id").primaryKey(),

    username: text("username", { length: 50 }).notNull().unique(),

    password: text("password").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
