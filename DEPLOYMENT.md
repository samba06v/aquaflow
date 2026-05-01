# AquaFlow Deployment Guide

This document outlines how to deploy AquaFlow to production using Vercel (frontend) and Railway (backend).

## Architecture

- **Frontend**: Next.js application deployed on Vercel
- **Backend**: FastAPI application deployed on Railway
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage

## Prerequisites

Before deploying, ensure you have:

1. A GitHub account with this repository
2. A Vercel account (free tier available at vercel.com)
3. A Railway account (free tier available at railway.app)
4. Supabase account and project created (free tier available at supabase.com)
5. OpenWeather API key (optional, for weather data)

## Step 1: Configure Environment Variables

### Backend (Railway)

Set these environment variables in your Railway project:

```
OPENWEATHER_API_KEY=your_openweather_api_key
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=flood-reports
APP_CORS_ORIGINS=https://your-vercel-frontend-url.vercel.app
```

Get your Supabase credentials from:
- Supabase Dashboard → Project Settings → API → URL and Service Role Key

### Frontend (Vercel)

Set these environment variables in your Vercel project:

```
NEXT_PUBLIC_AQUAFLOW_API_URL=https://your-railway-backend-url.railway.app
```

## Step 2: Deploy Backend on Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select this repository
4. In the Project Settings:
   - Service name: `aquaflow-backend`
   - Select "Python" as the service type
   - Set the following in Railway Environment:
     - Add all the environment variables listed above
5. Railway will automatically detect `railway.toml` and deploy using those settings
6. Once deployed, copy your Railway app URL (e.g., `https://your-app.railway.app`)

## Step 3: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" → "Import Git Repository"
3. Select this GitHub repository
4. In Project Settings:
   - Root Directory: `frontend/floodflow`
   - Add the environment variable:
     ```
     NEXT_PUBLIC_AQUAFLOW_API_URL=https://your-railway-backend-url.railway.app
     ```
5. Click "Deploy"
6. Once deployed, copy your Vercel app URL (e.g., `https://your-app.vercel.app`)

## Step 4: Update Backend CORS Origins

After deploying the frontend, update the backend's `APP_CORS_ORIGINS` environment variable in Railway to include your Vercel URL:

```
APP_CORS_ORIGINS=https://your-app.vercel.app
```

Redeploy the backend for changes to take effect.

## Step 5: Configure Supabase (Optional)

If using Supabase for reports storage:

1. Create a new project on [supabase.com](https://supabase.com)
2. Go to Project Settings → API → Copy your:
   - Project URL
   - Service Role Key (anon key for frontend, service role for backend)
3. Create a storage bucket named `flood-reports`
4. Set the environment variables in both Railway and Vercel

## Verification

### Test Backend Health

Visit: `https://your-railway-backend-url.railway.app/health`

Expected response:
```json
{
  "status": "ok",
  "supabase": true,
  "openweather": true
}
```

### Test Frontend

Visit your Vercel URL and verify:
- The application loads without errors
- The map displays correctly
- API calls to the backend succeed

## Troubleshooting

### Frontend showing blank or errors

1. Check browser console for errors
2. Verify `NEXT_PUBLIC_AQUAFLOW_API_URL` is correctly set in Vercel
3. Check that the backend URL is accessible and CORS is configured

### Backend returning 403 errors

1. Verify `APP_CORS_ORIGINS` includes your Vercel frontend URL
2. Check CORS middleware configuration in `backend/app/main.py`
3. Ensure you've redeployed the backend after changing CORS settings

### Database connection issues

1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
2. Check that your Supabase project is active
3. Verify the `flood-reports` storage bucket exists

## Local Development

To test locally before deploying:

```bash
# Install dependencies
cd backend && pip install -r requirements.txt
cd ../frontend/floodflow && npm install

# Create .env files
cp backend/.env.example backend/.env
cp frontend/floodflow/.env.example frontend/floodflow/.env.local

# Start backend (port 8000)
cd backend && python -m uvicorn app.main:app --reload

# Start frontend (port 3000) - in another terminal
cd frontend/floodflow && npm run dev
```

Visit `http://localhost:3000` and verify everything works.

## Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Next.js Documentation](https://nextjs.org/docs)
