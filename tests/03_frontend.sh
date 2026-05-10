#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# 03_frontend.sh — Frontend Playwright test runner
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/helpers/assert.sh"

FRONTEND_DIR="${SCRIPT_DIR}/frontend"

echo "=== 03 Frontend Tests ==="

cd "$FRONTEND_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing npm dependencies..."
  npm install
fi

# Install Playwright browsers if needed
if ! npx playwright install chromium --with-deps 2>/dev/null; then
  echo "Playwright browser install may have issues, continuing..."
fi

# Run Playwright tests
echo "Running Playwright tests..."
npx playwright test --reporter=line 2>&1
EXIT_CODE=$?

if [ "$EXIT_CODE" -eq 0 ]; then
  pass 0 "All Playwright tests passed"
else
  fail 0 "All Playwright tests passed" "exit 0" "exit $EXIT_CODE"
fi

assert_summary
exit $?
