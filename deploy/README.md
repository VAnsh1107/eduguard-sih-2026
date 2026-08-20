# EduGuard — One-Command Deployment

Deploy the full stack (Flask API + React SPA) with a single Docker Compose command.

---

## Prerequisites

| Tool | Minimum version |
|------|-----------------|
| Docker | 24.0 |
| Docker Compose | v2.20 (bundled with Docker Desktop) |

---

## Quick Start

```bash
# 1  Clone the repository
git clone https://github.com/your-org/eduguard.git
cd eduguard

# 2  Create your environment file
cp .env.example .env

# 3  Open .env and fill in real values (at minimum: JWT_SECRET_KEY and MAIL_*)
#    vim .env

# 4  Build and start everything
docker compose up -d --build
```

The app is now live at **http://localhost**.

---

## What Runs Where

| Service | Container | Internal port | External port |
|---------|-----------|---------------|---------------|
| Flask API + SocketIO | `eduguard-backend` | 5000 | _(none)_ |
| React SPA + nginx | `eduguard-frontend` | 80 | **80** |

nginx reverse-proxies `/api/*` and `/socket.io/*` to the Flask backend over an isolated Docker bridge network (`eduguard`). The backend is **never** exposed directly to the host.

---

## Environment Variables

Copy `.env.example` to `.env` and set:

| Variable | Description |
|----------|-------------|
| `JWT_SECRET_KEY` | **Required.** Random string used to sign JWT tokens. |
| `MAIL_SERVER` | SMTP host (default: `smtp.gmail.com`) |
| `MAIL_PORT` | SMTP port (default: `587`) |
| `MAIL_USE_TLS` | `True` / `False` |
| `MAIL_USE_SSL` | `True` / `False` |
| `MAIL_USERNAME` | SMTP login email |
| `MAIL_PASSWORD` | SMTP app password |
| `MAIL_DEFAULT_SENDER` | From-address on outgoing mail |
| `FLASK_ENV` | `production` or `development` |

---

## Health Check

After the containers are up, verify the backend is healthy:

```bash
curl http://localhost/api/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "SIH API is running with persistent SQLite database & JWT Auth"
}
```

To confirm the database and model are loaded you can also inspect the logs:

```bash
docker compose logs backend | tail -20
```

You should see lines like:

```
[TRAIN] Loading 5000 records from SQLite database.
[SEED] Students database already contains records. Skipping student seeding.
[BATCH] Starting batch prediction run at ...
```

---

## Useful Commands

```bash
# Follow live logs
docker compose logs -f

# Restart only the backend
docker compose restart backend

# Stop everything
docker compose down

# Stop and delete all data (fresh start)
docker compose down -v

# Rebuild after code changes
docker compose up -d --build
```

---

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@edu.local` | `changeme` |
| Admin | `admin@edu.local` | `changeme` |
| Teacher | `teacher@edu.local` | `changeme` |
| Student | `student@edu.local` | `changeme` |

> Change the default passwords before any production deployment.

---

## Data Persistence

Docker named volumes are used so data survives container restarts:

- **`backend-data`** — SQLite database (`/app/data/eduguard.db`)
- **`backend-versions`** — Trained ML model artifacts (`/app/model/versions/`)

To back up the database:

```bash
docker compose exec backend cat /app/data/eduguard.db > backup.db
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `curl /api/health` returns connection refused | Wait 10 s for the seed + batch-predict to finish on first boot, then retry. |
| Port 80 already in use | Change the `ports` mapping in `docker-compose.yml`, e.g. `"8080:80"`. |
| Backend exits with `ModuleNotFoundError` | Run `docker compose up -d --build` to rebuild. |
