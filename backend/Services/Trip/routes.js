import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import authMiddleware from "../../Middleware/Auth.js";
import { buildTripData } from "./AiEngine/FetchingEngine.js";
import Trip from "./model.js";
import { SERVICE_URLS } from "../../Config/serviceURLs.js";

const router = express.Router();

const LOCATION_URL = SERVICE_URLS.LOCATION;
const PLACES_URL = SERVICE_URLS.PLACES;
const FOOD_URL = SERVICE_URLS.FOOD;

router.post("/generate", authMiddleware, async (req, res) => {
  try {
    const { source, destination, startCoords: clientStartCoords, endCoords: clientEndCoords } = req.body;
    const userId = req.user.id;

    if (!source || !destination) {
      return res.status(400).json({ success: false, message: "Source and destination are required." });
    }

    console.log(`🚗 Generating trip for: ${source} → ${destination}`);

    let startCoords = Array.isArray(clientStartCoords) ? clientStartCoords : null;
    let endCoords = Array.isArray(clientEndCoords) ? clientEndCoords : null;

    if (!startCoords || !endCoords) {
      try {
        const [srcRes, destRes] = await Promise.all([
          axios.get(`${LOCATION_URL}/api/geocode?locationName=${encodeURIComponent(source)}`, { validateStatus: null }),
          axios.get(`${LOCATION_URL}/api/geocode?locationName=${encodeURIComponent(destination)}`, { validateStatus: null }),
        ]);

        if (srcRes.status !== 200 || destRes.status !== 200) {
          console.error("❌ Location service bad response:", srcRes.status, destRes.status, srcRes.data, destRes.data);
          return res.status(502).json({ success: false, message: "Location service error", details: { src: srcRes.data, dest: destRes.data } });
        }

        startCoords = startCoords || srcRes.data;
        endCoords = endCoords || destRes.data;
      } catch (err) {
        console.error("❌ Location service error:", err?.message || err);
        return res.status(502).json({ success: false, message: "Location service error", details: err?.message || err });
      }
    }

    if (!Array.isArray(startCoords) || !Array.isArray(endCoords)) {
      return res.status(400).json({ success: false, message: "Unable to fetch valid coordinates." });
    }

    let placesList = [];
    try {
      const placesRes = await axios.get(`${PLACES_URL}/api/places/search?query=${encodeURIComponent(destination)}`, { validateStatus: null });
      if (placesRes.status === 200 && Array.isArray(placesRes.data?.places)) {
        placesList = placesRes.data.places;
      } else {
        console.warn("⚠️ Places service returned non-200 or unexpected shape:", placesRes.status, placesRes.data);
      }
    } catch (err) {
      console.error("❌ Places service error:", err?.message || err);
      return res.status(502).json({ success: false, message: "Places service error", details: err?.message || err });
    }

    let foodItems = [];
    let hotelItems = [];
    try {
      const [foodRes, hotelsRes] = await Promise.all([
        axios.get(`${FOOD_URL}/api/food/restaurants?lat=${encodeURIComponent(endCoords[0])}&lon=${encodeURIComponent(endCoords[1])}`, { validateStatus: null }).catch(err => {
          console.error("❌ Food service request failed:", err.message);
          return null;
        }),
        axios.get(`${FOOD_URL}/api/food/hotels?lat=${encodeURIComponent(endCoords[0])}&lon=${encodeURIComponent(endCoords[1])}`, { validateStatus: null }).catch(err => {
          console.error("❌ Hotels service request failed:", err.message);
          return null;
        })
      ]);

      if (foodRes && foodRes.status === 200) {
        foodItems = Array.isArray(foodRes.data?.results) ? foodRes.data.results : [];
      } else if (foodRes) {
        console.warn("⚠️ Food service returned non-200:", foodRes.status, foodRes.data);
      }

      if (hotelsRes && hotelsRes.status === 200) {
        hotelItems = Array.isArray(hotelsRes.data?.results) ? hotelsRes.data.results : [];
      } else if (hotelsRes) {
        console.warn("⚠️ Hotels service returned non-200:", hotelsRes.status, hotelsRes.data);
      }
    } catch (err) {
      console.error("❌ Food/Hotels fetch error:", err.message);
    }

    const placesData = [...placesList, ...foodItems, ...hotelItems];

    let tripData;
    try {
      tripData = await buildTripData(source, destination, startCoords, endCoords, placesData);
    } catch (err) {
      console.error("❌ buildTripData error:", err?.message || err);
      return res.status(500).json({ success: false, message: "AI trip generation failed", details: err?.message || err });
    }

    if (!tripData) {
      console.error("⚠️ buildTripData returned null — check AI or route API.");
      return res.status(500).json({ success: false, message: "Failed to generate trip data." });
    }

    try {
      const newTrip = new Trip({
        user: userId,
        source,
        destination,
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
      
      return res.status(500).json({ success: false, message: "Failed to save trip", details: err?.message || err });
    }

    res.status(200).json({ success: true, message: "Trip generated successfully!", tripData });
  } catch (err) {
    console.error("💥 Trip Generation Error:", err?.message || err);
    res.status(500).json({ success: false, message: "Internal server error while generating trip.", error: err?.message || err });
  }
});

/**
 * 💾 Save Trip Manually (if you ever send custom trip from frontend)
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

    if (!source || !destination || !distance || !summary) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields.",
      });
    }

    const newTrip = new Trip({
      user: userId,
      source,
      destination,
      distance,
      duration,
      summary,
      highlights,
      itinerary,
      places,
    });

    const savedTrip = await newTrip.save();
    res.status(201).json({ success: true, trip: savedTrip });
  } catch (err) {
    console.error("💥 Save Trip Error:", err.message);
    res.status(500).json({ success: false, error: "Failed to save trip." });
  }
});

/**
 * 📜 Fetch User's Saved Trips
 */
router.get("/mytrips", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 6, search = "" } = req.query;

    const query = {
      user: req.user.id,
      $or: [
        { source: new RegExp(search, "i") },
        { destination: new RegExp(search, "i") },
        { summary: new RegExp(search, "i") },
      ],
    };

    const trips = await Trip.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Trip.countDocuments(query);

    res.json({
      success: true,
      totalTrips: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      trips,
    });
  } catch (err) {
    console.error("💥 Get Trips Error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch trips." });
  }
});

/**
 * ⭐ Toggle Favorite Trip
 */
router.patch("/favorite/:id", authMiddleware, async (req, res) => {
  try {
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
 * 🗑️ Delete Trip
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
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