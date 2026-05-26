import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import type { MapViewProps } from "@/hooks/types";
import RestaurantIcon from "@/Assets/MapIcons/restaurant.jpg";
import HotelIcon from "@/Assets/MapIcons/hotel.jpg";
import ScenicIcon from "@/Assets/MapIcons/scenic.jpg";
import TempleIcon from "@/Assets/MapIcons/temple.jpg";
import GhatIcon from "@/Assets/MapIcons/ghat.jpg";
import { PolylineDecoratorLayer } from "./PolylineDecoratorLayer";
import { createPinIcon, createPlaceIcon } from "../Shared/icons";
import { Sun } from "lucide-react";
import { DesktopMiniLegend, DesktopRouteInfo, RouteInfoCard } from "./RouteInfoCard";

const normalizeCoords = (c: any): [number, number] =>
  Array.isArray(c) ? [c[0], c[1]] : [c.lat, c.lng];

const AutoFocusButton = ({ bounds }: { bounds: L.LatLngBounds }) => {
  const map = useMap();
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      title="Re-center route"
      onClick={() => map.flyToBounds(bounds, { padding: [60, 60] })}
      className="
        absolute top-3 right-3 z-[1000]
        w-11 h-11 md:w-12 md:h-12
        rounded-full
        bg-white/90 backdrop-blur-xl
        shadow-lg border border-white/40
        flex items-center justify-center
      "
    >
      <Sun className="w-5 h-5 text-green-600" />
    </motion.button>
  );
};



export const MapView: React.FC<MapViewProps> = ({
  source,
  destination,
  places = [],
}) => {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<any>(null);

  const coords = useMemo(
    () => [normalizeCoords(source.coords), normalizeCoords(destination.coords)],
    [source, destination]
  );

  useEffect(() => {
    (async () => {
      const q = coords.map(([lat, lng]) => `${lng},${lat}`).join(";");
      const r = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${q}?geometries=geojson`
      );
      const d = await r.json();
      const g = d.routes[0].geometry.coordinates.map(
        ([lng, lat]: any) => [lat, lng]
      );
      setRoute(g);
      setRouteInfo(d.routes[0]);
    })();
  }, [coords]);

  const bounds = L.latLngBounds(route.length ? route : coords);

  const getIcon = (c: string) => {
    const cat = c.toLowerCase();
    if (cat.includes("restaurant")) return createPlaceIcon(RestaurantIcon);
    if (cat.includes("hotel")) return createPlaceIcon(HotelIcon);
    if (cat.includes("scenic")) return createPlaceIcon(ScenicIcon);
    if (cat.includes("temple")) return createPlaceIcon(TempleIcon);
    return createPlaceIcon(GhatIcon);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden z-0">
     <MapContainer
        bounds={bounds}
        className="w-full h-full"
        scrollWheelZoom="center"
        doubleClickZoom={false}
        touchZoom={true}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <AutoFocusButton bounds={bounds} />

        {/* Route layers */}
        <Polyline positions={route} pathOptions={{ color: "#bbf7d0", weight: 9, opacity: 0.4 }} />
        <Polyline positions={route} pathOptions={{ color: "#22c55e", weight: 5 }} />
        <PolylineDecoratorLayer positions={route} color="#22c55e" />

        {/* Source marker */}
        <Marker position={coords[0]} icon={createPinIcon("#2563eb")}>
          <Popup>
            <div className="flex items-center gap-2 font-semibold text-blue-600">
              📍 Source
            </div>
            <div className="text-sm text-gray-700">{source.name}</div>
          </Popup>
        </Marker>

        {/* Destination marker */}
        <Marker position={coords[1]} icon={createPinIcon("#dc2626")}>
          <Popup>
            <div className="flex items-center gap-2 font-semibold text-red-600">
              🏁 Destination
            </div>
            <div className="text-sm text-gray-700">{destination.name}</div>
          </Popup>
        </Marker>

        {/* Places */}
        {places.map((p, i) => (
          <Marker
            key={i}
            position={normalizeCoords(p.coords)}
            icon={getIcon(p.category)}
          >
            <Popup>
              <b>{p.name}</b>
              <div className="text-sm text-gray-500">{p.category}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {routeInfo && (
        <>
          <DesktopRouteInfo
          distance={routeInfo.distance}
          duration={routeInfo.duration} />
          <DesktopMiniLegend />
        </>
      )}

      {routeInfo && (
        <RouteInfoCard
          distance={routeInfo.distance}
          duration={routeInfo.duration}
        />
      )}
    </div>
  );
};