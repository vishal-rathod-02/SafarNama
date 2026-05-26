import express from "express";
import axios from "axios";

const router = express.Router();

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// ----------  Constants ----------
const GEODB_BASE_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// ---------- Routes ----------

//  Get popular destinations (default India)
router.get("/popular", async (req, res) => {
  const { countryCode = "IN", limit = 10 } = req.query;

  try {
    const response = await axios.get(`${GEODB_BASE_URL}/cities`, {
      params: {
        countryIds: countryCode,
        sort: "-population",
        limit,
      },
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      },
    });

    const places = response.data.data.map((city) => ({
      id: city.id,
      name: city.name,
      country: city.country,
      region: city.region,
      latitude: city.latitude,
      longitude: city.longitude,
      population: city.population,
      description: `${city.name} is a popular destination in ${city.region}, ${city.country}.`,
      category: "City",
      rating: 4 + Math.random(), 
      reviews: Math.floor(Math.random() * 1000),
      location: `${city.region}, ${city.country}`,
      status: "Open for visitors",
    }));

    res.json({ success: true, count: places.length, places });
  } catch (err) {
    console.error("❌ Failed to fetch popular places:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch popular places" });
  }
});

//  Search places by keyword
router.get("/search", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Query parameter is required" });

  try {
    const response = await axios.get(`${GEODB_BASE_URL}/cities`, {
      params: { namePrefix: query, limit: 10 },
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      },
    });

    const places = response.data.data.map((city) => ({
      id: city.id,
      name: city.name,
      country: city.country,
      region: city.region,
      latitude: city.latitude,
      longitude: city.longitude,
      category: "City",
      description: `${city.name} is a destination in ${city.region}, ${city.country}.`,
      rating: 3.5 + Math.random() * 1.5,
      reviews: Math.floor(Math.random() * 500),
      location: `${city.region}, ${city.country}`,
      status: "Active",
    }));

    res.json({ success: true, count: places.length, places });
  } catch (err) {
    console.error("❌ Search API error:", err.message);
    res.status(500).json({ success: false, error: "Search failed" });
  }
});

//  Nearby places using coordinates
router.get("/nearby", async (req, res) => {
  const { lat, lon, radius = 50 } = req.query;
  if (!lat || !lon)
    return res.status(400).json({ error: "Latitude and longitude required" });

  try {
    const response = await axios.get(`${GEODB_BASE_URL}/cities`, {
      params: { location: `${lat}${lon}`, radius, limit: 10 },
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      },
    });

    const places = response.data.data.map((city) => ({
      id: city.id,
      name: city.name,
      country: city.country,
      region: city.region,
      latitude: city.latitude,
      longitude: city.longitude,
      category: "Nearby City",
      description: `${city.name} is located near your current location.`,
      rating: 3.8 + Math.random() * 1.2,
      reviews: Math.floor(Math.random() * 800),
      location: `${city.region}, ${city.country}`,
      status: "Nearby",
    }));

    res.json({ success: true, count: places.length, places });
  } catch (err) {
    console.error("❌ Nearby fetch error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch nearby places" });
  }
});

export default router;
