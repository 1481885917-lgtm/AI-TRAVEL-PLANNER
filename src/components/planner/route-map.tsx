"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import type { RouteStop } from "@/lib/types";

type RouteMapProps = {
  route: RouteStop[];
};

export function RouteMap({ route }: RouteMapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || route.length === 0) {
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      return;
    }

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [route[0].coordinates.lng, route[0].coordinates.lat],
      zoom: 4
    });

    mapRef.current = map;
    map.on("load", () => {
      const coordinates = route.map((stop) => [stop.coordinates.lng, stop.coordinates.lat]);
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates
          }
        }
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#14766c",
          "line-width": 4
        }
      });
      route.forEach((stop) => {
        new mapboxgl.Marker({ color: "#db4d5c" })
          .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
          .setPopup(new mapboxgl.Popup().setText(stop.city))
          .addTo(map);
      });

      const bounds = new mapboxgl.LngLatBounds();
      route.forEach((stop) => bounds.extend([stop.coordinates.lng, stop.coordinates.lat]));
      map.fitBounds(bounds, { padding: 48, maxZoom: 8 });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [route]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
        配置 NEXT_PUBLIC_MAPBOX_TOKEN 后显示 Mapbox 路线地图
      </div>
    );
  }

  return <div ref={containerRef} className="h-80 overflow-hidden rounded-lg border" />;
}
