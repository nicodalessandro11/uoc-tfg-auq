# Are U Query-ous? — Backend API Documentation

This document serves as a **complete technical reference** and **implementation blueprint** for the backend of the Are U Query-ous? project. It outlines the backend structure, roles of each component, expected endpoints, and the overall development workflow.

---

## 📁 Project Structure

```
ARE-U-QUERY-OUS/
├── backend/
│   ├── app/
│   │   ├── api/               # API route definitions
│   │   ├── core/              # Config, security, logging
│   │   ├── db/                # Database models and access (repository)
│   │   ├── schemas/           # Pydantic data models
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utilities and helpers
│   │   └── middleware.py      # Custom exception handling
│   ├── migrations/            # Alembic migrations (if needed)
│   ├── Dockerfile             # Backend container build file
│   ├── .env                   # Environment configuration
│   ├── requirements.txt       # Backend dependencies
│   └── tests/                 # Unit and integration tests
├── docker-compose.yml         # Full stack (frontend + backend + optional db)
├── Makefile                   # Developer commands
└── README.md                  # Main documentation
```

---

## 🧠 Architectural Overview

The backend follows a **layered and modular architecture**, where each layer handles a specific responsibility:

### 1. API Layer (`app/api/`)
- Defines RESTful endpoints using FastAPI.
- Parses incoming requests (query/body params).
- Delegates to the service layer.

### 2. Service Layer (`app/services/`)
- Orchestrates business logic.
- May combine multiple repositories.
- Ensures validation and control flow.

### 3. Repository Layer (`app/db/repository/`)
- Interacts with the database or Supabase API.
- Encapsulates raw data access logic.
- Returns domain data to the services.

### 4. Schemas Layer (`app/schemas/`)
- Contains Pydantic models for validation and serialization.
- Ensures input/output data is well-structured and documented.

### 5. Configuration & Utilities
- `core/config.py`: Loads environment variables.
- `core/security.py`: Auth handling.
- `utils/logger.py`: Standard logging wrapper.
- `middleware.py`: Exception handling and consistent error responses.

---

## 🔁 Request Lifecycle Example

> Request: `GET /indicators?geo_level=district&geo_id=3`

1. `indicators.py` receives the route request.
2. Calls `indicator_service.py` with query parameters.
3. Service calls `indicator_repo.py` to retrieve data.
4. Data is validated with `IndicatorResponse` schema.
5. Returns a JSON response with proper structure and docs.

---

## 🧩 API Layer: Endpoint Design

### `/indicators` – GET
**Description:** Fetch indicators based on filters.

Query Parameters:
- `city_id`: optional
- `geo_level`: `district` | `neighbourhood`
- `geo_id`: required
- `indicator`: name of the indicator
- `year`: optional

Returns:
```json
{
  "indicator": "income",
  "value": 28100,
  "unit": "€",
  "year": 2023,
  "geo_name": "Arganzuela"
}
```

---

## 📦 Supabase Integration

If using Supabase:
- Set `SUPABASE_DB_URL` in `.env`
- Use Supabase Python SDK in `repository` layer
- Skip Alembic migrations (managed by Supabase dashboard)

---

## 🧪 Testing Guidelines

- Tests live in `/tests/` folder.
- Use `pytest` as test runner.
- Each service and repository should have unit tests.
- Use mocking to simulate Supabase/API calls.

---

## ⚙️ Developer Workflow

1. Clone project and create `.env` file
2. Run `make dev` to start stack with Docker
3. Visit API documentation at `http://localhost:8000/docs`
4. Validate endpoints using Swagger or Postman
5. Add routes or modify services as needed
6. Run tests: `make test`

---

## 🔐 Optional Features

- Add CORS middleware to enable frontend access
- Secure routes with OAuth2 or API keys
- Use role-based permission checks
- Include Supabase Auth JWT decoding

---

## ✅ Future Enhancements

- Add `/compare` endpoint to compare districts
- Enable fuzzy search across cities/zones
- Include geospatial calculations (e.g. distances)
- Use background tasks for data imports

---

## 🧾 Appendix

### Required Tools

- Python 3.11+
- Docker, Docker Compose
- Supabase CLI (optional)
- VS Code or PyCharm recommended

---

## 💬 Contact

For technical documentation, contact the project maintainer or check the `docs/` directory for extended API specs and user flows.

