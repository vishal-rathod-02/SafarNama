import Redis from "ioredis";

let redisClient = null;

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });
    
    redisClient.on("connect", () => {
      console.log("✅ Redis connected globally");
    });
    
    redisClient.on("error", (err) => {
      console.warn("⚠️ Redis error, falling back to in-memory caching globally:", err.message);
      redisClient.disconnect();
      redisClient = null;
    });
  } catch (err) {
    console.warn("⚠️ Redis initialization failed, using in-memory cache:", err.message);
    redisClient = null;
  }
} else {
  console.warn("⚠️ No REDIS_URL set, using in-memory cache only");
}

export default redisClient;
