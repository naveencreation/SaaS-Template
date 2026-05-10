#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# 01_infra.sh — Infrastructure tests (Phase 1 + Phase 2)
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/helpers/assert.sh"

COMPOSE_FILE="infra/docker-compose.yml"
ENV_FILE=".env"

echo "=== 01 Infrastructure Tests ==="

# Discover actual container prefix (docker compose v2 uses the directory of the
# compose file as the project name when -f is used, but we detect it dynamically)
_PREFIX=""
_detect_prefix() {
  local name
  name=$(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps --format '{{.Name}}' 2>/dev/null | grep -E 'postgres|redis' | head -n 1)
  if [ -n "$name" ]; then
    # strip the service suffix (e.g. "infra-postgres-1" -> "infra-" or "saas-template-postgres-1" -> "saas-template-")
    _PREFIX=$(echo "$name" | sed 's/postgres-1$//')
  else
    # fallback: try docker ps -a
    name=$(docker ps -a --format '{{.Names}}' | grep -E 'postgres-1$' | head -n 1)
    if [ -n "$name" ]; then
      _PREFIX=$(echo "$name" | sed 's/postgres-1$//')
    else
      _PREFIX="infra-"
    fi
  fi
}
_detect_prefix

PG_CONTAINER="${_PREFIX}postgres-1"
REDIS_CONTAINER="${_PREFIX}redis-1"
MIGRATE_CONTAINER="${_PREFIX}migrate-1"

# ── Test #1: Core services running ────────────────────────────────────────────
# migrate is an exit-on-complete one-off job — it won't show in "docker compose ps"
RUNNING=$(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps --format '{{.Service}}' 2>/dev/null | sort)
EXPECTED_RUNNING="backend\nfrontend\nmailhog\npostgres\nredis"
MISSING=$(comm -23 <(echo -e "$EXPECTED_RUNNING" | sort) <(echo "$RUNNING"))

# Also check migrate exists in docker ps -a (exited is OK)
MIGRATE_EXISTS=$(docker ps -a --format '{{.Names}}' | grep -c "^${MIGRATE_CONTAINER}$" || echo "0")

if [ -z "$MISSING" ] && [ "$MIGRATE_EXISTS" -ge 1 ]; then
  pass 1 "All 6 containers exist (5 running + migrate exited)"
elif [ -n "$MISSING" ]; then
  fail 1 "All 6 containers exist" "5 running + migrate" "missing running: $(echo $MISSING | tr '\n' ' ')"
else
  fail 1 "All 6 containers exist" "migrate container in docker ps -a" "not found"
fi

# ── Test #2: Health endpoint ────────────────────────────────────────────────
HEALTH_BODY=$(curl -sf "http://localhost:3000/api/health" 2>/dev/null || echo "")
if echo "$HEALTH_BODY" | grep -q '"status":"ok"'; then
  pass 2 "Health endpoint returns ok"
else
  fail 2 "Health endpoint returns ok" '{"status":"ok"}' "$HEALTH_BODY"
fi

# ── Test #3: Postgres accepting connections ─────────────────────────────────
PG_READY=$(docker exec "$PG_CONTAINER" pg_isready 2>/dev/null || echo "not ready")
if echo "$PG_READY" | grep -q "accepting connections"; then
  pass 3 "Postgres accepting connections"
else
  fail 3 "Postgres accepting connections" "accepting connections" "$PG_READY"
fi

# ── Test #4: Redis PING ─────────────────────────────────────────────────────
REDIS_PING=$(docker exec "$REDIS_CONTAINER" redis-cli ping 2>/dev/null || echo "")
if [ "$REDIS_PING" = "PONG" ]; then
  pass 4 "Redis responds to PING"
else
  fail 4 "Redis responds to PING" "PONG" "$REDIS_PING"
fi

# ── Test #5: Backend port 8000 NOT exposed ──────────────────────────────────
BACKEND_DIRECT=$(curl -sf "http://localhost:8000" 2>/dev/null || echo "REFUSED")
if [ "$BACKEND_DIRECT" = "REFUSED" ] || [ -z "$BACKEND_DIRECT" ]; then
  pass 5 "Backend port 8000 is not exposed"
else
  fail 5 "Backend port 8000 is not exposed" "connection refused" "$BACKEND_DIRECT"
fi

# ── Test #6: Migrations applied (check alembic_version table) ───────────────
ALEMBIC_VER=$(docker exec "$PG_CONTAINER" psql -U postgres -d postgres -t -c "SELECT version_num FROM alembic_version LIMIT 1;" 2>/dev/null | tr -d ' \n')
if [ -n "$ALEMBIC_VER" ]; then
  pass 6 "Alembic migrations applied (revision: $ALEMBIC_VER)"
else
  fail 6 "Alembic migrations applied" "alembic_version row present" "table empty or missing"
  echo "    HINT: If DB was wiped, run: docker compose -f $COMPOSE_FILE run --rm migrate"
fi

# ── Test #7: Super admin exists in DB ─────────────────────────────────────
ADMIN_EXISTS=$(docker exec "$PG_CONTAINER" psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM users WHERE email='admin@example.com';" 2>/dev/null | tr -d ' \n' || echo "0")
if [ "$ADMIN_EXISTS" -ge 1 ] 2>/dev/null; then
  pass 7 "Super admin exists in DB"
else
  fail 7 "Super admin exists in DB" "count >= 1" "$ADMIN_EXISTS"
  echo "    HINT: If DB was wiped, run: docker compose -f $COMPOSE_FILE run --rm migrate"
fi

# ── Test #8: Users table has at least 1 row ──────────────────────────────────
USER_COUNT=$(docker exec "$PG_CONTAINER" psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' \n' || echo "0")
if [ "$USER_COUNT" -ge 1 ] 2>/dev/null; then
  pass 8 "Users table has at least 1 row"
else
  fail 8 "Users table has at least 1 row" ">=1" "$USER_COUNT"
  echo "    HINT: If DB was wiped, run: docker compose -f $COMPOSE_FILE run --rm migrate"
fi

# ── Test #9: All 4 roles exist ──────────────────────────────────────────────
ROLES=$(docker exec "$PG_CONTAINER" psql -U postgres -d postgres -t -c "SELECT name FROM roles;" 2>/dev/null | tr -d ' \n' || echo "")
ROLES_OK=true
for role in super_admin admin manager user; do
  if ! echo "$ROLES" | grep -q "$role"; then
    ROLES_OK=false
    break
  fi
done
if [ "$ROLES_OK" = true ] && [ -n "$ROLES" ]; then
  pass 9 "All 4 roles exist"
else
  fail 9 "All 4 roles exist" "super_admin, admin, manager, user" "$ROLES"
fi

# ── Test #10: oauth_accounts table exists ───────────────────────────────────
TABLES=$(docker exec "$PG_CONTAINER" psql -U postgres -d postgres -t -c "\\dt" 2>/dev/null || echo "")
if echo "$TABLES" | grep -q "oauth_accounts"; then
  pass 10 "oauth_accounts table exists"
else
  fail 10 "oauth_accounts table exists" "oauth_accounts" "not found"
fi

assert_summary
exit $?
