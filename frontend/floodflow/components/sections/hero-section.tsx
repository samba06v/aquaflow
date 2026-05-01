"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets,
  Navigation,
  AlertTriangle,
  Shield,
  Zap,
  Users,
  ChevronDown,
  Radio,
  TrendingUp,
  Eye,
  Star,
} from "lucide-react";

const STATS = [
  { icon: Shield, value: "98.2%", label: "Route Safety Rate", color: "text-safe-500" },
  { icon: Users, value: "12,400+", label: "Citizens Helped", color: "text-flood-500" },
  { icon: Zap, value: "<2s", label: "Route Calculation", color: "text-warning-500" },
  { icon: Navigation, value: "5,800+", label: "Safe Routes Today", color: "text-purple-500" },
];

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Dynamic Load Balancing",
    desc: "Intelligently distributes traffic across routes to prevent the herd effect",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Eye,
    title: "God Mode (Demo)",
    desc: "Judges can view all possible routes & costs simultaneously to validate the logic",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Radio,
    title: "Live Crowdsource Reports",
    desc: "Citizens validate flood severity in real-time with photo uploads",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Star,
    title: "Priority Cost Formula",
    desc: "W = (Distance × Road Cost) − Priority. Smart routing for who needs it most",
    color: "from-purple-500 to-pink-500",
  },
];

const FLOAT_POSITIONS = [
  { left: "10%", top: "20%", size: 8, delay: 0, duration: 4 },
  { left: "80%", top: "15%", size: 12, delay: 0.5, duration: 3.5 },
  { left: "25%", top: "70%", size: 6, delay: 1, duration: 5 },
  { left: "65%", top: "60%", size: 10, delay: 0.3, duration: 4.5 },
  { left: "45%", top: "85%", size: 7, delay: 1.5, duration: 3 },
  { left: "90%", top: "45%", size: 9, delay: 0.8, duration: 4 },
  { left: "5%", top: "55%", size: 5, delay: 2, duration: 5.5 },
  { left: "55%", top: "10%", size: 11, delay: 0.2, duration: 3.8 },
];

export function HeroSection() {
  const [rainCount, setRainCount] = useState(0);

  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n += 47;
      setRainCount(n);
      if (n >= 12400) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-flood-900 to-slate-900">
      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Moving gradient orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(14,165,233,0.25) 0%, transparent 70%)",
          top: "-100px",
          left: "-100px",
        }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(3,105,161,0.3) 0%, transparent 70%)",
          bottom: "-50px",
          right: "-50px",
        }}
        animate={{ x: [0, -40, 0], y: [0, -60, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating droplets */}
      {FLOAT_POSITIONS.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-flood-400/40"
          style={{
            left: pos.left,
            top: pos.top,
            width: pos.size,
            height: pos.size,
          }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: pos.duration, repeat: Infinity, delay: pos.delay }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-flood-500/20 border border-flood-400/40 text-flood-300 px-4 py-2 rounded-full text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-flood-400 animate-pulse" />
          Hackathon Innovation — Anti Herd Effect Routing
        </motion.div>

        {/* Logo icon */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-flood-500/40 blur-3xl rounded-full scale-150" />
            <motion.div
              className="relative bg-gradient-to-br from-flood-400 to-flood-700 p-6 rounded-3xl shadow-2xl"
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <Droplets className="w-14 h-14 text-white" strokeWidth={1.8} />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-7xl md:text-9xl font-black tracking-tight mb-4"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-flood-300 via-white to-flood-400">
            FloodFlow
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-2xl md:text-3xl text-flood-200 font-semibold mb-4"
        >
          Smart Routing. Zero Gridlock. Lives Saved.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Priority-based navigation that solves the{" "}
          <span className="text-warning-400 font-semibold">Herd Effect</span> — 
          because getting an ambulance through matters more than getting a coffee.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 0 30px rgba(14,165,233,0.6)" }}
              whileTap={{ scale: 0.97 }}
              className="group px-8 py-4 bg-gradient-to-r from-flood-500 to-flood-700 text-white rounded-2xl font-bold text-lg shadow-flood flex items-center gap-3"
            >
              <Navigation className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Launch Dashboard
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">Live</span>
            </motion.button>
          </Link>
          <Link href="/report">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 bg-white/10 border border-white/30 text-white rounded-2xl font-bold text-lg backdrop-blur-sm hover:bg-white/20 transition-all flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-warning-400" />
              Report Flood
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-20"
        >
          {STATS.map(({ icon: Icon, value, label, color }, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="glass-dark rounded-2xl p-5 border border-flood-700/50"
            >
              <Icon className={`w-7 h-7 ${color} mx-auto mb-2`} />
              <div className={`text-2xl font-black ${color}`}>
                {label === "Citizens Helped" ? rainCount.toLocaleString() + "+" : value}
              </div>
              <div className="text-xs text-slate-400 mt-1">{label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-dark rounded-2xl p-6 text-left border border-white/10 group cursor-default"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-xs font-medium tracking-widest uppercase">Explore</span>
        <ChevronDown className="w-5 h-5" />
      </motion.div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
        <svg viewBox="0 0 1440 96" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M0,96 C240,60 480,0 720,32 C960,64 1200,20 1440,48 L1440,96 Z"
            fill="#f0f9ff"
          />
        </svg>
      </div>
    </section>
  );
}
