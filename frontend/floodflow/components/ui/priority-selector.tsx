"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { PRIORITIES, Priority } from "@/lib/constants";

interface PrioritySelectorProps {
  onSelect: (priority: Priority) => void;
  selectedId?: string;
}

export function PrioritySelector({ onSelect, selectedId }: PrioritySelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-gray-900">Why are you traveling?</h2>
        <p className="text-gray-500 text-lg">
          Your purpose determines your priority score and route strategy
        </p>
      </div>

      {/* Cost formula banner */}
      <div className="bg-gradient-to-r from-slate-900 to-flood-900 rounded-2xl p-5 text-white text-center">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
          Multi-Objective Cost Function
        </p>
        <p className="text-xl font-mono font-bold tracking-wide">
          <span className="text-flood-300">W</span>
          {" = "}
          <span className="text-warning-300">(Distance × Road Cost)</span>
          {" − "}
          <span className="text-safe-400">Priority</span>
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Higher priority = lower W = better route assignment
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PRIORITIES.map((priority, i) => {
          const isSelected = selectedId === priority.id;

          return (
            <motion.button
              key={priority.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => onSelect(priority)}
              whileHover={{ scale: 1.02, translateY: -3 }}
              whileTap={{ scale: 0.98 }}
              className="priority-card relative text-left rounded-2xl overflow-hidden border-2 transition-all"
              style={{
                borderColor: isSelected ? "transparent" : "#e2e8f0",
                background: isSelected ? "none" : "white",
              }}
            >
              {/* Gradient background for selected */}
              {isSelected && (
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${priority.bgGradient}`}
                />
              )}

              {/* Content */}
              <div className={`relative z-10 p-5 ${isSelected ? "text-white" : "text-gray-800"}`}>
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{priority.icon}</span>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-white/90" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <h4
                  className={`font-bold text-lg mb-1 ${
                    isSelected ? "text-white" : "text-gray-800"
                  }`}
                >
                  {priority.name}
                </h4>

                <p
                  className={`text-sm mb-3 leading-relaxed ${
                    isSelected ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {priority.routeLogic}
                </p>

                {/* Score badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${
                      isSelected ? "text-white/60" : "text-gray-400"
                    }`}
                  >
                    Priority Score
                  </span>
                  <span
                    className={`font-black text-xl ${
                      isSelected ? "text-white" : priority.color
                    }`}
                  >
                    {priority.score.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Hover shimmer */}
              {!isSelected && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-br from-flood-50 to-flood-100 rounded-2xl" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
