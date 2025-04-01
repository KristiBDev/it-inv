import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1, // Limit each IP to 1 request per windowMs for POST/DELETE
  message: 'Too many requests from this IP, please try again later.',
});

const getLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1, // Allow up to 100 GET requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

export { apiLimiter, getLimiter };
