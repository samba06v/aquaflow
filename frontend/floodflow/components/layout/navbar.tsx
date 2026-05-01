"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Droplets, Eye, EyeOff } from "lucide-react";

interface NavbarProps {
  godMode?: boolean;
  onToggleGodMode?: () => void;
  showGodMode?: boolean;
}

export function Navbar({ godMode, onToggleGodMode, showGodMode }: NavbarProps) {
  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-flood-500 to-flood-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-flood">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-flood-600 to-flood-800">
            FloodFlow
          </span>
          <span className="hidden sm:block text-xs bg-flood-100 text-flood-700 px-2 py-0.5 rounded-full font-medium">
            BETA
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/dashboard" className="hover:text-flood-600 transition-colors">Dashboard</Link>
          <Link href="/report" className="hover:text-flood-600 transition-colors">Report Flood</Link>
          <a href="#how-it-works" className="hover:text-flood-600 transition-colors">How It Works</a>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {showGodMode && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleGodMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                godMode
                  ? "bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-200 god-mode-active"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {godMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              God Mode
            </motion.button>
          )}
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-flood-600 to-flood-700 text-white px-5 py-2 rounded-xl font-semibold text-sm shadow-flood hover:shadow-flood-lg transition-shadow flex items-center gap-1.5"
            >
              <span>Navigate</span>
            </motion.button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
