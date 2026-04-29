import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { authSchema } from "../validation/auth.js";

export const authRouter = Router();

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "90d",
    });
};

authRouter.post("/register", catchAsync(async (req, res, next) => {
    const parsed = authSchema.safeParse(req.body);

    if (!parsed.success) {
        return next(new AppError("Invalid credentials format.", 400, parsed.error.issues));
    }

    const { username, password } = parsed.data;

    // Check if user already exists
    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

    if (existingUser.length > 0) {
        return next(new AppError("Username already exists", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [newUser] = await db.insert(users)
        .values({
            username,
            password: hashedPassword,
        }).returning({
            id: users.id,
            username: users.username,
            createdAt: users.createdAt
        });

    const token = signToken(newUser.id);

    res.status(201).json({
        status: "success",
        token,
        data: {
            user: newUser,
        },
    });
}));

authRouter.post("/login", catchAsync(async (req, res, next) => {
    const parsed = authSchema.safeParse(req.body);

    if (!parsed.success) {
        return next(new AppError("Invalid credentials format.", 400, parsed.error.issues));
    }

    const { username, password } = parsed.data;

    // Check if user exists
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new AppError("Incorrect username or password", 401));
    }

    const token = signToken(user.id);

    res.status(200).json({
        status: "success",
        token,
        data: {
            user: {
                id: user.id,
                username: user.username,
            },
        },
    });
}));
