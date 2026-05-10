#!/usr/bin/env bash
# ━━━ deploy.sh — Production Deploy Script ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Usage: ssh into VPS, cd /opt/myapp, ./infra/scripts/deploy.sh
#
# What it does:
#   1. Pulls latest code from git
#   2. Runs migrations + seed
#   3. Rebuilds Docker images
#   4. Restarts services with zero-downtime (docker compose up -d)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

COMPOSE_FILE="${PROJECT_ROOT}/infra/docker-compose.prod.yml"
ENV_FILE="${PROJECT_ROOT}/.env.prod"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Deploying SaaS Template"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "${PROJECT_ROOT}"

echo "[1/4] Pulling latest code..."
git pull origin main

echo "[2/4] Running database migrations..."
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" run --rm migrate

echo "[3/4] Building production images..."
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" build

echo "[4/4] Starting services..."
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Deploy complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" ps
