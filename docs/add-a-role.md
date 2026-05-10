# How to Add a Custom Role

The template comes with 4 built-in roles:
- `super_admin` — full system access
- `admin` — user management + analytics
- `user` — standard authenticated user
- `guest` — read-only dashboard access

To add a custom role (e.g., `editor`, `billing_manager`):

## 1. Backend — add the role to the database

Run this SQL (inside the postgres container or via migration):

```sql
INSERT INTO roles (name, display_name, is_system, created_at, updated_at)
VALUES ('editor', 'Editor', true, NOW(), NOW());
```

Or create an Alembic migration:

```bash
docker compose -f infra/docker-compose.yml exec backend alembic revision -m "add editor role"
```

Edit the generated migration to insert the role.

## 2. Frontend — register the role

In `frontend/config/roles.config.ts`, add to the `Role` type:

```typescript
export type Role = "guest" | "user" | "editor" | "admin" | "super_admin";
```

Add route permissions:

```typescript
"/dashboard/content": ["editor", "admin", "super_admin"],
```

## 3. Frontend — add nav links (optional)

In `frontend/config/nav.config.ts`:

```typescript
{
  label: "Content",
  href: "/dashboard/content",
  icon: "FileText",
  roles: ["editor", "admin", "super_admin"],
},
```

## 4. Restart

```bash
docker compose -f infra/docker-compose.yml restart frontend backend
```

## Note on role ordering

The `CanAccess` component checks if the user's role is in the allowed list. There is no automatic hierarchy — you must explicitly list every allowed role.
