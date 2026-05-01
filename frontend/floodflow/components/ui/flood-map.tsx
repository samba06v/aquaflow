"use client";

import dynamic from "next/dynamic";
import { Droplets } from "lucide-react";
import { FloodReport, RouteResult } from "@/lib/constants";
import { SectorRisk } from "@/lib/api";

export interface FloodMapProps {
  floodData?: FloodReport[];
  route?: RouteResult | null;
  godMode?: boolean;
  allRoutes?: RouteResult[];
  sectors?: SectorRisk[];
  onMapClick?: (coords: [number, number]) => void;
}

// Dynamically import mapbox map to avoid SSR/Turbopack issues
const FloodMapDynamic = dynamic<FloodMapProps>(
  () => import("./flood-map-inner").then((m) => m.FloodMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="text-center text-white space-y-3">
          <Droplets className="w-12 h-12 text-flood-400 mx-auto animate-bounce" />
          <p className="text-sm font-medium text-slate-300">Loading map…</p>
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 bg-flood-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

export function FloodMap(props: FloodMapProps) {
  return (
    <div className="w-full h-full" style={{ minHeight: 400 }}>
      <FloodMapDynamic {...props} />
    </div>
  );
}
