import express from "express";
import axios from "axios";
import rateLimit from "express-rate-limit";

const router = express.Router();

// --- 1. Simple In-Memory Cache ---
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

// --- 2. Rate Limiter ---
const limiter = rateLimit({
  windowMs: 10 * 1000,
  max: 40,
  message: { error: "Too many requests, please wait a moment." },
});
router.use(limiter);

// --- 3. Autocomplete Endpoint ---
router.get("/autocomplete", async (req, res) => {
  const { input } = req.query;
  if (!input) return res.status(400).json({ error: "Input query is required" });

  const cacheKey = `autocomplete:${input.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

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
        "User-Agent": "SafarNama/1.0 (contact@safarnama.in)",
      },
    });

    const results = (response.data || [])
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

    cache.set(cacheKey, { data: results, timestamp: Date.now() });
    res.json(results);
  } catch (error) {
    console.error("❌ Nominatim error:", error.message);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

// --- 4. Geocoding Endpoint ---
router.get("/geocode", async (req, res) => {
  const { locationName } = req.query;
  if (!locationName)
    return res.status(400).json({ error: "locationName query is required" });

  const cacheKey = `geocode:${locationName.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: locationName,
        format: "json",
        limit: 1,
        countrycodes: "in",
      },
      headers: {
        "User-Agent": "SafarNama/1.0 (contact@safarnama.in)",
      },
    });

    let data = null;
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      data = [parseFloat(lat), parseFloat(lon)];
    }

    cache.set(cacheKey, { data, timestamp: Date.now() });
    res.json(data);
  } catch (error) {
    console.error(`❌ Geocoding failed for ${locationName}:`, error.message);
    res.status(500).json({ error: "Failed to geocode location" });
  }
});

// --- 5. Cache Cleanup Every 30 Minutes ---
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) cache.delete(key);
  }
}, 1000 * 60 * 30);

export default router;
