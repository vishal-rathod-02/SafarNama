import express from "express";
import axios from "axios";
import redisClient from "../../Config/redis.js";

const router = express.Router();

const memoryCache = new Map();

// --- Helper: Get from Cache ---
const getCachedImage = async (key) => {
  if (redisClient && redisClient.status === "ready") {
    try {
      const cached = await redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (err) {
      console.warn("⚠️ Redis image getCache error:", err.message);
    }
  }
  return memoryCache.get(key) || null;
};

// --- Helper: Save to Cache ---
const setCachedImage = async (key, data) => {
  if (redisClient && redisClient.status === "ready") {
    try {
      await redisClient.set(key, JSON.stringify(data), "EX", 3600 * 24); // 24h cache
      return;
    } catch (err) {
      console.warn("⚠️ Redis image setCache error:", err.message);
    }
  }
  memoryCache.set(key, data);
};

// --- Image Providers ---
const PROVIDERS = {
  pexels: async (query) => {
    const apiKey = process.env.REACT_APP_PEXELS_API_KEY;
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;
    const res = await axios.get(url, { headers: { Authorization: apiKey } });
    if (!res.data.photos?.length) throw new Error("No Pexels results");
    const photo = res.data.photos[0];
    return {
      provider: "Pexels",
      thumbnail: photo.src.medium,
      full: photo.src.large2x,
      photographer: photo.photographer,
    };
  },
  unsplash: async (query) => {
    // source.unsplash.com is deprecated. We fall back to loremflickr which is active and free.
    const url = `https://loremflickr.com/800/600/${encodeURIComponent(query)}`;
    return {
      provider: "Flickr (via LoremFlickr)",
      thumbnail: url,
      full: url,
      photographer: "Flickr Community",
    };
  },
  pixabay: async (query) => {
    const apiKey = process.env.PIXABAY_API_KEY;
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3`;
    const res = await axios.get(url);
    if (!res.data.hits?.length) throw new Error("No Pixabay results");
    const image = res.data.hits[0];
    return {
      provider: "Pixabay",
      thumbnail: image.previewURL,
      full: image.largeImageURL,
      photographer: image.user,
    };
  },
};

// --- Main Endpoint ---
router.get("/", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Query parameter is required" });

  try {
    // 1️⃣ Try Cache
    const cached = await getCachedImage(query.toLowerCase());
    if (cached) {
      console.log(`📸 Serving "${query}" from cache`);
      return res.json({ ...cached, cached: true });
    }

    console.log(`🌍 Fetching new images for "${query}"`);
    let imageData;

    // 2️⃣ Provider Priority: Pexels → Unsplash → Pixabay
    const providers = ["pexels", "unsplash", "pixabay"];
    for (const name of providers) {
      try {
        imageData = await PROVIDERS[name](query);
        if (imageData) {
          imageData.providerUsed = name;
          break;
        }
      } catch (err) {
        console.warn(`⚠️ ${name} provider failed:`, err.message);
      }
    }

    if (!imageData) throw new Error("All providers failed");

    // 3️⃣ Cache & Respond
    await setCachedImage(query.toLowerCase(), imageData);
    return res.json({ ...imageData, cached: false });
  } catch (err) {
    console.error(`❌ Failed to fetch image for "${req.query.query}":`, err.message);
    return res.status(500).json({ error: "Failed to fetch image", details: err.message });
  }
});

export default router;
