# Getting Started

Go from zero to a running local SaaS app in 5 minutes.

## Prerequisites

- Docker + Docker Compose
- Git
- Node.js 20 (for local frontend dev outside Docker, optional)
- Python 3.12 (for local backend dev outside Docker, optional)

## 1. Clone the repository

```bash
git clone <your-repo-url>
cd saas-template
```

## 2. Create your environment file

```bash
cp .env.example .env
```

Edit `.env` and change at minimum:

| Variable | What to set |
|----------|-------------|
| `JWT_SECRET` | `openssl rand -hex 32` |
| `SUPER_ADMIN_EMAIL` | Your email |
| `SUPER_ADMIN_PASSWORD` | Strong password |
| `APP_URL` | `http://localhost:3000` |

All other defaults are fine for local development.

## 3. Start everything

```bash
docker compose -f infra/docker-compose.yml up -d
```

This starts:
- PostgreSQL 15
- Redis 7
- MailHog (email testing)
- Backend (FastAPI on port 8000, internal only)
- Frontend (Next.js on port 3000)
- Migrate service (runs Alembic migrations + seed)

Wait ~30 seconds for the migrate service to finish.

## 4. Verify it's running

```bash
curl http://localhost:3000/api/health
# Expected: {"status":"ok"}
```

## 5. First login

Open `http://localhost:3000` in your browser.

1. The super admin was seeded automatically (from `.env` values).
2. Click **Login** → enter `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`.
3. You are now logged in as a super_admin.

## Common commands

```bash
# View logs
docker compose -f infra/docker-compose.yml logs -f backend

# Reset database (⚠️ destroys all data)
docker compose -f infra/docker-compose.yml down -v
docker compose -f infra/docker-compose.yml up -d

# Run backend tests (inside container)
docker compose -f infra/docker-compose.yml exec backend pytest

# Access MailHog UI (view trapped emails)
open http://localhost:8025
```

## Next steps

- [Add a new page/feature](add-a-page.md)
- [Deploy to production](deploy-to-production.md)
