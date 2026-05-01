// Flood report types
export interface FloodReport {
  id: string;
  coords: [number, number];
  severity: "dry" | "wet" | "partial" | "ankle" | "impassable";
  timestamp: Date;
  imageUrl?: string;
  cost: number;
  reportCount?: number;
  location?: string;
}

// Priority types
export interface Priority {
  id: string;
  name: string;
  score: number;
  icon: string;
  color: string;
  bgGradient: string;
  description: string;
  routeLogic: string;
}

// Route result
export interface RouteResult {
  distance: number; // km
  duration: number; // minutes
  waterDepth: number; // cm
  costScore: number;
  coordinates: [number, number][];
  avoidedZones: number;
  routeType: "golden" | "safe" | "buffer";
  mode?: "demo" | "live";
  floodActive?: boolean;
  explanation?: string;
}

// Severity config
export const SEVERITY_COLORS: Record<string, string> = {
  dry: "#22c55e",
  wet: "#eab308",
  partial: "#f59e0b",
  ankle: "#ef4444",
  impassable: "#991b1b",
};

export const SEVERITY_LABELS: Record<string, string> = {
  dry: "Dry Street",
  wet: "Slightly Wet",
  partial: "Partial Waterlog",
  ankle: "Ankle Deep (15cm)",
  impassable: "Impassable (>30cm)",
};

export const SEVERITY_COST: Record<string, number> = {
  dry: 1,
  wet: 10,
  partial: 50,
  ankle: 200,
  impassable: 1000,
};

// Mock flood data for Kolkata, India (demo coordinates)
export const MOCK_FLOOD_DATA: FloodReport[] = [
  {
    id: "1",
    coords: [88.3639, 22.5726],
    severity: "impassable",
    timestamp: new Date(Date.now() - 5 * 60000),
    cost: 1000,
    reportCount: 5,
    location: "Park Street crossing",
    imageUrl:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400&auto=format",
  },
  {
    id: "2",
    coords: [88.3492, 22.5584],
    severity: "ankle",
    timestamp: new Date(Date.now() - 12 * 60000),
    cost: 200,
    reportCount: 3,
    location: "Esplanade junction",
    imageUrl:
      "https://images.unsplash.com/photo-1581738731608-b7f170b83c0f?w=400&auto=format",
  },
  {
    id: "3",
    coords: [88.3785, 22.5454],
    severity: "partial",
    timestamp: new Date(Date.now() - 20 * 60000),
    cost: 50,
    reportCount: 2,
    location: "EM Bypass fork",
  },
  {
    id: "4",
    coords: [88.3950, 22.5890],
    severity: "wet",
    timestamp: new Date(Date.now() - 35 * 60000),
    cost: 10,
    reportCount: 1,
    location: "Salt Lake Sector V",
  },
  {
    id: "5",
    coords: [88.3310, 22.5810],
    severity: "dry",
    timestamp: new Date(Date.now() - 40 * 60000),
    cost: 1,
    reportCount: 2,
    location: "Uttarpara highway",
  },
  {
    id: "6",
    coords: [88.4120, 22.5650],
    severity: "ankle",
    timestamp: new Date(Date.now() - 8 * 60000),
    cost: 200,
    reportCount: 4,
    location: "Rajarhat Main Road",
  },
];

// Priority profiles
export const PRIORITIES: Priority[] = [
  {
    id: "emergency",
    name: "Medical Emergency",
    score: 5000,
    icon: "🚑",
    color: "text-red-600",
    bgGradient: "from-red-500 to-red-700",
    description: "Absolute shortest & driest path",
    routeLogic: "Golden Path — zero compromise",
  },
  {
    id: "essential",
    name: "Buy Medicine",
    score: 2000,
    icon: "💊",
    color: "text-orange-600",
    bgGradient: "from-orange-500 to-orange-700",
    description: "High-priority routing",
    routeLogic: "Fastest safe route available",
  },
  {
    id: "commute",
    name: "Office / School",
    score: 1000,
    icon: "💼",
    color: "text-blue-600",
    bgGradient: "from-blue-500 to-blue-700",
    description: "Safest path, even if 20% longer",
    routeLogic: "Optimized for safety & reliability",
  },
  {
    id: "delivery",
    name: "Food Delivery",
    score: 500,
    icon: "🛵",
    color: "text-green-600",
    bgGradient: "from-green-500 to-green-700",
    description: "Balanced route optimization",
    routeLogic: "Speed vs. safety balanced",
  },
  {
    id: "shopping",
    name: "Shopping",
    score: 200,
    icon: "🛍️",
    color: "text-purple-600",
    bgGradient: "from-purple-500 to-purple-700",
    description: "Alternative routes suggested",
    routeLogic: "Congestion-aware routing",
  },
  {
    id: "leisure",
    name: "Meetup / Hangout",
    score: 100,
    icon: "☕",
    color: "text-pink-600",
    bgGradient: "from-pink-500 to-pink-700",
    description: "Buffer routes away from critical roads",
    routeLogic: "Strategic load balancing",
  },
];

// Mock route data
export const MOCK_ROUTES: Record<string, RouteResult> = {
  emergency: {
    distance: 2.8,
    duration: 8,
    waterDepth: 0,
    costScore: 12,
    avoidedZones: 3,
    routeType: "golden",
    coordinates: [
      [22.5726, 88.3639],
      [22.575, 88.37],
      [22.578, 88.38],
      [22.572, 88.39],
    ],
  },
  essential: {
    distance: 3.2,
    duration: 11,
    waterDepth: 5,
    costScore: 45,
    avoidedZones: 2,
    routeType: "safe",
    coordinates: [
      [22.5726, 88.3639],
      [22.565, 88.355],
      [22.56, 88.36],
      [22.572, 88.39],
    ],
  },
  commute: {
    distance: 3.8,
    duration: 15,
    waterDepth: 8,
    costScore: 75,
    avoidedZones: 2,
    routeType: "safe",
    coordinates: [
      [22.5726, 88.3639],
      [22.555, 88.345],
      [22.548, 88.355],
      [22.572, 88.39],
    ],
  },
  delivery: {
    distance: 4.2,
    duration: 18,
    waterDepth: 12,
    costScore: 120,
    avoidedZones: 1,
    routeType: "buffer",
    coordinates: [
      [22.5726, 88.3639],
      [22.55, 88.34],
      [22.545, 88.36],
      [22.572, 88.39],
    ],
  },
  shopping: {
    distance: 5.1,
    duration: 22,
    waterDepth: 6,
    costScore: 90,
    avoidedZones: 1,
    routeType: "buffer",
    coordinates: [
      [22.5726, 88.3639],
      [22.54, 88.33],
      [22.538, 88.37],
      [22.572, 88.39],
    ],
  },
  leisure: {
    distance: 6.0,
    duration: 28,
    waterDepth: 3,
    costScore: 60,
    avoidedZones: 0,
    routeType: "buffer",
    coordinates: [
      [22.5726, 88.3639],
      [22.535, 88.325],
      [22.532, 88.375],
      [22.572, 88.39],
    ],
  },
};
