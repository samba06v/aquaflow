"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { X, Droplets, Clock, MapPin } from "lucide-react";
import {
  SEVERITY_COLORS,
  SEVERITY_LABELS,
  FloodReport,
  RouteResult,
} from "@/lib/constants";
import { SectorRisk } from "@/lib/api";
import { formatTime, getRouteColor } from "@/lib/utils";

interface FloodMapInnerProps {
  floodData?: FloodReport[];
  route?: RouteResult | null;
  godMode?: boolean;
  allRoutes?: RouteResult[];
  sectors?: SectorRisk[];
  onMapClick?: (coords: [number, number]) => void;
}

export function FloodMapInner({
  floodData = [],
  route = null,
  godMode = false,
  allRoutes = [],
  sectors = [],
  onMapClick,
}: FloodMapInnerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const sectorLayersRef = useRef<L.Layer[]>([]);
  const routeLayersRef = useRef<L.Layer[]>([]);
  const [selectedReport, setSelectedReport] = useState<FloodReport | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize Leaflet map
    map.current = L.map(mapContainer.current, {
      center: [22.5726, 88.3639], // Kolkata
      zoom: 13,
      zoomControl: false,
    });

    // Dark theme map tiles (CartoDB Dark Matter)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map.current);

    L.control.zoom({ position: "topright" }).addTo(map.current);

    map.current.on("click", (e) => {
      onMapClick?.([e.latlng.lng, e.latlng.lat]);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [onMapClick]);

  // Render Flood Heatmap and Markers
  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach((m) => map.current?.removeLayer(m));
    markersRef.current = [];

    floodData.forEach((report) => {
      // Heatmap effect using circles
      const radius = report.cost > 500 ? 300 : report.cost > 100 ? 150 : 80;
      const heatCircle = L.circle([report.coords[1], report.coords[0]], {
        color: "transparent",
        fillColor: SEVERITY_COLORS[report.severity],
        fillOpacity: 0.3,
        radius: radius,
      }).addTo(map.current!);
      markersRef.current.push(heatCircle);

      // Custom icon for marker
      const isRecent = Date.now() - report.timestamp.getTime() < 10 * 60000;
      const iconHtml = `
        <div style="
          position: relative; width: 26px; height: 26px;
          background: ${SEVERITY_COLORS[report.severity]};
          border-radius: 50%; border: 3px solid white;
          box-shadow: 0 2px 12px rgba(0,0,0,0.5);
          cursor: pointer;
        ">
          ${isRecent ? `<div style="
            position:absolute; inset:-6px; border-radius:50%;
            border:2px solid ${SEVERITY_COLORS[report.severity]};
            animation:floodPulse 2s ease-out infinite;
          "></div>` : ""}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "",
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([report.coords[1], report.coords[0]], { icon: customIcon })
        .on("click", (e) => {
          L.DomEvent.stopPropagation(e as any);
          setSelectedReport(report);
        })
        .addTo(map.current!);
      markersRef.current.push(marker);
    });

    if (userLocation) {
       const userIconHtml = `
        <div style="
          width: 18px; height: 18px; background: #0ea5e9;
          border-radius: 50%; border: 3px solid white;
          box-shadow: 0 0 0 4px rgba(14,165,233,0.3);
        "></div>
      `;
      const userIcon = L.divIcon({
        html: userIconHtml,
        className: "",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const userMarker = L.marker(userLocation, { icon: userIcon }).addTo(map.current!);
      markersRef.current.push(userMarker);
    }
  }, [floodData, userLocation]);

  // Render OpenWeather + elevation risk sectors
  useEffect(() => {
    if (!map.current) return;

    sectorLayersRef.current.forEach((layer) => map.current?.removeLayer(layer));
    sectorLayersRef.current = [];

    const riskColors = {
      low: "#22c55e",
      moderate: "#f59e0b",
      high: "#ef4444",
    };

    sectors.forEach((sector) => {
      const circle = L.circle(sector.center, {
        color: riskColors[sector.risk_level],
        fillColor: riskColors[sector.risk_level],
        fillOpacity: sector.risk_level === "high" ? 0.22 : 0.12,
        radius: sector.risk_level === "high" ? 750 : 520,
        weight: 1,
      }).addTo(map.current!);

      circle.bindTooltip(
        `${sector.name}: ${sector.risk_level.toUpperCase()} risk (${sector.rainfall_mm_hr}mm/hr rain)`,
        { direction: "top" }
      );
      sectorLayersRef.current.push(circle);
    });
  }, [sectors]);

  // Route rendering
  useEffect(() => {
    if (!map.current) return;

    routeLayersRef.current.forEach((l) => map.current?.removeLayer(l));
    routeLayersRef.current = [];

    const routes = godMode ? allRoutes : route ? [route] : [];
    
    routes.forEach((r) => {
      // FIX: Cast directly to LatLngExpression because backend sends [lat, lng]
      const latLngs = r.coordinates as L.LatLngExpression[];
      const color = getRouteColor(r.routeType);

      // Casing (glow)
      const casing = L.polyline(latLngs, {
        color: color,
        weight: 14,
        opacity: 0.2,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map.current!);
      
      // Core line
      const line = L.polyline(latLngs, {
        color: color,
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map.current!);

      routeLayersRef.current.push(casing, line);
    });

    if (route && route.coordinates.length > 0) {
      // FIX: Direct cast for fitBounds
      const latLngs = route.coordinates as L.LatLngExpression[];
      map.current.fitBounds(L.polyline(latLngs).getBounds(), { padding: [80, 80], animate: true });
    }
  }, [route, godMode, allRoutes]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: 400 }}>
      {/* Dynamic Leaflet injects CSS properly without build errors in NextJS 16 */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container { background: #1e293b; font-family: inherit; }
        .leaflet-control-zoom { border: none !important; box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important; border-radius: 12px; overflow: hidden; }
        .leaflet-control-zoom a { background: rgba(255,255,255,0.92) !important; color: #0f172a !important; border: none !important; }
        .leaflet-control-zoom a:hover { background: #f0f9ff !important; }
        @keyframes floodPulse { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(2.4); opacity: 0; } }
      `}} />
      <div ref={mapContainer} className="w-full h-full rounded-2xl z-0" />

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 glass rounded-xl shadow-lg p-4 space-y-2 z-10 pointer-events-none"
      >
        <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider mb-3">
          Flood Severity
        </h3>
        {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: SEVERITY_COLORS[key as keyof typeof SEVERITY_COLORS] }} />
            <span className="text-gray-700">{label}</span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
          {[["#22c55e", "Golden Path"], ["#0ea5e9", "Safe Route"], ["#f59e0b", "Buffer Route"]].map(([c, l]) => (
            <div key={l} className="flex items-center gap-2 text-xs">
              <div className="w-8 h-1.5 rounded" style={{ background: c }} />
              <span className="text-gray-600">{l}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* God Mode Badge */}
      <AnimatePresence>
        {godMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-4 right-14 z-10 god-mode-active bg-yellow-400 text-yellow-900 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-yellow-900 animate-pulse" />
            GOD MODE
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report popup */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 glass rounded-2xl shadow-2xl p-5 w-80 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <button onClick={() => setSelectedReport(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
            {selectedReport.imageUrl && (
              <img src={selectedReport.imageUrl} alt="Flood report" className="w-full h-36 object-cover rounded-xl mb-4" />
            )}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: SEVERITY_COLORS[selectedReport.severity] + "25" }}>
                <Droplets className="w-5 h-5" style={{ color: SEVERITY_COLORS[selectedReport.severity] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm">{SEVERITY_LABELS[selectedReport.severity]}</p>
                {selectedReport.location && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {selectedReport.location}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatTime(selectedReport.timestamp)}
                  {selectedReport.reportCount && (
                    <span className="ml-2 bg-flood-100 text-flood-700 px-1.5 py-0.5 rounded-full text-xs">{selectedReport.reportCount} reports</span>
                  )}
                </p>
                <p className="text-xs font-mono text-gray-500 mt-1">Cost: <span className="font-bold text-gray-700">{selectedReport.cost}</span></p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
