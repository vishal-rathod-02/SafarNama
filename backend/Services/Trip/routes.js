import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import authMiddleware from "../../Middleware/Auth.js";
import { tripGenRateLimiter } from "../../Middleware/rateLimiter.js";
import { buildTripData } from "./AiEngine/FetchingEngine.js";
import Trip from "./model.js";
import { SERVICE_URLS } from "../../Config/serviceURLs.js";

const router = express.Router();

const LOCATION_URL = SERVICE_URLS.LOCATION;
const PLACES_URL = SERVICE_URLS.PLACES;
const FOOD_URL = SERVICE_URLS.FOOD;

router.post("/generate", authMiddleware, tripGenRateLimiter, async (req, res) => {
  try {
    const { source, destination, startCoords: clientStartCoords, endCoords: clientEndCoords } = req.body;
    const userId = req.user.id;

    if (!source || !destination || typeof source !== "string" || typeof destination !== "string" || !source.trim() || !destination.trim()) {
      return res.status(400).json({ success: false, message: "Valid source and destination strings are required." });
    }

    const cleanSource = source.trim().slice(0, 120);
    const cleanDestination = destination.trim().slice(0, 120);

    console.log(`🚗 Generating trip for: ${cleanSource} → ${cleanDestination}`);

    let startCoords = Array.isArray(clientStartCoords) && clientStartCoords.length === 2 ? clientStartCoords : null;
    let endCoords = Array.isArray(clientEndCoords) && clientEndCoords.length === 2 ? clientEndCoords : null;

    if (!startCoords || !endCoords) {
      try {
        const [srcRes, destRes] = await Promise.all([
          axios.get(`${LOCATION_URL}/api/geocode?locationName=${encodeURIComponent(cleanSource)}`, { validateStatus: null, timeout: 8000 }),
          axios.get(`${LOCATION_URL}/api/geocode?locationName=${encodeURIComponent(cleanDestination)}`, { validateStatus: null, timeout: 8000 }),
        ]);

        if (srcRes.status !== 200 || destRes.status !== 200) {
          console.error("❌ Location service bad response:", srcRes.status, destRes.status);
          return res.status(502).json({ success: false, message: "Location lookup service is currently unavailable." });
        }

        startCoords = startCoords || srcRes.data;
        endCoords = endCoords || destRes.data;
      } catch (err) {
        console.error("❌ Location service error:", err?.message || err);
        return res.status(502).json({ success: false, message: "Failed to resolve route coordinates." });
      }
    }

    if (!Array.isArray(startCoords) || !Array.isArray(endCoords)) {
      return res.status(400).json({ success: false, message: "Unable to fetch valid coordinates for the specified route." });
    }

    let placesList = [];
    try {
      const [sourcePlacesRes, destPlacesRes] = await Promise.all([
        axios.get(`${PLACES_URL}/api/places/search?query=${encodeURIComponent(cleanSource)}&lat=${startCoords[0]}&lon=${startCoords[1]}`, { validateStatus: null, timeout: 8000 }).catch(err => {
          console.error("❌ Source Places service request failed:", err.message);
          return null;
        }),
        axios.get(`${PLACES_URL}/api/places/search?query=${encodeURIComponent(cleanDestination)}&lat=${endCoords[0]}&lon=${endCoords[1]}`, { validateStatus: null, timeout: 8000 }).catch(err => {
          console.error("❌ Destination Places service request failed:", err.message);
          return null;
        })
      ]);

      const sourcePlaces = sourcePlacesRes && sourcePlacesRes.status === 200 && Array.isArray(sourcePlacesRes.data?.places) ? sourcePlacesRes.data.places : [];
      const destPlaces = destPlacesRes && destPlacesRes.status === 200 && Array.isArray(destPlacesRes.data?.places) ? destPlacesRes.data.places : [];

      placesList = [...sourcePlaces, ...destPlaces];
    } catch (err) {
      console.error("❌ Places service error:", err?.message || err);
    }

    let foodItems = [];
    let hotelItems = [];
    try {
      const [sourceFoodRes, sourceHotelsRes, destFoodRes, destHotelsRes] = await Promise.all([
        axios.get(`${FOOD_URL}/api/food/restaurants?lat=${encodeURIComponent(startCoords[0])}&lon=${encodeURIComponent(startCoords[1])}`, { validateStatus: null, timeout: 6000 }).catch(err => {
          console.error("❌ Source Food service request failed:", err.message);
          return null;
        }),
        axios.get(`${FOOD_URL}/api/food/hotels?lat=${encodeURIComponent(startCoords[0])}&lon=${encodeURIComponent(startCoords[1])}`, { validateStatus: null, timeout: 6000 }).catch(err => {
          console.error("❌ Source Hotels service request failed:", err.message);
          return null;
        }),
        axios.get(`${FOOD_URL}/api/food/restaurants?lat=${encodeURIComponent(endCoords[0])}&lon=${encodeURIComponent(endCoords[1])}`, { validateStatus: null, timeout: 6000 }).catch(err => {
          console.error("❌ Dest Food service request failed:", err.message);
          return null;
        }),
        axios.get(`${FOOD_URL}/api/food/hotels?lat=${encodeURIComponent(endCoords[0])}&lon=${encodeURIComponent(endCoords[1])}`, { validateStatus: null, timeout: 6000 }).catch(err => {
          console.error("❌ Dest Hotels service request failed:", err.message);
          return null;
        })
      ]);

      const sourceFood = sourceFoodRes && sourceFoodRes.status === 200 && Array.isArray(sourceFoodRes.data?.results) ? sourceFoodRes.data.results : [];
      const sourceHotels = sourceHotelsRes && sourceHotelsRes.status === 200 && Array.isArray(sourceHotelsRes.data?.results) ? sourceHotelsRes.data.results : [];
      const destFood = destFoodRes && destFoodRes.status === 200 && Array.isArray(destFoodRes.data?.results) ? destFoodRes.data.results : [];
      const destHotels = destHotelsRes && destHotelsRes.status === 200 && Array.isArray(destHotelsRes.data?.results) ? destHotelsRes.data.results : [];

      foodItems = [...sourceFood, ...destFood];
      hotelItems = [...sourceHotels, ...destHotels];
    } catch (err) {
      console.error("❌ Food/Hotels fetch error:", err.message);
    }

    const placesData = [...placesList, ...foodItems, ...hotelItems];

    let tripData;
    try {
      tripData = await buildTripData(cleanSource, cleanDestination, startCoords, endCoords, placesData);
    } catch (err) {
      console.error("❌ buildTripData error:", err?.message || err);
      return res.status(500).json({ success: false, message: "AI trip generation encountered an error. Please try again." });
    }

    if (!tripData) {
      console.error("⚠️ buildTripData returned null — check AI or route API.");
      return res.status(500).json({ success: false, message: "Failed to generate trip data." });
    }

    try {
      const newTrip = new Trip({
        user: userId,
        source: cleanSource,
        destination: cleanDestination,
        distance: tripData.distance,
        duration: tripData.duration,
        summary: tripData.summary,
        highlights: tripData.highlights,
        itinerary: tripData.itinerary,
        places: tripData.places,
      });
      await newTrip.save();
    } catch (err) {
      console.error("❌ Save trip error:", err?.message || err);
    }

    res.status(200).json({ success: true, message: "Trip generated successfully!", tripData });
  } catch (err) {
    console.error("💥 Trip Generation Error:", err?.message || err);
    res.status(500).json({ success: false, message: "Internal server error while generating trip." });
  }
});

/**
 * 💾 Save Trip Manually
 */
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      source,
      destination,
      distance,
      summary,
      highlights,
      itinerary,
      places,
      duration,
    } = req.body;

    if (!source || !destination || !summary || typeof source !== "string" || typeof destination !== "string") {
      return res.status(400).json({
        success: false,
        error: "Missing required fields.",
      });
    }

    const newTrip = new Trip({
      user: userId,
      source: source.trim().slice(0, 120),
      destination: destination.trim().slice(0, 120),
      distance: Number(distance) || 0,
      duration: typeof duration === "string" ? duration.slice(0, 50) : "",
      summary: typeof summary === "string" ? summary.slice(0, 2000) : "",
      highlights: Array.isArray(highlights) ? highlights.slice(0, 30) : [],
      itinerary: Array.isArray(itinerary) ? itinerary.slice(0, 30) : [],
      places: Array.isArray(places) ? places.slice(0, 50) : [],
    });

    const savedTrip = await newTrip.save();
    res.status(201).json({ success: true, trip: savedTrip });
  } catch (err) {
    console.error("💥 Save Trip Error:", err.message);
    res.status(500).json({ success: false, error: "Failed to save trip." });
  }
});

/**
 * 📜 Fetch User's Saved Trips (With ReDoS Sanitization)
 */
router.get("/mytrips", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 6, search = "" } = req.query;

    // Sanitize search string against ReDoS
    const safeSearch = typeof search === "string" ? search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
    const searchRegex = new RegExp(safeSearch, "i");

    const query = {
      user: req.user.id,
      ...(safeSearch
        ? {
            $or: [
              { source: searchRegex },
              { destination: searchRegex },
              { summary: searchRegex },
            ],
          }
        : {}),
    };

    const parsedLimit = Math.min(Math.max(Number(limit) || 6, 1), 50);
    const parsedPage = Math.max(Number(page) || 1, 1);

    const trips = await Trip.find(query)
      .sort({ createdAt: -1 })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    const total = await Trip.countDocuments(query);

    res.json({
      success: true,
      totalTrips: total,
      currentPage: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      trips,
    });
  } catch (err) {
    console.error("💥 Get Trips Error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch trips." });
  }
});

/**
 * ⭐ Toggle Favorite Trip (With ObjectId Validation)
 */
router.patch("/favorite/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid trip ID format." });
    }

    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip)
      return res
        .status(404)
        .json({ success: false, error: "Trip not found." });

    trip.isFavorite = !trip.isFavorite;
    await trip.save();

    res.json({ success: true, isFavorite: trip.isFavorite });
  } catch (err) {
    console.error("💥 Favorite Toggle Error:", err.message);
    res.status(500).json({ success: false, error: "Failed to toggle favorite." });
  }
});

/**
 * 🗑️ Delete Trip (With ObjectId Validation)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid trip ID format." });
    }

    const deleted = await Trip.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, error: "Trip not found." });
    res.json({ success: true, message: "Trip deleted successfully." });
  } catch (err) {
    console.error("💥 Delete Trip Error:", err.message);
    res.status(500).json({ success: false, error: "Failed to delete trip." });
  }
});

/**
 * 📊 Overview Dashboard
 */
router.get("/overview", authMiddleware, async (req, res) => {
  try {
    const [stats] = await Trip.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalDistance: { $sum: "$distance" },
          topDestinations: { $push: "$destination" },
        },
      },
    ]);

    const topDestination =
      stats?.topDestinations?.sort(
        (a, b) =>
          stats.topDestinations.filter((d) => d === b).length -
          stats.topDestinations.filter((d) => d === a).length
      )[0] || "N/A";

    res.json({
      success: true,
      overview: {
        totalTrips: stats?.totalTrips || 0,
        totalDistance: stats?.totalDistance || 0,
        topDestination,
      },
    });
  } catch (err) {
    console.error("💥 Overview Error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch overview." });
  }
});

export default router;