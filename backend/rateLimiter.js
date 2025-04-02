import rateLimit from 'express-rate-limit';

// Rate limiter for GET requests - less restrictive
export const getLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: { message: "Too many read requests. Please try again after a minute." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for POST, PUT, DELETE requests - more restrictive
export const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    message: { message: "Item operation rate limit exceeded. Please try again after 5 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Special rate limiter for high-traffic routes like logs
export const highTrafficLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: { message: "Too many log requests. Please try again after a minute." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limiter specifically for note creation
export const noteCreationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // limit each IP to 5 note creations per 5 minutes
    message: { message: "Note creation limit reached. Please try again after 5 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limiter for note deletion
export const noteDeletionLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // limit each IP to 5 note deletions per 5 minutes
    message: { message: "Note deletion limit reached. Please try again after 5 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});
