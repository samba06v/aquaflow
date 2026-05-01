"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FloodMap } from "@/components/ui/flood-map";
import { PrioritySelector } from "@/components/ui/priority-selector";
import { RouteCard } from "@/components/ui/route-card";
import { LiveReportsFeed } from "@/components/ui/live-reports";
import { Navbar } from "@/components/layout/navbar";
import {
  ArrowLeft,
  Search,
  MapPin,
  Layers,
  Eye,
  EyeOff,
  ChevronRight,
  Radio,
  Navigation,
  AlertTriangle,
  CloudRain,
  CloudSun,
} from "lucide-react";
import Link from "next/link";
import {
  MOCK_FLOOD_DATA,
  MOCK_ROUTES,
  PRIORITIES,
  FloodReport,
  Priority,
  RouteResult,
} from "@/lib/constants";
import { calculateRoute, fetchReports, fetchSectors, geocodePlace, SectorRisk } from "@/lib/api";

type Step = "priority" | "map" | "route";
type RouteMode = "demo" | "live";

export default function DashboardPage() {
  const [step, setStep] = useState<Step>("priority");
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);
  const [destination, setDestination] = useState("");
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [godMode, setGodMode] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [liveReports, setLiveReports] = useState<FloodReport[]>(MOCK_FLOOD_DATA);
  const [sectors, setSectors] = useState<SectorRisk[]>([]);
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  const [routeMode, setRouteMode] = useState<RouteMode>("demo");

  const allRoutes = Object.values(MOCK_ROUTES);

  useEffect(() => {
    let alive = true;
    const loadLiveData = async () => {
      try {
        const [reports, sectorRisks] = await Promise.all([fetchReports(), fetchSectors()]);
        if (!alive) return;
        setLiveReports(reports);
        setSectors(sectorRisks);
      } catch (error) {
        console.warn("Live AquaFlow data unavailable, using demo data.", error);
      }
    };

    loadLiveData();
    const interval = window.setInterval(loadLiveData, 15000);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => setCurrentPosition([position.coords.latitude, position.coords.longitude]),
      () => setCurrentPosition(null)
    );
  }, []);

  const handlePrioritySelect = (priority: Priority) => {
    setSelectedPriority(priority);
    setTimeout(() => setStep("map"), 400);
  };

  const handleFindRoute = async () => {
    if (!selectedPriority) return;
    setIsCalculating(true);

    try {
      const target = destination.trim() || "City Centre Salt Lake Kolkata";
      const resolvedDestination = await geocodePlace(target);
      const endCoords: [number, number] = [resolvedDestination.lat, resolvedDestination.lng];
      const startCoords: [number, number] = currentPosition ?? [22.5815, 88.4348];

      const requestBody: {
        start: [number, number];
        end: [number, number];
        priority: number;
        mode: RouteMode;
      } = {
        start: startCoords,
        end: endCoords,
        priority: selectedPriority.score,
        mode: routeMode,
      };

      const data = await calculateRoute(requestBody);

      // 4. Merge the live data with Role 1's UI structure
      const baseRouteMetadata = MOCK_ROUTES[selectedPriority.id] ?? MOCK_ROUTES.commute;
      const liveRoute = {
        ...baseRouteMetadata,
        ...data,
        coordinates: data.coordinates, // Override the mock line with the real Dijkstra line
        distance: data.distance || baseRouteMetadata.distance, // Pull real distance from Python Engine
        duration: data.duration || baseRouteMetadata.duration, // Pull real duration from Python Engine
        costScore: data.costScore || baseRouteMetadata.costScore // Pull real score from Python Engine
      };

      setActiveRoute(liveRoute);
      setStep("route");

    } catch (error) {
      console.error("Routing Engine Connection Failed:", error);
      alert(error instanceof Error ? error.message : "Route calculation failed.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-flood-50 via-white to-flood-50">
      {/* Navbar */}
      <Navbar
        godMode={godMode}
        onToggleGodMode={() => setGodMode((g) => !g)}
        showGodMode={step !== "priority"}
      />

      {/* God Mode Banner */}
      <AnimatePresence>
        {godMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-yellow-400 text-yellow-900 text-center py-2 text-sm font-bold overflow-hidden"
          >
            👁️ GOD MODE ACTIVE — All routes, costs and routing logic are now visible to judges
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-flood-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className={step === "priority" ? "text-flood-600 font-medium" : ""}>
            Priority
          </span>
          <ChevronRight className="w-4 h-4" />
          <span className={step === "map" ? "text-flood-600 font-medium" : ""}>Map</span>
          <ChevronRight className="w-4 h-4" />
          <span className={step === "route" ? "text-flood-600 font-medium" : ""}>Route</span>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <AnimatePresence mode="wait">
          {/* STEP 1: Priority */}
          {step === "priority" && (
            <motion.div
              key="priority"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="max-w-3xl mx-auto pt-4"
            >
              <PrioritySelector
                selectedId={selectedPriority?.id}
                onSelect={handlePrioritySelect}
              />
            </motion.div>
          )}

          {/* STEP 2: Map + Sidebar */}
          {step === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4"
              style={{ height: "calc(100vh - 160px)", minHeight: 600 }}
            >
              {/* Map */}
              <div className="lg:col-span-2 relative" style={{ minHeight: 400 }}>
                <FloodMap
                  floodData={liveReports}
                  sectors={sectors}
                  godMode={godMode}
                  allRoutes={godMode ? allRoutes : []}
                />
              </div>

              {/* Sidebar */}
              <div className="flex flex-col gap-4 overflow-y-auto">
                {/* Priority badge */}
                {selectedPriority && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`bg-gradient-to-r ${selectedPriority.bgGradient} rounded-2xl p-5 text-white`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs opacity-70 font-medium uppercase tracking-wide">
                          Active Priority
                        </p>
                        <p className="text-xl font-black mt-1">{selectedPriority.icon} {selectedPriority.name}</p>
                        <p className="text-sm opacity-80 mt-1">{selectedPriority.description}</p>
                      </div>
                      <p className="text-4xl font-black opacity-90">{selectedPriority.score.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => setStep("priority")}
                      className="mt-3 text-xs opacity-70 hover:opacity-100 underline"
                    >
                      Change priority →
                    </button>
                  </motion.div>
                )}

                {/* Destination */}
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      {routeMode === "live" ? (
                        <CloudSun className="w-4 h-4 text-safe-500" />
                      ) : (
                        <CloudRain className="w-4 h-4 text-flood-500" />
                      )}
                      Routing Mode
                    </h3>
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
                      <button
                        type="button"
                        onClick={() => setRouteMode("live")}
                        className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                          routeMode === "live"
                            ? "bg-white text-safe-700 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Live Weather
                      </button>
                      <button
                        type="button"
                        onClick={() => setRouteMode("demo")}
                        className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                          routeMode === "demo"
                            ? "bg-white text-flood-700 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Demo Storm
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {routeMode === "live"
                        ? "Uses live weather and verified reports; dry conditions return normal routes."
                        : "Injects storm conditions so priority routing is always visible."}
                    </p>
                  </div>

                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-flood-500" /> Destination
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Enter destination…"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-flood-500 focus:outline-none text-sm transition-colors"
                    />
                  </div>

                  {/* Quick destinations */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {["City Centre", "Wipro", "Nicco Park"].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDestination(d)}
                        className="text-xs bg-flood-50 text-flood-700 px-3 py-1.5 rounded-full hover:bg-flood-100 transition-colors font-medium"
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleFindRoute}
                    disabled={isCalculating}
                    className="w-full mt-4 bg-gradient-to-r from-flood-600 to-flood-700 text-white font-bold py-3.5 rounded-xl shadow-flood hover:shadow-flood-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isCalculating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Calculating…
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        Find Optimal Route
                      </>
                    )}
                  </motion.button>
                </div>

                {/* God mode table */}
                {godMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4"
                  >
                    <h3 className="font-bold text-yellow-900 text-sm mb-3 flex items-center gap-2">
                      👁️ Route Logic Matrix
                    </h3>
                    <div className="space-y-2">
                      {PRIORITIES.slice(0, 4).map((p) => {
                        const r = MOCK_ROUTES[p.id];
                        return r ? (
                          <div key={p.id} className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2">
                            <span className="font-medium">{p.icon} {p.name}</span>
                            <div className="flex items-center gap-3 text-gray-500">
                              <span>{r.distance.toFixed(1)}km</span>
                              <span className="font-bold text-gray-700">W={r.costScore}</span>
                              <span
                                className="px-1.5 py-0.5 rounded font-bold text-white text-xs"
                                style={{ background: r.routeType === "golden" ? "#22c55e" : r.routeType === "safe" ? "#0ea5e9" : "#f59e0b" }}
                              >
                                {r.routeType}
                              </span>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Live reports */}
                <LiveReportsFeed reports={liveReports} />
              </div>
            </motion.div>
          )}

          {/* STEP 3: Route result */}
          {step === "route" && activeRoute && selectedPriority && (
            <motion.div
              key="route"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4"
              style={{ minHeight: 600 }}
            >
              {/* Map */}
              <div className="lg:col-span-2 relative" style={{ minHeight: 500 }}>
                <FloodMap
                  floodData={liveReports}
                  sectors={sectors}
                  route={activeRoute}
                  godMode={godMode}
                  allRoutes={godMode ? allRoutes : []}
                />
              </div>

              {/* Route card sidebar */}
              <div className="flex flex-col gap-4 overflow-y-auto">
                <RouteCard
                  route={activeRoute}
                  priority={selectedPriority}
                  onStartNavigation={() => alert("Navigation started! 🚗 (Demo mode)")}
                />

                <button
                  onClick={() => setStep("map")}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium text-center"
                >
                  ← Back to Map
                </button>

                {/* Warning for low priority */}
                {selectedPriority.score < 500 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-warning-50 border border-warning-200 rounded-2xl p-4 flex items-start gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-warning-800">
                        Strategic Route Distribution Active
                      </p>
                      <p className="text-xs text-warning-700 mt-1">
                        Your route has been optimized to reduce congestion on primary roads,
                        keeping them clear for emergency vehicles.
                      </p>
                    </div>
                  </motion.div>
                )}
                {activeRoute.explanation && (
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 text-xs text-gray-600 shadow-sm">
                    <span className="font-bold text-gray-800">
                      {activeRoute.mode === "live" ? "Live Weather" : "Demo Storm"}:
                    </span>{" "}
                    {activeRoute.explanation}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
