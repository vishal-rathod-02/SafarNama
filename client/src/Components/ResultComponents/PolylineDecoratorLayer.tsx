import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-polylinedecorator";

interface PolylineDecoratorLayerProps {
  positions: [number, number][];
  color?: string;
}

export const PolylineDecoratorLayer: React.FC<PolylineDecoratorLayerProps> = ({
  positions,
  color = "#22c55e",
}) => {
  const map = useMap();
  const decoratorRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!map || positions.length < 2) return;

    const line = L.polyline(positions);

    const createDecorator = (arrowSize: number) =>
      L.polylineDecorator(line, {
        patterns: [
          {
            offset: "8%",
            repeat: 120, 
            symbol: L.Symbol.arrowHead({
              pixelSize: arrowSize,
              polygon: false, 
              pathOptions: {
                stroke: true,
                color,
                weight: 2,
                opacity: 0.55, 
              },
            }),
          },
        ],
      });

    // Initial decorator
    let decorator = createDecorator(getArrowSize(map.getZoom()));
    decorator.addTo(map);
    decoratorRef.current = decorator;

    const handleZoom = () => {
      const size = getArrowSize(map.getZoom());
      decorator.remove();
      decorator = createDecorator(size);
      decorator.addTo(map);
      decoratorRef.current = decorator;
    };

    map.on("zoomend", handleZoom);

    return () => {
      map.off("zoomend", handleZoom);
      decorator.remove();
    };
  }, [map, positions, color]);

  return null;
};


const getArrowSize = (zoom: number) => {
  if (zoom <= 10) return 6;
  if (zoom <= 13) return 8;
  return 10;
};
