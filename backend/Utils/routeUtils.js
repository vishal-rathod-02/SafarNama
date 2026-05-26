import axios from "axios";
const routeCache = new Map();
const CACHE_TTL = 1000 * 60 * 10; 

async function fetchRouteFromGeoapify(startCoords, endCoords) {
  const [startLat, startLon] = startCoords;
  const [endLat, endLon] = endCoords;
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    console.error("❌ Missing GEOAPIFY_API_KEY in .env");
    return null;
  }

  const geoapifyUrl = `https://api.geoapify.com/v1/routing?waypoints=${startLat},${startLon}|${endLat},${endLon}&mode=drive&apiKey=${apiKey}`;

  try {
    const response = await axios.get(geoapifyUrl);
    const data = response.data;

    if (!data?.features?.length) {
      console.warn("⚠️ No route found from Geoapify");
      return null;
    }

    const routeFeature = data.features[0];
    const { geometry, properties } = routeFeature;

    return {
      route: geometry.coordinates[0], 
      distance: properties.distance, 
      duration: properties.time, 
      provider: "Geoapify",
    };
  } catch (error) {
    console.error("❌ Geoapify Route Error:", error.message);
    return null;
  }
}

/* Fallback: Fetch route from OSRM */

async function fetchRouteFromOSRM(startCoords, endCoords) {
  const [startLat, startLon] = startCoords;
  const [endLat, endLon] = endCoords;

  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;

  try {
    const response = await axios.get(osrmUrl);
    const data = response.data;

    if (!data.routes?.length) {
      console.warn("⚠️ OSRM returned no routes");
      return null;
    }

    const route = data.routes[0];
    return {
      route: route.geometry.coordinates,
      distance: route.distance,
      duration: route.duration,
      provider: "OSRM",
    };
  } catch (error) {
    console.error("❌ OSRM Route Error:", error.message);
    return null;
  }
}

/**
 * 🚀 Main Route Function (with Cache + Fallback)
 */
export async function fetchRoute(startCoords, endCoords) {
  const cacheKey = `${startCoords.join(",")}-${endCoords.join(",")}`;
  const cached = routeCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("⚡ Using cached route data");
    return cached.data;
  }

  let routeData = await fetchRouteFromGeoapify(startCoords, endCoords);

  if (!routeData) {
    console.warn("⚠️ Falling back to OSRM routing...");
    routeData = await fetchRouteFromOSRM(startCoords, endCoords);
  }

  if (!routeData) {
    console.error("💥 No valid route found from any provider");
    return null;
  }

  routeCache.set(cacheKey, { data: routeData, timestamp: Date.now() });
  return routeData;
}

/* Cache cleanup (every 30 minutes */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of routeCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) routeCache.delete(key);
  }
}, 1000 * 60 * 30);