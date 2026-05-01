from __future__ import annotations

from datetime import datetime, timezone
import os
import tempfile
from typing import Iterable

import requests
from fastapi import UploadFile

from .data import REPORTS, ROADS, SECTORS, SEVERITY_DEPTH, count_nearby_reports, haversine_m, live_costs, now_iso
from .models import RouteMode, RouteResponse
from .settings import get_settings


OPENWEATHER_GEOCODE_URL = "https://api.openweathermap.org/geo/1.0/direct"
OPENWEATHER_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
OSRM_ROUTE_URL = "https://router.project-osrm.org/route/v1/driving"


def refresh_sector_risk() -> list:
    settings = get_settings()
    for sector in SECTORS:
        rainfall = sector.rainfall_mm_hr
        if settings.openweather_api_key:
            try:
                response = requests.get(
                    OPENWEATHER_WEATHER_URL,
                    params={
                        "lat": sector.center[0],
                        "lon": sector.center[1],
                        "appid": settings.openweather_api_key,
                        "units": "metric",
                    },
                    timeout=6,
                )
                response.raise_for_status()
                payload = response.json()
                rain = payload.get("rain") or {}
                rainfall = float(rain.get("1h") or rain.get("3h") or 0)
            except requests.RequestException:
                rainfall = sector.rainfall_mm_hr

        if rainfall == 0:
            rainfall = {"sector-v": 14.0, "city-centre": 7.5, "nicco": 11.0, "wipro": 9.0}.get(sector.id, 5.0)

        risk_score = rainfall / max(sector.elevation_m, 1)
        if risk_score > 3:
            risk_level = "high"
        elif risk_score > 1.5:
            risk_level = "moderate"
        else:
            risk_level = "low"

        sector.rainfall_mm_hr = round(rainfall, 2)
        sector.risk_score = round(risk_score, 2)
        sector.risk_level = risk_level
        sector.updated_at = now_iso()
    return SECTORS


def geocode_place(query: str) -> dict:
    settings = get_settings()
    cleaned_query = _humanize_place_query(query)
    if not settings.openweather_api_key:
        known = {
            "wipro": {"name": "Wipro More", "lat": 22.5740, "lng": 88.4335, "country": "IN", "state": "West Bengal"},
            "nicco": {"name": "Nicco Park", "lat": 22.5714, "lng": 88.4215, "country": "IN", "state": "West Bengal"},
            "garden reach": {"name": "Garden Reach", "lat": 22.5465, "lng": 88.2856, "country": "IN", "state": "West Bengal"},
            "sector 5": {"name": "Salt Lake Sector V", "lat": 22.5799, "lng": 88.4332, "country": "IN", "state": "West Bengal"},
            "sector v": {"name": "Salt Lake Sector V", "lat": 22.5799, "lng": 88.4332, "country": "IN", "state": "West Bengal"},
        }
        lowered = cleaned_query.lower()
        for key, value in known.items():
            if key in lowered:
                return value
        nominatim = _nominatim_geocode(cleaned_query) or _nominatim_geocode(f"{cleaned_query}, Kolkata, India")
        if nominatim:
            return nominatim
        return {"name": cleaned_query, "lat": 22.5726, "lng": 88.3639, "country": "IN", "state": "West Bengal"}

    result = _openweather_geocode(cleaned_query, settings.openweather_api_key)
    if not result:
        result = _openweather_geocode(f"{cleaned_query}, Kolkata, IN", settings.openweather_api_key)
    if not result:
        result = _nominatim_geocode(cleaned_query) or _nominatim_geocode(f"{cleaned_query}, Kolkata, India")
    if not result:
        raise ValueError(f"No location found for {cleaned_query}. Try adding city and country, like '{cleaned_query}, Kolkata, India'.")
    return result


def _openweather_geocode(query: str, api_key: str) -> dict | None:
    try:
        response = requests.get(
            OPENWEATHER_GEOCODE_URL,
            params={"q": query, "limit": 1, "appid": api_key},
            timeout=8,
        )
        response.raise_for_status()
    except requests.RequestException:
        return None
    results = response.json()
    if not results:
        return None
    result = results[0]
    return {
        "name": result.get("name", query),
        "lat": float(result["lat"]),
        "lng": float(result["lon"]),
        "country": result.get("country"),
        "state": result.get("state"),
    }


def _nominatim_geocode(query: str) -> dict | None:
    try:
        response = requests.get(
            NOMINATIM_SEARCH_URL,
            params={"q": query, "format": "jsonv2", "limit": 1, "addressdetails": 1},
            headers={"User-Agent": "AquaFlowHackathon/0.1"},
            timeout=10,
        )
        response.raise_for_status()
    except requests.RequestException:
        return None
    results = response.json()
    if not results:
        return None
    result = results[0]
    address = result.get("address") or {}
    return {
        "name": result.get("display_name", query).split(",")[0],
        "lat": float(result["lat"]),
        "lng": float(result["lon"]),
        "country": address.get("country_code", "").upper() or address.get("country"),
        "state": address.get("state"),
    }


def _humanize_place_query(query: str) -> str:
    stripped = " ".join(query.strip().split())
    if " " in stripped:
        return stripped
    chars = []
    for index, char in enumerate(stripped):
        if index and char.isupper() and stripped[index - 1].islower():
            chars.append(" ")
        chars.append(char)
    return "".join(chars)


def weather_risk_for_point(lat: float, lng: float, elevation_m: float = 8.0) -> dict:
    settings = get_settings()
    rainfall = 0.0
    weather = "Demo rainfall"

    if settings.openweather_api_key:
        response = requests.get(
            OPENWEATHER_WEATHER_URL,
            params={"lat": lat, "lon": lng, "appid": settings.openweather_api_key, "units": "metric"},
            timeout=8,
        )
        response.raise_for_status()
        payload = response.json()
        rain = payload.get("rain") or {}
        rainfall = float(rain.get("1h") or rain.get("3h") or 0)
        weather_items = payload.get("weather") or []
        weather = weather_items[0].get("description", "Live weather") if weather_items else "Live weather"
    else:
        rainfall = 10.0

    risk_score = rainfall / max(elevation_m, 1)
    risk_level = "high" if risk_score > 3 else "moderate" if risk_score > 1.5 else "low"
    return {
        "lat": lat,
        "lng": lng,
        "rainfall_mm_hr": round(rainfall, 2),
        "elevation_m": elevation_m,
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "weather": weather,
    }


def upload_report_image(file: UploadFile | None) -> str | None:
    if not file:
        return None

    settings = get_settings()
    suffix = os.path.splitext(file.filename or "report.jpg")[1] or ".jpg"
    object_name = f"reports/{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{next(tempfile._get_candidate_names())}{suffix}"
    content = file.file.read()

    if settings.supabase_enabled:
        upload_url = f"{settings.supabase_url}/storage/v1/object/{settings.supabase_storage_bucket}/{object_name}"
        response = requests.post(
            upload_url,
            headers={
                "apikey": settings.supabase_service_role_key,
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "Content-Type": file.content_type or "application/octet-stream",
            },
            data=content,
            timeout=15,
        )
        if response.ok:
            return f"{settings.supabase_url}/storage/v1/object/public/{settings.supabase_storage_bucket}/{object_name}"

    return None


def persist_report_to_supabase(report) -> None:
    settings = get_settings()
    if not settings.supabase_enabled:
        return

    payload = {
        "id": report.id,
        "location": f"POINT({report.coords[0]} {report.coords[1]})",
        "lat": report.coords[1],
        "lng": report.coords[0],
        "location_label": report.location,
        "image_url": report.imageUrl,
        "severity": report.severity,
        "water_depth": SEVERITY_DEPTH.get(report.severity, 0),
        "cost": report.cost,
        "verified": report.verified,
    }
    try:
        requests.post(
            f"{settings.supabase_url}/rest/v1/user_reports",
            headers={
                "apikey": settings.supabase_service_role_key,
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            },
            json=payload,
            timeout=8,
        )
    except requests.RequestException:
        return


def fetch_reports_from_supabase() -> list | None:
    settings = get_settings()
    if not settings.supabase_enabled:
        return None

    try:
        response = requests.get(
            f"{settings.supabase_url}/rest/v1/user_reports",
            headers={
                "apikey": settings.supabase_service_role_key,
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
            },
            params={
                "select": "id,created_at,lat,lng,severity,cost,location_label,image_url,verified",
                "order": "created_at.desc",
                "limit": "25",
            },
            timeout=8,
        )
        response.raise_for_status()
    except requests.RequestException:
        return None

    from .models import FloodReportOut

    reports = []
    for item in response.json():
        reports.append(
            FloodReportOut(
                id=item["id"],
                coords=(float(item["lng"]), float(item["lat"])),
                severity=item["severity"],
                timestamp=item["created_at"],
                imageUrl=item.get("image_url"),
                cost=int(item.get("cost") or 1),
                reportCount=3 if item.get("verified") else 1,
                location=item.get("location_label"),
                verified=bool(item.get("verified")),
            )
        )
    return reports


def route_type_for_priority(priority: int) -> str:
    if priority >= 4000:
        return "golden"
    if priority >= 750:
        return "safe"
    return "buffer"


def calculate_route(start: tuple[float, float], end: tuple[float, float], priority: int, mode: RouteMode = "demo") -> RouteResponse:
    flood_active = True if mode == "demo" else _is_live_flood_active(start, end)
    effective_priority = priority if flood_active else 1000

    osrm_route = _calculate_osrm_route(start, end, effective_priority, mode=mode, flood_active=flood_active)
    if osrm_route:
        return osrm_route

    route_type = route_type_for_priority(effective_priority)
    candidates = _candidate_routes(start, end)
    costs = {item.road_id: item for item in live_costs()}

    scored = []
    for candidate in candidates:
        distance_m = _polyline_distance(candidate["coordinates"])
        max_cost = max(costs[road_id].cost for road_id in candidate["roads"])
        flooded_edges = sum(1 for road_id in candidate["roads"] if costs[road_id].cost > 25)
        load_penalty = 1.0
        if effective_priority < 750:
            overloaded = sum(1 for road_id in candidate["roads"] if costs[road_id].load >= costs[road_id].capacity)
            load_penalty += overloaded * 0.65
        elif effective_priority >= 4000:
            load_penalty = 0.75
        safety_penalty = max_cost if effective_priority >= 750 else max(max_cost * 0.6, 1)
        score = (distance_m / 1000) * safety_penalty * load_penalty - (effective_priority / 1000)
        scored.append((score, candidate, distance_m, max_cost, flooded_edges))

    _, best, distance_m, max_cost, flooded_edges = min(scored, key=lambda item: item[0])
    duration = max(3, round((distance_m / 1000) / 24 * 60 * (1 + min(max_cost, 200) / 450), 1))
    cost_score = int(round((distance_m / 1000) * max(max_cost, 1)))
    water_depth = max(SEVERITY_DEPTH["partial"] if max_cost >= 50 else 0, SEVERITY_DEPTH["ankle"] if max_cost >= 200 else 0)

    if route_type == "buffer" and best["name"] == "Golden Path":
        best = candidates[-1]
        distance_m = _polyline_distance(best["coordinates"])
        duration = round((distance_m / 1000) / 22 * 60, 1)
        cost_score = max(60, cost_score)

    explanation = {
        "golden": "Emergency priority reserved the shortest driest path.",
        "safe": "Route avoids high-cost roads while staying reasonably direct.",
        "buffer": "Low-priority traffic is nudged to a safe secondary route to reduce the herd effect.",
    }[route_type]

    if mode == "live" and not flood_active:
        explanation = "Live weather is dry and no verified flood reports are active, so AquaFlow returns the normal fastest route for every priority."

    return RouteResponse(
        coordinates=best["coordinates"],
        distance=round(distance_m / 1000, 2),
        duration=duration,
        costScore=cost_score,
        waterDepth=water_depth,
        avoidedZones=flooded_edges,
        routeType=route_type,
        mode=mode,
        floodActive=flood_active,
        explanation=explanation,
    )


def _calculate_osrm_route(
    start: tuple[float, float],
    end: tuple[float, float],
    priority: int,
    mode: RouteMode,
    flood_active: bool,
) -> RouteResponse | None:
    route_type = route_type_for_priority(priority)
    points = [start, end]

    # Low priority users get a small buffer waypoint to demonstrate herd-effect mitigation.
    if flood_active and route_type == "buffer":
        mid_lat = (start[0] + end[0]) / 2
        mid_lng = (start[1] + end[1]) / 2
        points = [start, (mid_lat - 0.01, mid_lng + 0.01), end]

    coord_string = ";".join(f"{lng},{lat}" for lat, lng in points)
    try:
        response = requests.get(
            f"{OSRM_ROUTE_URL}/{coord_string}",
            params={"overview": "full", "geometries": "geojson", "alternatives": "false", "steps": "false"},
            timeout=12,
        )
        response.raise_for_status()
        payload = response.json()
        route = payload["routes"][0]
    except (requests.RequestException, KeyError, IndexError):
        return None

    coordinates = [(lat, lng) for lng, lat in route["geometry"]["coordinates"]]
    distance_km = route["distance"] / 1000
    duration_min = route["duration"] / 60
    priority_bonus = 0 if route_type == "golden" else 20 if route_type == "safe" else 55
    cost_score = int(distance_km * 10 + priority_bonus)
    explanation = {
        "golden": "OSM route with emergency priority and no artificial detour.",
        "safe": "OSM route balanced with flood-aware priority scoring.",
        "buffer": "OSM route includes a buffer waypoint to distribute low-priority traffic.",
    }[route_type]

    if mode == "live" and not flood_active:
        route_type = "safe"
        priority_bonus = 0
        cost_score = int(distance_km * 10)
        explanation = "Live weather is dry and no verified flood reports are active, so AquaFlow returns the normal fastest route for every priority."

    return RouteResponse(
        coordinates=coordinates,
        distance=round(distance_km, 2),
        duration=round(duration_min, 1),
        costScore=cost_score,
        waterDepth=0,
        avoidedZones=0,
        routeType=route_type,
        mode=mode,
        floodActive=flood_active,
        explanation=explanation,
    )


def _is_live_flood_active(start: tuple[float, float], end: tuple[float, float]) -> bool:
    settings = get_settings()
    weather_active = False
    if settings.openweather_api_key:
        weather_active = _live_weather_active_at(start) or _live_weather_active_at(end)

    verified_reports_active = any(report.verified for report in fetch_reports_from_supabase() or [])
    local_reports_active = any(
        not str(report["id"]).startswith("seed-")
        and (report.get("verified") or (report["cost"] >= 200 and count_nearby_reports(report["lat"], report["lng"]) >= 3))
        for report in REPORTS
    )
    return weather_active or verified_reports_active or local_reports_active


def _live_weather_active_at(point: tuple[float, float], elevation_m: float = 8.0) -> bool:
    settings = get_settings()
    try:
        response = requests.get(
            OPENWEATHER_WEATHER_URL,
            params={"lat": point[0], "lon": point[1], "appid": settings.openweather_api_key, "units": "metric"},
            timeout=8,
        )
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException:
        return False

    rain = payload.get("rain") or {}
    rainfall = float(rain.get("1h") or rain.get("3h") or 0)
    risk_score = rainfall / max(elevation_m, 1)
    return risk_score > 1.5


def _candidate_routes(start: tuple[float, float], end: tuple[float, float]) -> list[dict]:
    mid_lat = (start[0] + end[0]) / 2
    mid_lng = (start[1] + end[1]) / 2
    return [
        {
            "name": "Golden Path",
            "roads": ["technopolis-main", "city-centre-arterial"],
            "coordinates": [start, (mid_lat + 0.002, mid_lng + 0.001), end],
        },
        {
            "name": "Safe Route",
            "roads": ["sector-v-bypass", "wetland-buffer"],
            "coordinates": [start, (start[0] - 0.004, start[1] - 0.002), (mid_lat - 0.002, mid_lng - 0.003), end],
        },
        {
            "name": "Buffer Route",
            "roads": ["wetland-buffer", "nicco-link"],
            "coordinates": [start, (start[0] - 0.008, start[1] - 0.006), (end[0] - 0.006, end[1] - 0.004), end],
        },
    ]


def _polyline_distance(points: Iterable[tuple[float, float]]) -> float:
    point_list = list(points)
    return sum(haversine_m(a, b) for a, b in zip(point_list, point_list[1:]))
