from pydantic import BaseModel, Field
from typing import Literal


Severity = Literal["dry", "wet", "partial", "ankle", "impassable"]
RouteType = Literal["golden", "safe", "buffer"]
RiskLevel = Literal["low", "moderate", "high"]
RouteMode = Literal["demo", "live"]


class Sector(BaseModel):
    id: str
    name: str
    center: tuple[float, float]  # [lat, lng]
    elevation_m: float
    rainfall_mm_hr: float = 0
    risk_score: float = 0
    risk_level: RiskLevel = "low"
    updated_at: str


class FloodReportOut(BaseModel):
    id: str
    coords: tuple[float, float]  # [lng, lat] for the Leaflet frontend report layer
    severity: Severity
    timestamp: str
    imageUrl: str | None = None
    cost: int
    reportCount: int = 1
    location: str | None = None
    verified: bool = False


class LiveCost(BaseModel):
    road_id: str
    cost: int
    load: int = 0
    capacity: int = 30


class RouteRequest(BaseModel):
    start: tuple[float, float] = Field(..., description="[lat, lng]")
    end: tuple[float, float] = Field(..., description="[lat, lng]")
    priority: int = 1000
    mode: RouteMode = "demo"


class RouteResponse(BaseModel):
    coordinates: list[tuple[float, float]]  # [lat, lng]
    distance: float
    duration: float
    costScore: int
    waterDepth: int
    avoidedZones: int
    routeType: RouteType
    mode: RouteMode = "demo"
    floodActive: bool = True
    explanation: str
