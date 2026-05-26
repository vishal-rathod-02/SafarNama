import type { Place, Coordinates, PlaceWithCoords, RouteResult } from '@/hooks/types';
import { LocationService } from '@/Services/Location/Location.service';

const geocodeSingleLocation = async (specificQuery: string, genericQuery: string): Promise<Coordinates | null> => {
  try {
    const response = await LocationService.geocode(specificQuery);
    if (response.ok) {
      const data = await response.json();
      if (data) {
        return data;
      }
    }
  } catch (error) {
    console.error(`Specific geocoding failed for ${specificQuery}:`, error);
  }

  console.warn(`Could not find "${specificQuery}". Falling back to generic location: "${genericQuery}"`);

  try {
    const response = await LocationService.geocode(genericQuery);
    if (response.ok) {
      const data = await response.json();
      if (data) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error(`Generic geocoding also failed for ${genericQuery}:`, error);
    return null;
  }
};


export const fetchRoute = async (
  source: Coordinates,
  destination: Coordinates
): Promise<RouteResult | null> => {
  const url = `https://router.project-osrm.org/route/v1/driving/${source[1]},${source[0]};${destination[1]},${destination[0]}?geometries=geojson&overview=full`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`OSRM API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    if (data.routes?.length > 0) {
      const routeData = data.routes[0];
      const routeCoords: Coordinates[] = routeData.geometry.coordinates.map(
        (coord: number[]) => [coord[1], coord[0]]
      );

      const distanceInKm = Number((routeData.distance / 1000).toFixed(2));
      const durationInHours = Number((routeData.duration / 3600).toFixed(2));

      return { route: routeCoords, distance: distanceInKm, duration: durationInHours };
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch route:', error);
    return null;
  }
};

export const geocodeSinglePlace = async (place: Place): Promise<PlaceWithCoords | null> => {
  const specificQuery = `${place.name}, ${place.location}`;
  const genericQuery = place.location;
  const coords = await geocodeSingleLocation(specificQuery, genericQuery);
  if (coords) {
    return { ...place, coords };
  }
  return null;
}

