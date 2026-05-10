#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# 01_infra.sh — Infrastructure tests (Phase 1 + Phase 2)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/helpers/assert.sh"

COMPOSE_FILE="infra/docker-compose.yml"
ENV_FILE=".env"

echo "=== 01 Infrastructure Tests ==="

# Test #1: All 6 containers are running or healthy
RUNNING=$(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps --format '{{.Service}}' 2>/dev/null | sort)
EXPECTED_SERVICES="backend\nfrontend\nmailhog\nmigrate\npostgres\nredis"
MISSING=$(comm -23 <(echo -e "$EXPECTED_SERVICES" | sort) <(echo "$RUNNING"))
if [ -z "$MISSING" ]; then
  pass 1 "All 6 containers are running/healthy"
else
  fail 1 "All 6 containers are running/healthy" "6 services" "missing: $(echo $MISSING | tr '\n' ' ')"
fi

# Test #2: Health endpoint returns ok
HEALTH_BODY=$(curl -sf "http://localhost:3000/api/health" 2>/dev/null || echo "")
if echo "$HEALTH_BODY" | grep -q '"status":"ok"'; then
  pass 2 "Health endpoint returns ok"
else
  fail 2 "Health endpoint returns ok" '{"status":"ok"}' "$HEALTH_BODY"
fi

# Test #3: Postgres is accepting connections
PG_READY=$(docker exec infra-postgres-1 pg_isready 2>/dev/null || echo "not ready")
if echo "$PG_READY" | grep -q "accepting connections"; then
  pass 3 "Postgres accepting connections"
else
  fail 3 "Postgres accepting connections" "accepting connections" "$PG_READY"
fi

# Test #4: Redis responds to PING
REDIS_PING=$(docker exec infra-redis-1 redis-cli ping 2>/dev/null || echo "")
if [ "$REDIS_PING" = "PONG" ]; then
  pass 4 "Redis responds to PING"
else
  fail 4 "Redis responds to PING" "PONG" "$REDIS_PING"
fi

# Test #5: Backend port 8000 is NOT exposed
BACKEND_DIRECT=$(curl -sf "http://localhost:8000" 2>/dev/null || echo "REFUSED")
if [ "$BACKEND_DIRECT" = "REFUSED" ] || [ -z "$BACKEND_DIRECT" ]; then
  pass 5 "Backend port 8000 is not exposed"
else
  fail 5 "Backend port 8000 is not exposed" "connection refused" "$BACKEND_DIRECT"
fi

# Test #6: Alembic migration ran
MIGRATE_LOGS=$(docker logs infra-migrate-1 2>/dev/null || echo "")
if echo "$MIGRATE_LOGS" | grep -q "alembic.runtime.migration"; then
  pass 6 "Alembic migration ran on startup"
else
  fail 6 "Alembic migration ran on startup" "alembic.runtime.migration" "not found"
fi

# Test #7: Super admin seeded
BACKEND_LOGS=$(docker logs infra-backend-1 2>/dev/null || echo "")
if echo "$BACKEND_LOGS" | grep -q "Super admin created"; then
  pass 7 "Super admin seeded on first run"
else
  fail 7 "Super admin seeded on first run" "Super admin created" "not found"
fi

# Test #8: Users table has at least 1 row
USER_COUNT=$(docker exec infra-postgres-1 psql -U postgres -d postgres -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' \n' || echo "0")
if [ "$USER_COUNT" -ge 1 ] 2>/dev/null; then
  pass 8 "Users table has at least 1 row"
else
  fail 8 "Users table has at least 1 row" ">=1" "$USER_COUNT"
fi

# Test #9: All 4 roles exist
ROLES=$(docker exec infra-postgres-1 psql -U postgres -d postgres -t -c "SELECT name FROM roles;" 2>/dev/null | tr -d ' \n')
for role in super_admin admin manager user; do
  if ! echo "$ROLES" | grep -q "$role"; then
    fail 9 "All 4 roles exist" "super_admin, admin, manager, user" "$ROLES"
    break
  fi
done
if echo "$ROLES" | grep -q "super_admin" && echo "$ROLES" | grep -q "admin" && echo "$ROLES" | grep -q "manager" && echo "$ROLES" | grep -q "user"; then
  pass 9 "All 4 roles exist"
fi

# Test #10: oauth_accounts table exists
TABLES=$(docker exec infra-postgres-1 psql -U postgres -d postgres -t -c "\\dt" 2>/dev/null || echo "")
if echo "$TABLES" | grep -q "oauth_accounts"; then
  pass 10 "oauth_accounts table exists"
else
  fail 10 "oauth_accounts table exists" "oauth_accounts" "not found"
fi

assert_summary
exit $?
