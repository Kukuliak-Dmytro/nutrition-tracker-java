# Nutrition Tracker (Java Backend)

A monorepo containing a **Next.js** frontend and **Spring Boot 3 (Java 21)** backend for the Nutrition Tracker application.

## Project Structure

```
nutrition-tracker-java/
├── frontend/          # Next.js app (reused from original project)
├── backend/           # Spring Boot 3 API (Java 21)
├── docker-compose.yml # PostgreSQL database
├── package.json       # Root scripts for convenience
└── scripts/           # Setup & dev scripts
```

## Prerequisites

- **Java 21** (JDK)
- **Node.js 20+**
- **Docker Desktop** (for PostgreSQL)
- **Maven** (or use the included Maven Wrapper `./mvnw`)

## Quick Start

### 1. Start the Database

```bash
npm run setup:db
# or
docker compose up -d postgres
```

### 2. Start the Backend (port 8080)

```bash
npm run backend:dev
```

On first start, Flyway automatically creates the schema and seed data is imported.

### 3. Start the Frontend (port 3000)

```bash
npm run frontend:install   # first time only
npm run frontend:dev
```

### Or run everything together:

```bash
npm run dev
```

## API Endpoints

All endpoints are prefixed with `/api`:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/ingredients` | List ingredients (search, filter, paginate) |
| `POST` | `/api/ingredients` | Create ingredient |
| `GET` | `/api/ingredients/{id}` | Get ingredient by ID |
| `PATCH` | `/api/ingredients/{id}` | Update ingredient |
| `DELETE` | `/api/ingredients/{id}` | Delete ingredient |
| `GET` | `/api/recipes` | List recipes (search, filter, sort) |
| `POST` | `/api/recipes` | Create recipe |
| `GET` | `/api/recipes/{id}` | Get recipe by ID |
| `PATCH` | `/api/recipes/{id}` | Update recipe |
| `DELETE` | `/api/recipes/{id}` | Delete recipe |
| `GET` | `/api/cooking-history` | List cooking history |
| `POST` | `/api/cooking-history` | Log a cooking event |
| `DELETE` | `/api/cooking-history/{id}` | Delete cooking event |
| `GET` | `/api/cooking-history/stats` | Cooking statistics |
| `GET` | `/api/cooking-history/nutrition` | Weekly nutrition summary |
| `GET` | `/api/dashboard` | Aggregated dashboard data |
| `POST` | `/api/ai/generate-recipe` | AI recipe generation (Gemini) |
| `GET` | `/api/ai/generate-recipe` | AI service health check |

## Database

- **Container**: `nutrition-tracker-db`
- **Port**: `5432`
- **Database**: `nutrition_tracker`
- **User**: `nutrition_user`
- **Password**: `nutrition_password`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS, TanStack Query |
| Backend | Spring Boot 3.4, Java 21, Spring Data JPA, Hibernate |
| Database | PostgreSQL 16 |
| Migrations | Flyway |
| Validation | Jakarta Bean Validation |
| AI | Google Gemini API |
