import * as L from "leaflet";

declare module "leaflet" {
  namespace Symbol {
    function arrowHead(options?: any): any;
  }

  function polylineDecorator(latlngs: L.LatLngExpression[] | L.Polyline, options?: any): any;

  const PolylineDecorator: any;
}

declare module "leaflet-polylinedecorator" {
  const content: any;
  export default content;
}
