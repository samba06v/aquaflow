"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import {
  Camera,
  MapPin,
  Droplets,
  Send,
  CheckCircle2,
  AlertTriangle,
  Upload,
  X,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { geocodePlace, submitFloodReport } from "@/lib/api";

const SEVERITY_OPTIONS = [
  {
    id: "wet",
    label: "Slightly Wet",
    desc: "Puddles on footpath, road still passable",
    color: "border-yellow-400 bg-yellow-50",
    selected: "bg-yellow-400 border-yellow-500 text-white",
    emoji: "💧",
    cost: 10,
  },
  {
    id: "partial",
    label: "Partial Waterlog",
    desc: "Water on road, cars going slowly",
    color: "border-orange-400 bg-orange-50",
    selected: "bg-orange-500 border-orange-600 text-white",
    emoji: "🌊",
    cost: 50,
  },
  {
    id: "ankle",
    label: "Ankle Deep",
    desc: "~10-15cm — slows traffic significantly",
    color: "border-red-400 bg-red-50",
    selected: "bg-red-500 border-red-600 text-white",
    emoji: "🚨",
    cost: 200,
  },
  {
    id: "impassable",
    label: "Impassable",
    desc: ">30cm — road completely blocked",
    color: "border-red-800 bg-red-100",
    selected: "bg-red-900 border-red-900 text-white",
    emoji: "⛔",
    cost: 1000,
  },
];

export default function ReportPage() {
  const [severity, setSeverity] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verifiedCount, setVerifiedCount] = useState(1);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!severity || !location) return;
    setSubmitting(true);
    try {
      const resolved = await geocodePlace(location);
      const formData = new FormData();
      formData.append("lat", String(resolved.lat));
      formData.append("lng", String(resolved.lng));
      formData.append("severity", severity);
      formData.append("location", location);
      if (imageFile) formData.append("image", imageFile);

      const report = await submitFloodReport(formData);
      setVerifiedCount(report.reportCount ?? 1);
      setSubmitted(true);
    } catch (error) {
      console.error("Report submission failed:", error);
      alert(error instanceof Error ? error.message : "Report submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSeverity = SEVERITY_OPTIONS.find((s) => s.id === severity);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-flood-50 to-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 150 }}
            className="text-center max-w-sm"
          >
            <div className="w-24 h-24 bg-safe-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-14 h-14 text-safe-500" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3">Report Submitted!</h2>
            <p className="text-gray-600 text-lg mb-2">
              Your flood report has been validated.
            </p>
            {selectedSeverity && (
              <div className="bg-white rounded-2xl p-4 shadow-lg mb-6 text-left">
                <p className="text-sm text-gray-500 mb-2">Road cost updated</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">{selectedSeverity.emoji} {selectedSeverity.label}</span>
                  <span className="font-black text-2xl text-danger-600">+{selectedSeverity.cost}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  3 reports needed to verify. Current: <strong>{Math.min(verifiedCount, 3)} / 3</strong>
                </p>
                <div className="h-1.5 bg-gray-200 rounded-full mt-2">
                  <div
                    className="h-full bg-warning-500 rounded-full"
                    style={{ width: `${Math.min(verifiedCount, 3) * 33.33}%` }}
                  />
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500 mb-8">
              Thank you! Your report helps others navigate safely durante floods.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-flood-600 text-white font-bold py-3.5 rounded-xl"
                >
                  View Live Map
                </motion.button>
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSeverity("");
                  setLocation("");
                  setImageFile(null);
                  setImagePreview(null);
                  setVerifiedCount(1);
                }}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Submit Another Report
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-flood-50 to-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-flood-500 to-flood-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-flood">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Report a Flood</h1>
          <p className="text-gray-500 text-lg">
            Help your community navigate safely. 3 reports auto-verifies a zone.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Severity selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-flood-500" />
              Water Severity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SEVERITY_OPTIONS.map((opt) => (
                <motion.button
                  type="button"
                  key={opt.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSeverity(opt.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    severity === opt.id ? opt.selected : opt.color
                  }`}
                >
                  <span className="text-2xl mb-2 block">{opt.emoji}</span>
                  <p className={`font-bold text-sm ${severity === opt.id ? "text-white" : "text-gray-800"}`}>
                    {opt.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${severity === opt.id ? "text-white/80" : "text-gray-500"}`}>
                    {opt.desc}
                  </p>
                  <p className={`text-xs font-mono mt-1 font-bold ${severity === opt.id ? "text-white/90" : "text-gray-600"}`}>
                    Road Cost: +{opt.cost}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-flood-500" />
              Location
            </h2>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Street name / area (e.g. Park Street near Flurys)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-flood-500 focus:outline-none transition-colors text-sm"
              required
            />
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Timestamp will be auto-added
            </p>
          </motion.div>

          {/* Photo upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-flood-500" />
              Photo Evidence
              <span className="text-xs text-gray-400 font-normal ml-1">(Optional, but increases trust)</span>
            </h2>

            <AnimatePresence>
              {imagePreview ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative"
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-danger-600 text-white p-1.5 rounded-full hover:bg-danger-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => fileInput.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-flood-400 hover:bg-flood-50 transition-all"
                >
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700">
                    Tap to take photo or upload
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG — Max 10MB</p>
                </motion.div>
              )}
            </AnimatePresence>

            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />
          </motion.div>

          {/* Trust system info */}
          <div className="bg-flood-50 border border-flood-200 rounded-2xl p-5 flex items-start gap-3">
            <div className="w-10 h-10 bg-flood-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-flood-600" />
            </div>
            <div>
              <p className="font-bold text-flood-900 text-sm">Weighted Trust System</p>
              <p className="text-xs text-flood-700 mt-1">
                When 3 users in the same 50m radius report flooding, the road cost automatically 
                spikes and re-routing is triggered for all nearby users.
              </p>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!severity || !location || submitting}
            className="w-full bg-gradient-to-r from-danger-600 to-danger-700 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting Report…
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Flood Report
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
