"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Clock, MapPin, Camera, AlertCircle } from "lucide-react";
import { FloodReport, MOCK_FLOOD_DATA, SEVERITY_COLORS, SEVERITY_LABELS } from "@/lib/constants";
import { formatTime } from "@/lib/utils";

interface LiveReportsFeedProps {
  reports?: FloodReport[];
}

export function LiveReportsFeed({ reports = MOCK_FLOOD_DATA }: LiveReportsFeedProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-flood-900 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-safe-400 animate-pulse" />
          <span className="text-white font-bold text-sm">Live Reports</span>
        </div>
        <span className="text-slate-400 text-xs">{reports.length} active</span>
      </div>

      {/* Feed */}
      <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
        {reports.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
          >
            {/* Colored indicator */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1 mt-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: SEVERITY_COLORS[report.severity] }}
              />
              {i < reports.length - 1 && (
                <div className="w-px h-8 bg-gray-200" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800">
                  {SEVERITY_LABELS[report.severity]}
                </p>
                {report.reportCount && report.reportCount >= 3 && (
                  <span className="bg-danger-50 text-danger-600 text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                    ✓ Verified
                  </span>
                )}
              </div>

              {report.location && (
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {report.location}
                </p>
              )}

              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(report.timestamp)}
                </span>
                {report.reportCount && (
                  <span className="text-xs text-gray-400">
                    {report.reportCount} report{report.reportCount !== 1 ? "s" : ""}
                  </span>
                )}
                <span className="text-xs font-mono text-gray-400">
                  Cost: {report.cost}
                </span>
              </div>
            </div>

            {/* Photo thumbnail */}
            {report.imageUrl && (
              <img
                src={report.imageUrl}
                alt="Flood"
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
