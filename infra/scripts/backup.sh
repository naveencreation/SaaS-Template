#!/usr/bin/env bash
# ━━━ backup.sh — PostgreSQL Backup Script ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Usage: ./infra/scripts/backup.sh
# Keeps last 7 days of backups, deletes older ones.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

COMPOSE_FILE="${PROJECT_ROOT}/infra/docker-compose.prod.yml"
ENV_FILE="${PROJECT_ROOT}/.env.prod"
BACKUP_DIR="${PROJECT_ROOT}/backups"
RETENTION_DAYS=7

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/saas_db_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

# Load database credentials from .env.prod
if [[ -f "${ENV_FILE}" ]]; then
    set -a
    source "${ENV_FILE}"
    set +a
fi

echo "[backup] Creating backup: ${BACKUP_FILE}..."

docker compose -f "${COMPOSE_FILE}" exec -T postgres \
    pg_dump -U "${POSTGRES_USER:-saas_user}" -d "${POSTGRES_DB:-saas_db}" \
    | gzip > "${BACKUP_FILE}"

echo "[backup] Backup complete: $(du -h "${BACKUP_FILE}" | cut -f1)"

# Clean up old backups
echo "[backup] Removing backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "saas_db_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "[backup] Done. Remaining backups:"
ls -lh "${BACKUP_DIR}"
