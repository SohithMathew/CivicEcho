# CivicEcho — AI-Powered Civic Intelligence Platform

CivicEcho is an end-to-end municipal civic intelligence platform connecting citizens directly with municipal departments through AI-assisted complaint triage, geospatial risk hotspot detection, multi-incident correlation, and automated work-order dispatching.

## Architecture

- **Frontend**: React 19 + Vite, Tailwind CSS, Leaflet Maps, Lucide Icons
- **Backend API**: FastAPI REST specification (implemented with Express full-stack middleware in dev and production)
- **Database Engine**: PostgreSQL relational schema & connection pooling
- **AI Engine**: Gemini 3.8 (`@google/genai`) for multi-modal damage diagnosis & cross-incident investigation
- **API Documentation**: Interactive Swagger UI (OpenAPI 3.0.2)

---

## Implemented Endpoints & Schemas

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Checks server running state |
| `GET` | `/health/db` | Verifies PostgreSQL connection & health |
| `GET` | `/api/complaints/` | Retrieves all complaints ordered by `created_at` DESC |
| `POST` | `/api/complaints/` | Submits a new citizen complaint with coordinates |
| `PATCH` | `/api/complaints/:id/status` | Updates verification & dispatch state |
| `POST` | `/api/complaints/analyze` | Multi-modal Gemini AI pre-scan triage |
| `GET` | `/api/risk-hotspots/` | Returns geospatial hazard clusters and compound indices |
| `POST` | `/api/investigations/run` | Autonomous Gemini cross-incident investigation |
| `GET` | `/api/reports/` | Municipal Operations Health audit |
| `GET` | `/api/openapi.json` | OpenAPI 3.0 specification for Swagger UI |

---

## Platform Modules

1. **Dashboard (`/`)**: System Overview showing Citizen Reports, Active Investigations, Risk Hotspots, and city resilience rating.
2. **Complaints (`/complaints`)**: Real-time complaint feed with search, category filters, photo evidence, AI hazard breakdown, and municipal status dispatch.
3. **Risk Map (`/risk-map`)**: Interactive Leaflet map with dark Carto tiles, urgency color-coded pins, 400m risk cluster radii, and click-to-pin report submission.
4. **AI Investigation (`/investigation`)**: Automated Gemini root-cause engine diagnosing cascading failures (e.g., water pipe washouts triggering road sinkholes).
5. **Civic Reports (`/reports`)**: Municipal audit summaries with export capabilities (JSON, CSV, printable format).
6. **FastAPI Swagger (`/docs`)**: Interactive Swagger UI allowing live execution of every endpoint.
