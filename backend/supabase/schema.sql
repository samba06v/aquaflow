create extension if not exists postgis;

create table if not exists city_sectors (
  id text primary key,
  name text not null,
  center geography(point, 4326) not null,
  elevation_m numeric not null,
  rainfall_mm_hr numeric not null default 0,
  risk_score numeric not null default 0,
  risk_level text not null default 'low',
  updated_at timestamptz not null default now()
);

create table if not exists road_segments (
  id text primary key,
  name text not null,
  geom geography(linestring, 4326),
  current_cost integer not null default 1,
  current_load integer not null default 0,
  capacity integer not null default 30,
  updated_at timestamptz not null default now()
);

create table if not exists user_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  location geography(point, 4326) not null,
  lat numeric not null,
  lng numeric not null,
  location_label text,
  image_url text,
  severity text not null,
  water_depth integer not null,
  cost integer not null,
  road_id text references road_segments(id),
  verified boolean not null default false
);

create index if not exists user_reports_location_idx on user_reports using gist(location);
create index if not exists road_segments_geom_idx on road_segments using gist(geom);

create or replace function nearby_report_count(lng numeric, lat numeric, meters integer)
returns integer
language sql
stable
as $$
  select count(*)::integer
  from user_reports
  where created_at > now() - interval '60 minutes'
    and st_dwithin(location, st_setsrid(st_makepoint(lng, lat), 4326)::geography, meters);
$$;
