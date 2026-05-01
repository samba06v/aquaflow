import { FloodReport, RouteResult } from "@/lib/constants";

export const API_BASE =
  process.env.NEXT_PUBLIC_AQUAFLOW_API_URL ?? "http://127.0.0.1:8000";

export interface SectorRisk {
  id: string;
  name: string;
  center: [number, number];
  elevation_m: number;
  rainfall_mm_hr: number;
  risk_score: number;
  risk_level: "low" | "moderate" | "high";
  updated_at: string;
}

export interface GeocodeResult {
  name: string;
  lat: number;
  lng: number;
  country?: string;
  state?: string;
}

interface ApiFloodReport extends Omit<FloodReport, "timestamp"> {
  timestamp: string;
  verified?: boolean;
}

export async function fetchReports(): Promise<FloodReport[]> {
  const response = await fetch(`${API_BASE}/reports`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load live reports");
  const reports = (await response.json()) as ApiFloodReport[];
  return reports.map((report) => ({
    ...report,
    timestamp: new Date(report.timestamp),
  }));
}

export async function fetchSectors(): Promise<SectorRisk[]> {
  const response = await fetch(`${API_BASE}/sectors`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load risk sectors");
  return response.json();
}

export async function calculateRoute(input: {
  start: [number, number];
  end: [number, number];
  priority: number;
  mode?: "demo" | "live";
}): Promise<RouteResult> {
  const response = await fetch(`${API_BASE}/calculate-route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(`Routing failed with status ${response.status}`);
  return response.json();
}

export async function geocodePlace(query: string): Promise<GeocodeResult> {
  const response = await fetch(`${API_BASE}/geocode?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.detail ?? `Could not find "${query}". Try adding city and country.`);
  }
  return response.json();
}

export async function submitFloodReport(formData: FormData): Promise<FloodReport> {
  const response = await fetch(`${API_BASE}/report`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error(`Report failed with status ${response.status}`);
  const report = (await response.json()) as ApiFloodReport;
  return {
    ...report,
    timestamp: new Date(report.timestamp),
  };
}
