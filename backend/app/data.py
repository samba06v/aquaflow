from datetime import datetime, timezone, timedelta
from math import asin, cos, radians, sin, sqrt
from uuid import uuid4

from .models import FloodReportOut, LiveCost, Sector


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def haversine_m(a: tuple[float, float], b: tuple[float, float]) -> float:
    lat1, lng1 = a
    lat2, lng2 = b
    radius = 6_371_000
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    x = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    return 2 * radius * asin(sqrt(x))


SEVERITY_COST = {
    "dry": 1,
    "wet": 10,
    "partial": 50,
    "ankle": 200,
    "impassable": 1000,
}

SEVERITY_DEPTH = {
    "dry": 0,
    "wet": 3,
    "partial": 8,
    "ankle": 15,
    "impassable": 35,
}

SECTORS: list[Sector] = [
    Sector(id="sector-v", name="Salt Lake Sector V", center=(22.5799, 88.4332), elevation_m=7.0, rainfall_mm_hr=0, updated_at=now_iso()),
    Sector(id="city-centre", name="City Centre Salt Lake", center=(22.5857, 88.4147), elevation_m=8.2, rainfall_mm_hr=0, updated_at=now_iso()),
    Sector(id="nicco", name="Nicco Park", center=(22.5714, 88.4215), elevation_m=6.4, rainfall_mm_hr=0, updated_at=now_iso()),
    Sector(id="wipro", name="Wipro More", center=(22.5740, 88.4335), elevation_m=6.8, rainfall_mm_hr=0, updated_at=now_iso()),
]

ROADS: dict[str, dict] = {
    "technopolis-main": {"name": "Technopolis Main Road", "cost": 1, "load": 12, "capacity": 40},
    "sector-v-bypass": {"name": "Sector V Bypass", "cost": 1, "load": 18, "capacity": 35},
    "nicco-link": {"name": "Nicco Link Road", "cost": 50, "load": 8, "capacity": 30},
    "city-centre-arterial": {"name": "City Centre Arterial", "cost": 1, "load": 34, "capacity": 32},
    "wetland-buffer": {"name": "Wetland Buffer Route", "cost": 10, "load": 5, "capacity": 25},
}

REPORTS: list[dict] = [
    {
        "id": "seed-1",
        "lat": 22.5799,
        "lng": 88.4332,
        "severity": "partial",
        "cost": 50,
        "location": "Salt Lake Sector V",
        "image_url": None,
        "created_at": datetime.now(timezone.utc) - timedelta(minutes=9),
        "verified": False,
        "road_id": "technopolis-main",
    },
    {
        "id": "seed-2",
        "lat": 22.5714,
        "lng": 88.4215,
        "severity": "ankle",
        "cost": 200,
        "location": "Nicco Park approach",
        "image_url": None,
        "created_at": datetime.now(timezone.utc) - timedelta(minutes=16),
        "verified": True,
        "road_id": "nicco-link",
    },
]


def nearest_road_id(lat: float, lng: float) -> str:
    if lng > 88.429:
        return "technopolis-main"
    if lat < 22.575:
        return "nicco-link"
    return "city-centre-arterial"


def count_nearby_reports(lat: float, lng: float, meters: int = 100) -> int:
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=60)
    return sum(
        1
        for report in REPORTS
        if report["created_at"] > cutoff and haversine_m((lat, lng), (report["lat"], report["lng"])) <= meters
    )


def add_report(
    *,
    lat: float,
    lng: float,
    severity: str,
    location: str | None,
    image_url: str | None,
) -> FloodReportOut:
    road_id = nearest_road_id(lat, lng)
    cost = SEVERITY_COST.get(severity, 50)
    report = {
        "id": str(uuid4()),
        "lat": lat,
        "lng": lng,
        "severity": severity,
        "cost": cost,
        "location": location,
        "image_url": image_url,
        "created_at": datetime.now(timezone.utc),
        "verified": False,
        "road_id": road_id,
    }
    REPORTS.insert(0, report)
    nearby_count = count_nearby_reports(lat, lng, 100)
    if nearby_count >= 3:
        report["verified"] = True
        ROADS[road_id]["cost"] = max(ROADS[road_id]["cost"], cost)
    return report_to_out(report, nearby_count)


def report_to_out(report: dict, count: int | None = None) -> FloodReportOut:
    nearby_count = count if count is not None else count_nearby_reports(report["lat"], report["lng"], 100)
    return FloodReportOut(
        id=report["id"],
        coords=(report["lng"], report["lat"]),
        severity=report["severity"],
        timestamp=report["created_at"].isoformat(),
        imageUrl=report["image_url"],
        cost=report["cost"],
        reportCount=nearby_count,
        location=report["location"],
        verified=bool(report["verified"] or nearby_count >= 3),
    )


def live_costs() -> list[LiveCost]:
    return [
        LiveCost(road_id=road_id, cost=road["cost"], load=road["load"], capacity=road["capacity"])
        for road_id, road in ROADS.items()
    ]
