export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error for debugging
    console.error('ERROR', err);

    res.status(err.statusCode).json({
        status: err.status,
        error: err.message || "Internal Server Error",
        ...(err.details && { details: err.details }),
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};
