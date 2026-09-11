/**
 * In-memory sliding-window rate limiter middleware for sensitive endpoints
 */
export const createRateLimiter = ({
  windowMs = 60 * 1000,
  max = 10,
  message = "Too many requests, please try again later.",
  keyGenerator,
} = {}) => {
  const requests = new Map();

  // Periodic garbage collection every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requests.entries()) {
      if (now - record.startTime > windowMs) {
        requests.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  return (req, res, next) => {
    const defaultKey = (req.user?.id || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || req.ip || "unknown").toString();
    const key = keyGenerator ? keyGenerator(req) : defaultKey;
    const now = Date.now();

    const record = requests.get(key);

    if (!record || now - record.startTime > windowMs) {
      requests.set(key, { count: 1, startTime: now });
      return next();
    }

    if (record.count >= max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((record.startTime + windowMs - now) / 1000),
      });
    }

    record.count += 1;
    next();
  };
};

// 🔒 Pre-configured limiters for sensitive application routes:

// 1. Auth Limiter: Max 10 attempts per 15 minutes per IP (Brute-force protection for login/signup)
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts. Please try again in 15 minutes.",
});

// 2. Email Action Limiter: Max 5 dispatches per 15 minutes per IP (Spam / quota protection for reset/verify)
export const emailActionRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many email requests sent. Please check your inbox or wait 15 minutes.",
});

// 3. Trip Generation Limiter: Max 8 AI route requests per minute per user/IP
export const tripGenRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 8,
  message: "Trip generation rate limit reached. Please wait a minute before requesting another route.",
});

