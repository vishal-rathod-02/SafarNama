import express from "express";
import axios from "axios";
import redisClient from "../../Config/redis.js";

const router = express.Router();

const memoryCache = new Map();

async function getCache(key) {
  if (redisClient && redisClient.status === "ready") {
    try {
      const cached = await redisClient.get(key);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      console.warn("⚠️ Redis getCache error, falling back to local memory:", err.message);
    }
  }
  if (memoryCache.has(key)) return memoryCache.get(key);
  return null;
}

async function setCache(key, value, ttl = 3600) {
  if (redisClient && redisClient.status === "ready") {
    try {
      await redisClient.set(key, JSON.stringify(value), "EX", ttl);
      return;
    } catch (err) {
      console.warn("⚠️ Redis setCache error:", err.message);
    }
  }
  if (memoryCache.size > 2000) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }
  memoryCache.set(key, value);
}

// ----------  Geoapify Constants ----------
const GEOAPIFY_BASE = "https://api.geoapify.com/v2/places";
const GEOAPIFY_KEY = process.env.GEOAPIFY_API_KEY;

// ----------  Routes ----------

// 🍴 Get Nearby Restaurants
router.get("/restaurants", async (req, res) => {
  const { lat, lon, radius = 3000 } = req.query;
  const numLat = parseFloat(lat);
  const numLon = parseFloat(lon);

  if (isNaN(numLat) || isNaN(numLon) || numLat < -90 || numLat > 90 || numLon < -180 || numLon > 180) {
    return res.status(400).json({ error: "Valid latitude (-90 to 90) and longitude (-180 to 180) are required" });
  }

  const boundedRadius = Math.min(Math.max(Number(radius) || 3000, 500), 50000);
  const cacheKey = `restaurants:${numLat.toFixed(4)}:${numLon.toFixed(4)}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json({ fromCache: true, results: cached });

  try {
    const url =
      `${GEOAPIFY_BASE}?categories=catering.restaurant` +
      `&filter=circle:${numLon},${numLat},${boundedRadius}` +
      `&bias=proximity:${numLon},${numLat}` +
      `&limit=10&apiKey=${GEOAPIFY_KEY}`;

    const { data } = await axios.get(url, { timeout: 5000 });

    const results = (data.features || []).map((f) => ({
      id: f.properties.place_id,
      name: f.properties.name || "Unnamed Restaurant",
      category: "Restaurant",
      address: f.properties.formatted,
      rating: (Math.random() * 2 + 3).toFixed(1),
      status: "Open",
      image: null,
      location: f.properties.formatted,
      lat: f.properties.lat,
      lon: f.properties.lon,
    }));

    await setCache(cacheKey, results);
    res.json({ fromCache: false, results });
  } catch (err) {
    console.warn("⚠️ Restaurants fetch failed:", err.message);
    res.json({ fromCache: false, results: [] }); 
  }
});

//  Get Nearby Hotels
router.get("/hotels", async (req, res) => {
  const { lat, lon, radius = 5000 } = req.query;
  const numLat = parseFloat(lat);
  const numLon = parseFloat(lon);

  if (isNaN(numLat) || isNaN(numLon) || numLat < -90 || numLat > 90 || numLon < -180 || numLon > 180) {
    return res.status(400).json({ error: "Valid latitude (-90 to 90) and longitude (-180 to 180) are required" });
  }

  const boundedRadius = Math.min(Math.max(Number(radius) || 5000, 500), 50000);
  const cacheKey = `hotels:${numLat.toFixed(4)}:${numLon.toFixed(4)}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json({ fromCache: true, results: cached });

  try {
    const url =
      `${GEOAPIFY_BASE}?categories=accommodation.hotel` +
      `&filter=circle:${numLon},${numLat},${boundedRadius}` +
      `&bias=proximity:${numLon},${numLat}` +
      `&limit=10&apiKey=${GEOAPIFY_KEY}`;

    const { data } = await axios.get(url, { timeout: 5000 });

    const results = (data.features || []).map((f) => ({
      id: f.properties.place_id,
      name: f.properties.name || "Unnamed Hotel",
      category: "Hotel",
      address: f.properties.formatted,
      rating: (Math.random() * 2 + 3).toFixed(1),
      status: "Available",
      image: null,
      location: f.properties.formatted,
      lat: f.properties.lat,
      lon: f.properties.lon,
    }));

    await setCache(cacheKey, results);
    res.json({ fromCache: false, results });
  } catch (err) {
    console.warn("⚠️ Hotels fetch failed:", err.message);
    res.json({ fromCache: false, results: [] });
  }
});


//  Search by term (e.g., "cafe", "dhaba")
router.get("/search", async (req, res) => {
  const { query, lat, lon, radius = 3000 } = req.query;
  const numLat = parseFloat(lat);
  const numLon = parseFloat(lon);

  if (!query || typeof query !== "string" || !query.trim() || isNaN(numLat) || isNaN(numLon) || numLat < -90 || numLat > 90 || numLon < -180 || numLon > 180) {
    return res.status(400).json({ error: "Query and valid latitude (-90 to 90) and longitude (-180 to 180) are required" });
  }

  const cleanQuery = query.trim().slice(0, 60).replace(/[^a-zA-Z0-9_\- ]/g, "");
  const boundedRadius = Math.min(Math.max(Number(radius) || 3000, 500), 50000);

  try {
    const url =
      `${GEOAPIFY_BASE}?categories=catering.${cleanQuery.toLowerCase()}` +
      `&filter=circle:${numLon},${numLat},${boundedRadius}` +
      `&bias=proximity:${numLon},${numLat}` +
      `&limit=10&apiKey=${GEOAPIFY_KEY}`;

    const { data } = await axios.get(url, { timeout: 5000 });

    const results = (data.features || []).map((f) => ({
      id: f.properties.place_id,
      name: f.properties.name || cleanQuery,
      category: cleanQuery,
      address: f.properties.formatted,
      rating: (Math.random() * 2 + 3).toFixed(1),
      image: null,
      location: f.properties.formatted,
      lat: f.properties.lat,
      lon: f.properties.lon,
    }));

    res.json({ results });
  } catch (err) {
    console.warn("⚠️ Search fetch failed:", err.message);
    res.json({ results: [] }); 
  }
});

export default router;
