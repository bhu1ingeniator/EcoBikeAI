# EcoBike AI

A full-stack web app to explore bike brands and models in India and globally, compare mileage and CO₂ emissions, and get AI-generated analysis for each bike.

**Live demo:** https://eco-bike-ai-wv3n.vercel.app

The backend runs on Render's free tier, so the first request after a period of inactivity can take about a minute.

## Features
- India / Global region toggle
- Brand and model search
- Spec cards: mileage, CO₂, engine, power, weight, fuel tank, fuel type, category and price
- Brand CO₂ chart built with JDBC aggregate queries
- AI analysis of each bike using Google Gemini

## Tech Stack
- **Backend:** Java 21, Spring Boot, Spring Data JPA (Hibernate), JdbcTemplate, PostgreSQL
- **Frontend:** React, Vite, Recharts
- **AI:** Google Gemini API
- **Deployment:** Render (backend, Docker), Vercel (frontend), Neon (PostgreSQL)

## Data
- About 26,000 bikes are loaded from cleaned CSV files on first startup (India and Global datasets).
- India CO₂ values are estimated from mileage. Global CO₂ values come from the dataset.

## Project Structure
```
backend/    Spring Boot REST API
frontend/   React + Vite app
```

## Run Locally

**Prerequisites:** JDK 21, PostgreSQL, Node.js.

**Backend**
```bash
cd backend
# set environment variables DB_PASSWORD and GEMINI_API_KEY first
./mvnw spring-boot:run      # Windows: .\mvnw spring-boot:run
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/bikes/brands?region=INDIA` | List brands |
| GET | `/api/bikes/models?region=INDIA&brand=Honda` | List models for a brand |
| GET | `/api/bikes?region=INDIA&brand=Honda&model=Activa 125` | Variants of a model |
| GET | `/api/bikes/{id}` | One bike by ID |
| GET | `/api/stats/brand?region=GLOBAL&brand=Honda` | CO₂ and mileage stats for a brand |
| POST | `/api/ai/analyze` | AI analysis for a bike, body: `{"id": 1}` |