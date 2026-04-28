import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new AppError("You are not logged in! Please log in to get access.", 401));
    }

    // 2) Verification token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || "default_super_secret_jwt_key_that_is_long_enough");
    } catch (err) {
        return next(new AppError("Invalid or expired token. Please log in again.", 401));
    }

    // 3) Check if user still exists
    const [currentUser] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
    if (!currentUser) {
        return next(new AppError("The user belonging to this token no longer exists.", 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});
