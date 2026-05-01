import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/sections/hero-section";
import Link from "next/link";
import {
  Droplets,
  Navigation,
  Radio,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Droplets,
    title: "Real-Time Flood Detection",
    desc: "OpenWeatherMap live rain + elevation data identifies high-risk low-lying zones and creates a heatmap overlay.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    step: "02",
    icon: Radio,
    title: "Crowdsourced Verification",
    desc: "Citizens upload flood photos. When 3 reports hit the same 50m radius, the road cost auto-spikes and re-routing triggers.",
    color: "from-green-500 to-emerald-600",
  },
  {
    step: "03",
    icon: Zap,
    title: "Priority Routing Engine",
    desc: "W = (Distance × Road Cost) − Priority. Emergency vehicles get the Golden Path; leisure traffic gets buffer routes.",
    color: "from-yellow-500 to-orange-600",
  },
  {
    step: "04",
    icon: Shield,
    title: "Strategic Load Balancing",
    desc: "Congestion penalties nudge low-priority users toward secondary routes, preventing the Herd Effect on dry roads.",
    color: "from-purple-500 to-pink-600",
  },
];

const PRIORITY_TABLE = [
  { type: "Medical Emergency 🚑", score: 5000, route: "Golden Path", desc: "Shortest + driest, zero compromise" },
  { type: "Buy Medicine 💊", score: 2000, route: "Safe Route", desc: "Fastest safe path available" },
  { type: "Office / School 💼", score: 1000, route: "Safe Route", desc: "20% longer but significantly safer" },
  { type: "Food Delivery 🛵", score: 500, route: "Buffer Route", desc: "Speed vs safety balanced" },
  { type: "Shopping 🛍️", score: 200, route: "Buffer Route", desc: "Alternative congestion-aware" },
  { type: "Hangout ☕", score: 100, route: "Buffer Route", desc: "Kept away from critical bottlenecks" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-flood-50">
      <Navbar />
      <HeroSection />

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block bg-flood-100 text-flood-700 text-sm font-bold px-4 py-2 rounded-full mb-4">
              Three-Phase System
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              How FloodFlow Works
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              A logic-driven MVP that combines live weather data, crowdsourcing,
              and priority-based routing into one unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color }, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-black text-gray-300 font-mono">PHASE {step}</span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Priority Table */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-flood-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4">Priority Routing Matrix</h2>
            <p className="text-flood-200 text-lg">
              Every user type gets an optimized route. The formula is simple — the impact is massive.
            </p>
            <div className="inline-block bg-white/10 rounded-2xl px-6 py-3 mt-4 font-mono text-2xl font-bold text-flood-300">
              W = (Distance × Road Cost) − Priority
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-flood-700/50">
            <table className="w-full">
              <thead>
                <tr className="bg-flood-800/50">
                  <th className="text-left px-6 py-4 text-flood-300 font-bold text-sm">User Type</th>
                  <th className="text-center px-6 py-4 text-flood-300 font-bold text-sm">Priority Score</th>
                  <th className="text-center px-6 py-4 text-flood-300 font-bold text-sm hidden md:table-cell">Route Type</th>
                  <th className="text-left px-6 py-4 text-flood-300 font-bold text-sm hidden lg:table-cell">Route Logic</th>
                </tr>
              </thead>
              <tbody>
                {PRIORITY_TABLE.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t border-flood-800/30 hover:bg-flood-800/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-white font-semibold">{row.type}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-2xl font-black text-warning-400">{row.score.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center hidden md:table-cell">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          row.route === "Golden Path"
                            ? "bg-safe-500 text-white"
                            : row.route === "Safe Route"
                            ? "bg-flood-500 text-white"
                            : "bg-warning-500 text-white"
                        }`}
                      >
                        {row.route}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-flood-200 text-sm hidden lg:table-cell">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-10">
            <Link href="/dashboard">
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-flood-500 to-flood-600 text-white font-bold px-8 py-4 rounded-2xl hover:scale-105 transition-transform shadow-flood-lg text-lg">
                Try the Live Demo
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-flood-500 to-flood-700 rounded-xl flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white">FloodFlow</span>
          </div>
          <p className="text-slate-500 text-sm text-center">
            Built for hackathon — Priority-Based Flood Routing System.
            Preventing the herd effect, one route at a time. 🌊
          </p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-flood-400 hover:text-flood-300 text-sm font-medium transition-colors">Dashboard</Link>
            <Link href="/report" className="text-flood-400 hover:text-flood-300 text-sm font-medium transition-colors">Report</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
