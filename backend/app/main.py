from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .data import REPORTS, add_report, live_costs, report_to_out
from .models import RouteRequest
from .services import (
    calculate_route,
    fetch_reports_from_supabase,
    geocode_place,
    persist_report_to_supabase,
    refresh_sector_risk,
    upload_report_image,
    weather_risk_for_point,
)
from .settings import get_settings


settings = get_settings()
app = FastAPI(title="AquaFlow API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "supabase": settings.supabase_enabled,
        "openweather": bool(settings.openweather_api_key),
    }


@app.get("/sectors")
def get_sectors():
    return refresh_sector_risk()


@app.get("/reports")
def get_reports():
    supabase_reports = fetch_reports_from_supabase()
    if supabase_reports is not None:
        return supabase_reports
    return [report_to_out(report) for report in REPORTS[:25]]


@app.get("/geocode")
def geocode(q: str):
    try:
        return geocode_place(q)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.get("/weather-risk")
def weather_risk(lat: float, lng: float, elevation_m: float = 8.0):
    return weather_risk_for_point(lat, lng, elevation_m)


@app.post("/report")
def create_report(
    lat: float = Form(...),
    lng: float = Form(...),
    severity: str = Form(...),
    location: str | None = Form(None),
    image: UploadFile | None = File(None),
):
    image_url = upload_report_image(image)
    report = add_report(lat=lat, lng=lng, severity=severity, location=location, image_url=image_url)
    persist_report_to_supabase(report)
    return report


@app.get("/admin/gallery")
def gallery():
    reports = [report_to_out(report) for report in REPORTS if report.get("image_url")]
    return reports[:10]


@app.get("/live-costs")
def get_live_costs():
    return live_costs()


@app.post("/calculate-route")
def route(request: RouteRequest):
    return calculate_route(request.start, request.end, request.priority, request.mode)
