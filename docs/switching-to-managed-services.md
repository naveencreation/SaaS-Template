# Switching to Managed Services

The template uses self-hosted PostgreSQL and Redis by default. You can swap either or both for managed services with only `.env` changes.

## Swap PostgreSQL → Supabase / Neon / AWS RDS

1. Create a managed Postgres database and get the connection string.
2. Update `.env` or `.env.prod`:

```env
DATABASE_URL="postgresql+asyncpg://user:pass@db.supabase.co:5432/postgres"
```

3. Remove or comment out the `postgres` service in `docker-compose.yml` / `docker-compose.prod.yml`.
4. Remove the `depends_on: postgres` entries from `backend` and `migrate`.
5. Restart:

```bash
docker compose -f infra/docker-compose.yml up -d
```

> The app does not use any Postgres-specific extensions. Any Postgres 13+ provider works.

## Swap Redis → Upstash / Redis Cloud / AWS ElastiCache

1. Create a managed Redis instance and get the Redis URL.
2. Update `.env` or `.env.prod`:

```env
REDIS_URL="rediss://default:password@my-redis.upstash.io:6379"
```

3. Remove or comment out the `redis` service in compose files.
4. Remove `depends_on: redis` entries.
5. Restart.

> If your provider uses TLS (`rediss://`), make sure the URL starts with `rediss://` (note the double `s`).

## Swap both at once

You can remove `postgres` and `redis` services entirely. The compose file will only run:
- `backend`
- `frontend`
- `nginx` (production)
- `certbot` (production)

This is the recommended setup for production if you want zero database/Redis maintenance.

## Backup considerations

If you switch to managed Postgres, update `infra/scripts/backup.sh` to use your provider's snapshot/export tools instead of `pg_dump`.
