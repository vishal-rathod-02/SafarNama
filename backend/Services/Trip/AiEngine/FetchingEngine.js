import "../../../Config/env.js";
import { fetchRoute } from "../../../Utils/routeUtils.js";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ------------------------------------
   🔒 Rate limit + timeout + cache
------------------------------------ */
const aiCache = new Map();
const AI_TIMEOUT = 10_000; // 10 seconds

async function runAI(prompt, cacheKey) {
  if (process.env.MOCK_AI === "true") {
    return "✨ Mock AI response for local development.";
  }

  if (aiCache.has(cacheKey)) {
    return aiCache.get(cacheKey);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are SafarNama AI, a warm and practical travel planner for Indian road trips.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
      signal: controller.signal,
    });

    const text = response.choices[0]?.message?.content?.trim() || null;

    if (text) aiCache.set(cacheKey, text);
    return text;
  } catch (err) {
    if (err.name === "AbortError") {
      console.warn("⏱️ OpenAI timeout fallback used");
      return null;
    }
    console.error("❌ OpenAI Error:", err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/* ------------------------------------
   ✨ 1️⃣ Trip Summary
------------------------------------ */
export async function getRouteSummary(start, end, distance, duration) {
  const hours = Math.max(1, Math.round(duration / 3600));
  const km = Math.round(distance / 1000);

  return `Embark on an unforgettable road trip from ${start} to ${end}, covering a scenic distance of ${km} km over approximately ${hours} hours. This route beautifully connects distinct regional cultures, taking you through vibrant local highways, lush rustic landscapes, and high-quality highway dhabas that define the heart of the journey. As you venture closer to ${end}, you will experience a captivating transition of traditions, culinary aromas, and local history.\n\nThis trip is perfectly designed for travelers looking to blend adventure and discovery. Prepare to uncover scenic vistas, hidden historical architecture, and warm hospitality that will linger in your memories long after the drive is complete.`;
}

/* ------------------------------------
   ✨ 2️⃣ Trip Highlights
------------------------------------ */
export async function getTripHighlights(places) {
  if (!places || !places.length) {
    return "A scenic road trip of discovery, connecting local cultures, roadside architectural gems, and highly-rated dining stops.";
  }

  const list = places.slice(0, 5).map(p => p.name).join(", ");

  return `Uncover exceptional milestones along your path, featuring iconic places like ${list}. Savor authentic local dhabas and dining spots handpicked for their exquisite flavors, while enjoying top-tier accommodations and scenic overlooks curated for the perfect travel experience.`;
}

/* ------------------------------------
   ✨ 3️⃣ Daily Itinerary
------------------------------------ */
export async function getDailyItinerary(places, days = 2) {
  if (!places || !places.length) {
    return "Day 1: Depart early and stop by historic scenic lookouts. Check in to your comfortable hotel by late afternoon.\nDay 2: Immerse yourself in the local sights, markets, and regional delicacies at your destination.";
  }

  const attractionList = places.filter(p => p.category === "City" || p.category === "Nearby City" || p.category === "Attraction").slice(0, 3).map(p => p.name);
  const restaurantList = places.filter(p => p.category === "Restaurant").slice(0, 2).map(p => p.name);
  const hotelList = places.filter(p => p.category === "Hotel").slice(0, 1).map(p => p.name);

  const stop1 = attractionList[0] || "scenic highway stopovers";
  const stop2 = attractionList[1] || "local historical landmarks";
  const restaurant = restaurantList[0] || "top-rated local dhabas";
  const hotel = hotelList[0] || "your selected luxury retreat";

  return `Day 1: Rise early to hit the open highway, enjoying smooth cruising as you pass scenic viewpoints. Make a perfect midday stop at ${stop1} to stretch your legs and explore the area, followed by a delicious lunch at ${restaurant}. Check into ${hotel} by evening to relax and recharge.\n\nDay 2: Dedicate your day to deep sightseeing at your destination, visiting popular places like ${stop2}. Indorse in local shopping, explore famous cultural avenues, and finish your trip on a high note with a traditional dinner at local hot-spots.`;
}

/* ------------------------------------
   🚀 MAIN TRIP BUILDER
------------------------------------ */
export async function buildTripData(start, end, startCoords, endCoords, placesData = []) {
  const routeData = await fetchRoute(startCoords, endCoords);
  if (!routeData) return null;

  const { route, distance, duration } = routeData;

  const places = (Array.isArray(placesData) ? placesData : []).map(p => {
    const lat = p.lat ?? p.latitude;
    const lng = p.lng ?? p.lon ?? p.longitude;
    return {
      ...p,
      lat: lat,
      lng: lng,
      coords: p.coords ?? (lat !== undefined && lng !== undefined ? [lat, lng] : undefined),
      name: p.name || "Unknown Place",
      category: p.category || "Attraction",
      location: p.location || p.address || "",
    };
  });

  const [summary, highlights, itinerary] = await Promise.all([
    getRouteSummary(start, end, distance, duration),
    getTripHighlights(places),
    getDailyItinerary(places),
  ]);

  return {
    source: start,
    destination: end,
    summary,
    highlights,
    itinerary,
    distance,
    duration,
    route,
    places,
  };
}
