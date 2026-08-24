import express from "express";
import axios from "axios";
import rateLimit from "express-rate-limit";
import redisClient from "../../Config/redis.js";

const router = express.Router();

// --- 1. Hybrid Cache (Redis + Local Memory fallback) ---
const memoryCache = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours (Location data is highly static)

async function getCache(key) {
  if (redisClient && redisClient.status === "ready") {
    try {
      const cached = await redisClient.get(key);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      console.warn("⚠️ Redis getCache error in Location service:", err.message);
    }
  }
  const local = memoryCache.get(key);
  if (local && Date.now() - local.timestamp < CACHE_TTL) {
    return local.data;
  }
  return null;
}

async function setCache(key, data) {
  if (redisClient && redisClient.status === "ready") {
    try {
      await redisClient.set(key, JSON.stringify(data), "EX", 3600 * 24); // Store for 24h
      return;
    } catch (err) {
      console.warn("⚠️ Redis setCache error in Location service:", err.message);
    }
  }
  memoryCache.set(key, { data, timestamp: Date.now() });
}

// --- 2. Rate Limiter ---
const limiter = rateLimit({
  windowMs: 10 * 1000,
  max: 150,
  message: { error: "Too many requests, please wait a moment." },
});
router.use(limiter);

// --- 3. Autocomplete Endpoint ---
router.get("/autocomplete", async (req, res) => {
  const { input } = req.query;
  if (!input) return res.status(400).json({ error: "Input query is required" });

  const cacheKey = `autocomplete:${input.toLowerCase()}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    let results = [];
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: input,
          format: "json",
          countrycodes: "in",
          limit: 8,
          addressdetails: 1,
        },
        headers: {
          "User-Agent": `SafarNama/1.0 (contact-${Math.floor(Math.random() * 10000)}@safarnama.in)`,
        },
        timeout: 4000,
      });

      results = (response.data || [])
        .map((r) => {
          const { address } = r;
          const area =
            address.suburb ||
            address.neighbourhood ||
            address.village ||
            address.town ||
            address.city ||
            address.hamlet ||
            address.county;
          const state = address.state || "";

          const short_name = [area, state].filter(Boolean).join(", ");
          const full_name = r.display_name
            .replace(", India", "")
            .replace(", Asia", "")
            .replace(/,\s*$/, "")
            .trim();

          return {
            place_id: r.place_id,
            short_name: short_name || r.display_name.split(",").slice(0, 2).join(", "),
            full_name,
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            type: r.type,
          };
        })
        .filter(
          (r) =>
            r.short_name &&
            r.full_name &&
            !r.full_name.toLowerCase().includes("india") &&
            !r.short_name.match(/^\d/)
        )
        .slice(0, 8);
    } catch (nominatimError) {
      console.warn("⚠️ Nominatim autocomplete failed, falling back to Geoapify:", nominatimError.message);
      
      const geoapifyUrl = `https://api.geoapify.com/v1/geocode/autocomplete`;
      const response = await axios.get(geoapifyUrl, {
        params: {
          text: input,
          filter: "countrycode:in",
          limit: 8,
          apiKey: process.env.GEOAPIFY_API_KEY
        },
        timeout: 4000
      });
      
      results = (response.data.features || []).map((f) => {
        const p = f.properties;
        const short_name = p.city || p.name || p.formatted.split(",")[0];
        return {
          place_id: p.place_id || `${p.lat}-${p.lon}`,
          short_name: `${short_name}, ${p.state || ""}`.trim().replace(/,\s*$/, ""),
          full_name: p.formatted.replace(", India", "").trim(),
          lat: parseFloat(p.lat),
          lon: parseFloat(p.lon),
          type: p.result_type || "city",
        };
      });
    }

    await setCache(cacheKey, results);
    res.json(results);
  } catch (error) {
    console.error("❌ Autocomplete error:", error.message);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

// --- 4. Geocoding Endpoint ---
router.get("/geocode", async (req, res) => {
  const { locationName } = req.query;
  if (!locationName)
    return res.status(400).json({ error: "locationName query is required" });

  const cacheKey = `geocode:${locationName.toLowerCase()}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    let data = null;
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: locationName,
          format: "json",
          limit: 1,
          countrycodes: "in",
        },
        headers: {
          "User-Agent": `SafarNama/1.0 (contact-${Math.floor(Math.random() * 10000)}@safarnama.in)`,
        },
        timeout: 4000,
      });

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        data = [parseFloat(lat), parseFloat(lon)];
      }
    } catch (nominatimError) {
      console.warn("⚠️ Nominatim geocoding failed, falling back to Geoapify:", nominatimError.message);
      
      const geoapifyUrl = `https://api.geoapify.com/v1/geocode/search`;
      const response = await axios.get(geoapifyUrl, {
        params: {
          text: locationName,
          filter: "countrycode:in",
          limit: 1,
          apiKey: process.env.GEOAPIFY_API_KEY
        },
        timeout: 4000
      });
      
      if (response.data.features && response.data.features.length > 0) {
        const { lat, lon } = response.data.features[0].properties;
        data = [parseFloat(lat), parseFloat(lon)];
      }
    }

    await setCache(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error(`❌ Geocoding failed for ${locationName}:`, error.message);
    res.status(500).json({ error: "Failed to geocode location" });
  }
});

// Cache cleanup interval for local memory cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) memoryCache.delete(key);
  }
}, 1000 * 60 * 60); // Clean up memory every hour

export default router;
