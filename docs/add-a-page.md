# How to Add a New Page / Feature

This template is built for buyers who want to add features without understanding the entire codebase. The pattern is: **copy 4 files, add 2 config lines, restart**.

## What we will build

A new dashboard page called **"Projects"** at `/dashboard/projects` with full CRUD backend.

## Step 1: Backend — copy the example router

```bash
cp backend/business/_example_router.py backend/business/projects/router.py
```

Edit `backend/business/projects/router.py`:
- Change `prefix="/my-feature"` to `prefix="/business/projects"`
- Rename `MyFeatureCreate` / `MyFeatureResponse` to `ProjectCreate` / `ProjectResponse`
- Add real fields: `title`, `status`, `owner_id`

Create the model and schema files:

```bash
# backend/business/projects/models.py
from sqlalchemy import Column, String
from app.db.base import BaseModel

class Project(BaseModel):
    __tablename__ = "projects"
    title  = Column(String(200), nullable=False)
    status = Column(String(50), default="draft")
```

```bash
# backend/business/projects/schemas.py
from pydantic import BaseModel
from uuid import UUID

class ProjectCreate(BaseModel):
    title: str
    status: str = "draft"

class ProjectResponse(BaseModel):
    id: UUID
    title: str
    status: str
```

> **No edits to `main.py`** — the router auto-registers via `business/*/router.py` discovery.

## Step 2: Generate the database migration

```bash
docker compose -f infra/docker-compose.yml exec backend alembic revision --autogenerate -m "add projects table"
docker compose -f infra/docker-compose.yml exec backend alembic upgrade head
```

## Step 3: Frontend — copy the example page

```bash
cp frontend/app/(dashboard)/business/_example-page.tsx frontend/app/(dashboard)/business/projects/page.tsx
```

Edit the page:
- Change `useData("/api/business/my-feature")` to `useData("/api/business/projects")`
- Update the form fields to match `ProjectCreate` schema
- Update the table columns

## Step 4: Add proxy route (optional but recommended)

```bash
cp frontend/app/api/business/_example-route.ts frontend/app/api/business/projects/route.ts
```

Edit:
```typescript
export const { GET, POST, PUT, DELETE } = createProxyHandler("/business/projects");
```

> The catch-all proxy already handles this, but an explicit route is self-documenting.

## Step 5: Add navigation and permissions

In `frontend/config/nav.config.ts`, uncomment the example block or add:

```typescript
{
  label: "Projects",
  href: "/dashboard/business/projects",
  icon: "FolderOpen",
  roles: ["user", "admin", "super_admin"],
},
```

In `frontend/config/roles.config.ts`, add:

```typescript
"/dashboard/business/projects": ["user", "admin", "super_admin"],
```

## Step 6: Restart and test

```bash
docker compose -f infra/docker-compose.yml restart backend frontend
```

Open `http://localhost:3000/dashboard/business/projects`.

## Summary — what you touched

| File | Action |
|------|--------|
| `backend/business/projects/router.py` | **copy** from `_example_router.py` |
| `backend/business/projects/models.py` | **create** |
| `backend/business/projects/schemas.py` | **create** |
| `frontend/app/(dashboard)/business/projects/page.tsx` | **copy** from `_example-page.tsx` |
| `frontend/app/api/business/projects/route.ts` | **copy** from `_example-route.ts` |
| `frontend/config/nav.config.ts` | **add** 1 nav link |
| `frontend/config/roles.config.ts` | **add** 1 route permission |
| Alembic migration | **generate** 1 file |

That's it. 8 files, zero edits to framework code.
