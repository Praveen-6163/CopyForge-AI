# CopyForge AI

CopyForge AI is a social-content workspace backed by a FastAPI service and PostgreSQL. The frontend is hosted at `https://copyforge-aiauto.netlify.app`; the configured API origin is `https://copyforge-ai-backend.onrender.com`. Provider credentials, OAuth tokens, content generation, persistence, and scheduled jobs belong on the backend.

## Features

- Generate and refine platform-specific content through the configured Google Gemini provider.
- Store generation history and structured copy fields in the backend database.
- Connect LinkedIn through LinkedIn OAuth; connect Instagram through Meta OAuth when the required app and permissions are configured.
- Retrieve dated articles from real RSS/Atom sources in Trend Radar.
- Generate and store images through the configured Google Gemini / Imagen provider.
- Save drafts, review approvals, schedule posts, and publish through supported platform APIs.
- Configure daily server-side content automation with auto-publish, approval-required, or draft-only modes.
- Show publishing records and report platform analytics as unavailable when no official analytics data is available.

## Backend configuration

Configure these values as backend environment variables. Do not add secrets to frontend build variables.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Render PostgreSQL connection URL. Required for persistent Render deployment. |
| `SECRET_KEY` | At least 32 random characters; used to protect OAuth tokens and sessions. |
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth application ID. |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth application secret. |
| `LINKEDIN_REDIRECT_URI` | `https://copyforge-ai-backend.onrender.com/auth/linkedin/callback` |
| `GEMINI_API_KEY` | Server-side content and image generation credentials (Google Gemini). |
| `GEMINI_MODEL` | Text-generation model; defaults to `gemini-2.5-flash`. |
| `GEMINI_IMAGE_MODEL` | Image-generation model; defaults to `imagen-3.0-generate-002`. |
| `META_APP_ID` | Meta application ID for Instagram Business Login. |
| `META_APP_SECRET` | Meta application secret. |
| `META_REDIRECT_URI` | `https://copyforge-ai-backend.onrender.com/auth/instagram/callback` |
| `FRONTEND_URL` | `https://copyforge-aiauto.netlify.app` |
| `PUBLIC_BACKEND_URL` | `https://copyforge-ai-backend.onrender.com`; public origin used for Instagram image fetching. |

Register each callback URL exactly in its provider console. Instagram publishing requires an eligible Instagram professional account, linked Facebook Page, approved Meta permissions, and successful app review where applicable. If Meta credentials are absent, the account page reports that the integration is not configured.

## Frontend deployment

Set the public frontend build variable `VITE_API_BASE_URL` to:

```text
https://copyforge-ai-backend.onrender.com
```

The value is an API origin and is not a secret. Redeploy the frontend after changing it. The application does not fall back to local generation or fabricated connected-account state when the backend is unavailable.

## Local development

Backend:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

For local use, configure the backend provider variables in an untracked backend `.env` file. The frontend Vite configuration proxies API requests to the local FastAPI service.

## Runtime behavior and availability

- The backend initializes tables and applies additive schema updates at startup. Production data must use PostgreSQL.
- LinkedIn OAuth establishes the CopyForge account identity; content and platform data are scoped to that account.
- Missing provider credentials are returned as explicit configuration errors. No API call is reported as successful unless the provider confirms it.
- Trend entries include their publisher, source URL, publication time when supplied by the feed, and retrieval time.
- The scheduler is server-side and checks persisted jobs while the backend process is running. Use a continuously available service instance for time-sensitive execution.
- Published engagement metrics are not fabricated. The interface reports when the official platform API does not provide analytics.

## Validation

Frontend production build:

```powershell
npm.cmd --prefix frontend run build
```

Backend verification:

```powershell
cd backend
python test_api.py
```
