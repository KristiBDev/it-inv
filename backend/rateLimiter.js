import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 request per windowMs for POST/DELETE
  message: 'Too many requests from this IP, please try again later.',
});

const getLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Allow up to 100 GET requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

export { apiLimiter, getLimiter };
