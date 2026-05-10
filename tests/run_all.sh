#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# run_all.sh — Master test runner
# Usage: bash tests/run_all.sh
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
RESET='\033[0m'

INFRA_STATUS="PASSED"
API_STATUS="PASSED"
FRONTEND_STATUS="PASSED"

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║    SaaS Template — Automated Test Suite      ║"
echo "║    $(date)              ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# ── 01 Infrastructure ─────────────────────────────────────────────────────────
echo "▶ Running 01_infra.sh ..."
if bash "${SCRIPT_DIR}/01_infra.sh"; then
  INFRA_STATUS="PASSED"
else
  INFRA_STATUS="FAILED"
fi

echo ""

# ── 02 API ──────────────────────────────────────────────────────────────────
echo "▶ Running 02_api.sh ..."
if bash "${SCRIPT_DIR}/02_api.sh"; then
  API_STATUS="PASSED"
else
  API_STATUS="FAILED"
fi

echo ""

# ── 03 Frontend ───────────────────────────────────────────────────────────────
echo "▶ Running 03_frontend.sh ..."
if bash "${SCRIPT_DIR}/03_frontend.sh"; then
  FRONTEND_STATUS="PASSED"
else
  FRONTEND_STATUS="FAILED"
fi

echo ""

# ── Final Summary ─────────────────────────────────────────────────────────────
ANY_FAIL=0
if [ "$INFRA_STATUS" = "FAILED" ]; then ANY_FAIL=1; fi
if [ "$API_STATUS" = "FAILED" ]; then ANY_FAIL=1; fi
if [ "$FRONTEND_STATUS" = "FAILED" ]; then ANY_FAIL=1; fi

echo "═══════════════════════════════════════"
echo "  FINAL RESULTS"
echo "  Infrastructure:  ${INFRA_STATUS}"
echo "  API:             ${API_STATUS}"
echo "  Frontend:        ${FRONTEND_STATUS}"
echo "═══════════════════════════════════════"

if [ "$ANY_FAIL" -eq 0 ]; then
  echo -e "${GREEN}All suites passed.${RESET}"
  exit 0
else
  echo -e "${RED}Some suites failed.${RESET}"
  exit 1
fi
