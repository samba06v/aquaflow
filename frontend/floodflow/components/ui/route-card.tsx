"use client";

import { motion } from "framer-motion";
import {
  Navigation,
  Clock,
  Droplets,
  TrendingUp,
  MapPin,
  Shield,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { RouteResult, Priority } from "@/lib/constants";
import { getRouteColor } from "@/lib/utils";

interface RouteCardProps {
  route: RouteResult;
  priority: Priority;
  onStartNavigation?: () => void;
}

const ROUTE_TYPE_LABELS = {
  golden: { label: "Golden Path 🏅", desc: "Absolute best route — emergency priority", color: "from-emerald-500 to-green-600" },
  safe: { label: "Safe Route 🛡️", desc: "Optimized for safety & reliability", color: "from-flood-500 to-flood-700" },
  buffer: { label: "Buffer Route 🔄", desc: "Strategic load balancing route", color: "from-warning-500 to-orange-600" },
};

export function RouteCard({ route, priority, onStartNavigation }: RouteCardProps) {
  const routeInfo = ROUTE_TYPE_LABELS[route.routeType];
  const routeColor = getRouteColor(route.routeType);

  const depthLabel =
    route.waterDepth === 0 ? "Completely Dry" :
    route.waterDepth < 5 ? "Slightly Wet" :
    route.waterDepth < 15 ? `${route.waterDepth}cm — Passable` :
    `${route.waterDepth}cm — Caution`;

  const costStatus =
    route.costScore < 50 ? { emoji: "✅", text: "Optimal safe route" } :
    route.costScore < 200 ? { emoji: "⚠️", text: "Minor waterlogging ahead" } :
    { emoji: "🚫", text: "Significant flooding on path" };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
    >
      {/* Route type header */}
      <div className={`bg-gradient-to-r ${routeInfo.color} p-5 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">
              Route Assigned
            </p>
            <h3 className="text-xl font-black">{routeInfo.label}</h3>
            <p className="text-sm opacity-80 mt-1">{routeInfo.desc}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">Priority</p>
            <p className="text-3xl font-black">{priority.score.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-5 space-y-4">
        {/* Distance & Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Distance</span>
            </div>
            <p className="text-2xl font-black text-gray-800">{route.distance.toFixed(1)}<span className="text-sm font-medium text-gray-500 ml-1">km</span></p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Duration</span>
            </div>
            <p className="text-2xl font-black text-gray-800">{route.duration}<span className="text-sm font-medium text-gray-500 ml-1">min</span></p>
          </div>
        </div>

        {/* Water depth */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Droplets className="w-4 h-4 text-flood-500" />
              Max Water Depth
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: route.waterDepth === 0 ? "#16a34a" : route.waterDepth < 10 ? "#d97706" : "#dc2626" }}
            >
              {depthLabel}
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((route.waterDepth / 30) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="h-full rounded-full"
              style={{
                background: route.waterDepth === 0 ? "#22c55e" : route.waterDepth < 10 ? "#f59e0b" : "#ef4444",
              }}
            />
          </div>
        </div>

        {/* Avoided zones */}
        <div className="flex items-center gap-3 bg-safe-50 rounded-xl p-3">
          <div className="w-10 h-10 bg-safe-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-safe-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-safe-700">
              {route.avoidedZones} flood zone{route.avoidedZones !== 1 ? "s" : ""} avoided
            </p>
            <p className="text-xs text-safe-600">Protected by priority routing engine</p>
          </div>
        </div>

        {/* Cost score */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-warning-500" />
              Route Cost Score
              <span className="text-xs text-gray-400 font-mono ml-1">(W)</span>
            </span>
            <span
              className="text-2xl font-black"
              style={{ color: routeColor }}
            >
              {route.costScore}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {costStatus.emoji} {costStatus.text}
          </p>
        </div>

        {/* Priority info */}
        <div className={`bg-gradient-to-r ${priority.bgGradient} rounded-xl p-4 text-white`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{priority.icon}</span>
            <div>
              <p className="text-xs opacity-75 font-medium">Traveling as</p>
              <p className="font-bold">{priority.name}</p>
              <p className="text-xs opacity-80 mt-0.5">{priority.description}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartNavigation}
          className={`w-full bg-gradient-to-r ${routeInfo.color} text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-base`}
        >
          <Navigation className="w-5 h-5" />
          Start Navigation
        </motion.button>
      </div>
    </motion.div>
  );
}
