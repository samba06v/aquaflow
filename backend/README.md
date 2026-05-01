# AquaFlow Backend

FastAPI service for the AquaFlow MVP:

- live flood-risk sectors from OpenWeather rainfall plus elevation
- crowdsourced flood reports with photo upload support
- consensus verification when 3 reports occur within 100m in 60 minutes
- live road-cost feed for the routing engine
- priority-aware routing that demonstrates Golden, Safe, and Buffer routes

## Run

```powershell
cd aquaflow/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

The app works without keys using seeded demo data. For actual API mode, create `.env` from `.env.example`, then add:

- `OPENWEATHER_API_KEY` for global place search and live rainfall.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for report storage and photo uploads.

Run `supabase/schema.sql` in Supabase SQL Editor before using Supabase persistence. Create a public Storage bucket named `flood-reports`, or change `SUPABASE_STORAGE_BUCKET`.

Routing uses OSRM/OpenStreetMap for real roads when the machine has internet access. If OSRM is unavailable, AquaFlow falls back to the local demo route engine.

## Key Endpoints

- `GET /health`
- `GET /sectors`
- `GET /geocode?q=London`
- `GET /weather-risk?lat=51.5072&lng=-0.1276`
- `GET /reports`
- `POST /report`
- `GET /admin/gallery`
- `GET /live-costs`
- `POST /calculate-route`

Open the API docs at `http://127.0.0.1:8000/docs`.
