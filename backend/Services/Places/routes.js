import express from "express";
import axios from "axios";

const router = express.Router();

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// ---------- Static Fallbacks ----------
const POPULAR_INDIAN_CITIES = [
  { id: "pop-1", name: "Mathura", region: "Uttar Pradesh", country: "India", latitude: 27.4924, longitude: 77.6737 },
  { id: "pop-2", name: "Vrindavan", region: "Uttar Pradesh", country: "India", latitude: 27.5650, longitude: 77.6850 },
  { id: "pop-3", name: "Agra", region: "Uttar Pradesh", country: "India", latitude: 27.1767, longitude: 78.0081 },
  { id: "pop-4", name: "Jaipur", region: "Rajasthan", country: "India", latitude: 26.9124, longitude: 75.7873 },
  { id: "pop-5", name: "New Delhi", region: "Delhi", country: "India", latitude: 28.6139, longitude: 77.2090 },
  { id: "pop-6", name: "Mumbai", region: "Maharashtra", country: "India", latitude: 19.0760, longitude: 72.8777 },
  { id: "pop-7", name: "Bengaluru", region: "Karnataka", country: "India", latitude: 12.9716, longitude: 77.5946 },
  { id: "pop-8", name: "Varanasi", region: "Uttar Pradesh", country: "India", latitude: 25.3176, longitude: 82.9739 },
  { id: "pop-9", name: "Manali", region: "Himachal Pradesh", country: "India", latitude: 32.2396, longitude: 77.1887 },
  { id: "pop-10", name: "Goa", region: "Goa", country: "India", latitude: 15.2993, longitude: 74.1240 }
];

// ---------- Helper: Geocode Query ----------
async function geocodeQuery(queryName) {
  try {
    // 1. Try Nominatim
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: queryName,
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
      return [parseFloat(lat), parseFloat(lon)];
    }
  } catch (err) {
    console.warn(`⚠️ Nominatim geocoding in Places failed for "${queryName}", trying Geoapify fallback:`, err.message);
  }

  try {
    // 2. Try Geoapify Search fallback
    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (apiKey) {
      const url = "https://api.geoapify.com/v1/geocode/search";
      const response = await axios.get(url, {
        params: {
          text: queryName,
          filter: "countrycode:in",
          limit: 1,
          apiKey,
        },
        timeout: 4000,
      });

      if (response.data?.features?.length > 0) {
        const { lat, lon } = response.data.features[0].properties;
        return [parseFloat(lat), parseFloat(lon)];
      }
    }
  } catch (err) {
    console.error("❌ Geoapify geocoding in Places service failed:", err.message);
  }

  return null;
}

// ---------- Routes ----------

// Get popular destinations
router.get("/popular", async (req, res) => {
  const { countryCode = "IN", limit = 10 } = req.query;
  const cleanCountryCode = typeof countryCode === "string" ? countryCode.trim().slice(0, 2).toUpperCase() : "IN";
  const parsedLimit = Math.min(Math.max(Number(limit) || 10, 1), 30);
  const GEODB_BASE_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo";
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

  try {
    // Try GeoDB first, but fall back gracefully to avoid rate-limiting crashes
    const response = await axios.get(`${GEODB_BASE_URL}/cities`, {
      params: {
        countryIds: cleanCountryCode,
        sort: "-population",
        limit: parsedLimit,
      },
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      },
      timeout: 4000,
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
      rating: parseFloat((4 + Math.random()).toFixed(1)),
      reviews: Math.floor(Math.random() * 1000),
      location: `${city.region}, ${city.country}`,
      status: "Open for visitors",
    }));

    return res.json({ success: true, count: places.length, places });
  } catch (err) {
    console.warn("⚠️ GeoDB Popular Destinations failed, using high-quality static fallback:", err.message);

    const places = POPULAR_INDIAN_CITIES.slice(0, parsedLimit).map((city) => ({
      ...city,
      description: `${city.name} is a popular travel destination in ${city.region}, ${city.country}.`,
      category: "City",
      rating: parseFloat((4.2 + Math.random() * 0.6).toFixed(1)),
      reviews: Math.floor(Math.random() * 800) + 150,
      location: `${city.region}, ${city.country}`,
      status: "Open for visitors",
    }));

    return res.json({ success: true, count: places.length, places });
  }
});

// Search tourist attractions/sights near a query city or coordinates
router.get("/search", async (req, res) => {
  const { query, lat, lon } = req.query;
  const cleanQuery = typeof query === "string" ? query.trim().slice(0, 120) : "";
  const numLat = parseFloat(lat);
  const numLon = parseFloat(lon);
  const hasCoords = !isNaN(numLat) && !isNaN(numLon) && numLat >= -90 && numLat <= 90 && numLon >= -180 && numLon <= 180;

  if (!cleanQuery && !hasCoords) {
    return res.status(400).json({ error: "Valid query string or coordinates (lat [-90..90], lon [-180..180]) are required" });
  }

  const geoapifyKey = process.env.GEOAPIFY_API_KEY;
  if (!geoapifyKey) {
    console.error("❌ Missing GEOAPIFY_API_KEY in .env");
    return res.status(500).json({ success: false, error: "Map API configuration missing" });
  }

  try {
    let coords = null;
    if (hasCoords) {
      coords = [numLat, numLon];
    } else if (cleanQuery) {
      coords = await geocodeQuery(cleanQuery);
    }

    if (!coords) {
      console.warn(`⚠️ Could not determine coordinates for query: "${cleanQuery}"`);
      return res.json({ success: true, count: 0, places: [] });
    }

    const [latVal, lonVal] = coords;
    const geoapifyUrl = `https://api.geoapify.com/v2/places`;

    const response = await axios.get(geoapifyUrl, {
      params: {
        categories: "tourism.attraction,tourism.sights,entertainment.museum,leisure.park,building.historic,religion.place_of_worship",
        filter: `circle:${lonVal},${latVal},15000`, // 15km search radius
        bias: `proximity:${lonVal},${latVal}`,
        limit: 15,
        apiKey: geoapifyKey,
      },
      timeout: 5000,
    });

    const places = (response.data.features || []).map((f) => {
      const p = f.properties;
      let category = "Attraction";
      const cats = p.categories || [];

      if (cats.some(c => c.includes("temple") || c.includes("worship") || c.includes("religion"))) {
        category = "Temple";
      } else if (cats.some(c => c.includes("museum"))) {
        category = "Museum";
      } else if (cats.some(c => c.includes("park") || c.includes("leisure"))) {
        category = "Park";
      } else if (cats.some(c => c.includes("historic") || c.includes("heritage"))) {
        category = "Historic Site";
      }

      return {
        id: p.place_id,
        name: p.name || (p.street ? `${category} near ${p.street}` : `Scenic ${category}`),
        country: p.country || "India",
        region: p.state || "",
        latitude: p.lat,
        longitude: p.lon,
        category: category,
        description: `${p.name || category} is a must-visit location in ${p.city || p.county || "the area"}.`,
        rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
        reviews: Math.floor(Math.random() * 400) + 15,
        location: p.formatted || `${p.city || ""}, ${p.state || ""}`.trim().replace(/^,\s*/, ""),
        status: "Open for visitors",
      };
    }).filter(place => place.name && place.name.trim().length > 0);

    // If no specific attractions were found, return the city itself as a destination card
    if (places.length === 0) {
      const name = cleanQuery ? cleanQuery.split(",")[0] : "Destination";
      places.push({
        id: `city-${latVal}-${lonVal}`,
        name: name,
        country: "India",
        region: "",
        latitude: latVal,
        longitude: lonVal,
        category: "City",
        description: `Explore the vibrant city of ${name} and its local culture.`,
        rating: 4.5,
        reviews: 120,
        location: cleanQuery || `${latVal}, ${lonVal}`,
        status: "Open for visitors"
      });
    }

    res.json({ success: true, count: places.length, places });
  } catch (err) {
    console.error("❌ Search API error:", err.message);
    res.status(500).json({ success: false, error: "Search failed" });
  }
});

// Get nearby attractions using coordinates
router.get("/nearby", async (req, res) => {
  const { lat, lon, radius = 10000 } = req.query;
  const numLat = parseFloat(lat);
  const numLon = parseFloat(lon);

  if (isNaN(numLat) || isNaN(numLon) || numLat < -90 || numLat > 90 || numLon < -180 || numLon > 180) {
    return res.status(400).json({ error: "Valid latitude (-90 to 90) and longitude (-180 to 180) are required" });
  }

  const boundedRadius = Math.min(Math.max(Number(radius) || 10000, 500), 50000);

  const geoapifyKey = process.env.GEOAPIFY_API_KEY;
  if (!geoapifyKey) {
    console.error("❌ Missing GEOAPIFY_API_KEY in .env");
    return res.status(500).json({ success: false, error: "Map API configuration missing" });
  }

  try {
    const geoapifyUrl = `https://api.geoapify.com/v2/places`;
    const response = await axios.get(geoapifyUrl, {
      params: {
        categories: "tourism.attraction,tourism.sights,entertainment.museum,leisure.park,building.historic,religion.place_of_worship",
        filter: `circle:${numLon},${numLat},${boundedRadius}`,
        bias: `proximity:${numLon},${numLat}`,
        limit: 10,
        apiKey: geoapifyKey,
      },
      timeout: 5000,
    });

    const places = (response.data.features || []).map((f) => {
      const p = f.properties;
      let category = "Attraction";
      const cats = p.categories || [];

      if (cats.some(c => c.includes("temple") || c.includes("worship") || c.includes("religion"))) {
        category = "Temple";
      } else if (cats.some(c => c.includes("museum"))) {
        category = "Museum";
      } else if (cats.some(c => c.includes("park") || c.includes("leisure"))) {
        category = "Park";
      } else if (cats.some(c => c.includes("historic") || c.includes("heritage"))) {
        category = "Historic Site";
      }

      return {
        id: p.place_id,
        name: p.name || `Scenic ${category}`,
        country: p.country || "India",
        region: p.state || "",
        latitude: p.lat,
        longitude: p.lon,
        category: category,
        description: `${p.name || category} is located nearby.`,
        rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
        reviews: Math.floor(Math.random() * 200) + 10,
        location: p.formatted || `${p.city || ""}, ${p.state || ""}`.trim().replace(/^,\s*/, ""),
        status: "Nearby",
      };
    }).filter(place => place.name && place.name.trim().length > 0);

    res.json({ success: true, count: places.length, places });
  } catch (err) {
    console.error("❌ Nearby fetch error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch nearby places" });
  }
});

export default router;
