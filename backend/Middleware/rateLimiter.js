/**
 * Simple in-memory rate limiter middleware for sensitive endpoints (e.g. AI Trip Generation, Auth)
 */
export const createRateLimiter = ({ windowMs = 60 * 1000, max = 10, message = "Too many requests, please try again later." } = {}) => {
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
    const key = (req.user?.id || req.ip || "unknown").toString();
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
