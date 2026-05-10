#!/usr/bin/env bash
# Shared assertion helpers — colored pass/fail logging with counters.
# Usage: source tests/helpers/assert.sh
# Then: pass 1 "Health check returns ok"
# Then: fail 2 "Health check" "200" "500"

PASS_COUNT=0
FAIL_COUNT=0
SKIPPED_COUNT=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
RESET='\033[0m'

pass() {
  local num="$1"
  local desc="$2"
  PASS_COUNT=$((PASS_COUNT + 1))
  printf "${GREEN}[PASS] #%s %s${RESET}\n" "$num" "$desc"
}

fail() {
  local num="$1"
  local desc="$2"
  local expected="$3"
  local got="$4"
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf "${RED}[FAIL] #%s %s — expected '%s' got '%s'${RESET}\n" "$num" "$desc" "$expected" "$got"
}

skip() {
  local num="$1"
  local desc="$2"
  SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
  printf "${YELLOW}[SKIP] #%s %s${RESET}\n" "$num" "$desc"
}

assert_summary() {
  printf "\n=============================\n"
  printf "  Results: %s passed, %s failed, %s skipped\n" "$PASS_COUNT" "$FAIL_COUNT" "$SKIPPED_COUNT"
  printf "=============================\n"
  if [ "$FAIL_COUNT" -gt 0 ]; then
    return 1
  fi
  return 0
}

export -f pass fail skip assert_summary 2>/dev/null || true
export PASS_COUNT FAIL_COUNT SKIPPED_COUNT
