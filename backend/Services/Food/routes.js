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
  memoryCache.set(key, value);
}

// ----------  Geoapify Constants ----------
const GEOAPIFY_BASE = "https://api.geoapify.com/v2/places";
const GEOAPIFY_KEY = process.env.GEOAPIFY_API_KEY;

// ----------  Routes ----------

// 🍴 Get Nearby Restaurants
router.get("/restaurants", async (req, res) => {
  const { lat, lon, radius = 3000 } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude required" });
  }

  const cacheKey = `restaurants:${lat}:${lon}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json({ fromCache: true, results: cached });

  try {
    const url =
      `${GEOAPIFY_BASE}?categories=catering.restaurant` +
      `&lat=${lat}&lon=${lon}&radius=${radius}` +
      `&limit=10&bias=countrycode:in&apiKey=${GEOAPIFY_KEY}`;

    const { data } = await axios.get(url);

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
  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude required" });
  }

  const cacheKey = `hotels:${lat}:${lon}`;
  const cached = await getCache(cacheKey);
  if (cached) return res.json({ fromCache: true, results: cached });

  try {
    const url =
      `${GEOAPIFY_BASE}?categories=accommodation.hotel` +
      `&lat=${lat}&lon=${lon}&radius=${radius}` +
      `&limit=10&bias=countrycode:in&apiKey=${GEOAPIFY_KEY}`;

    const { data } = await axios.get(url);

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
  if (!query || !lat || !lon) {
    return res.status(400).json({ error: "Query, latitude, longitude required" });
  }

  try {
    const url =
      `${GEOAPIFY_BASE}?categories=catering.${query.toLowerCase()}` +
      `&lat=${lat}&lon=${lon}&radius=${radius}` +
      `&limit=10&bias=countrycode:in&apiKey=${GEOAPIFY_KEY}`;

    const { data } = await axios.get(url);

    const results = (data.features || []).map((f) => ({
      id: f.properties.place_id,
      name: f.properties.name || query,
      category: query,
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
