import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { AnimatedVehicleProps } from "@/hooks/types";
import { createCarIcon } from "@/Components/Shared/icons";

export const AnimatedVehicle: React.FC<AnimatedVehicleProps> = ({
  path,
  speed = 50,
  iconUrl,
}) => {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map || path.length < 2) return;

    // Create vehicle icon
    const vehicleIcon = createCarIcon (42);
    const marker = L.marker(path[0], { icon: vehicleIcon }).addTo(map);

    let progress = 0; // 0 to path.length
    let currentIndex = 0;

    const moveMarker = () => {
      if (currentIndex >= path.length - 1) {
        cancelAnimationFrame(animationRef.current!);
        return;
      }

      const [startLat, startLng] = path[currentIndex];
      const [endLat, endLng] = path[currentIndex + 1];

      // linear interpolation between two points
      const lat = startLat + (endLat - startLat) * progress;
      const lng = startLng + (endLng - startLng) * progress;

      marker.setLatLng([lat, lng]);

      progress += 0.02 * (speed / 50); // adjust 0.02 for smoothness
      if (progress >= 1) {
        progress = 0;
        currentIndex++;
      }

      animationRef.current = requestAnimationFrame(moveMarker);
    };

    moveMarker();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (markerRef.current) markerRef.current.remove();
    };
  }, [map, path, speed, iconUrl]);

  return null;
};
