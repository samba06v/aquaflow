import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

export function getRouteColor(routeType: string): string {
  switch (routeType) {
    case "golden": return "#22c55e";
    case "safe": return "#0ea5e9";
    case "buffer": return "#f59e0b";
    default: return "#0ea5e9";
  }
}

export function calcWeight(distance: number, roadCost: number, priority: number): number {
  return (distance * roadCost) - priority;
}
