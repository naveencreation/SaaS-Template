#!/usr/bin/env bash
# MailHog helpers — extract tokens from verification/reset emails.
# Usage: source tests/helpers/mailhog.sh
# Requires: jq, curl

MAILHOG_BASE="http://localhost:8025/api/v2"

_get_latest_email() {
  curl -s "${MAILHOG_BASE}/messages?limit=1"
}

_get_email_body() {
  local raw="$1"
  # MailHog v2 Content.Body is base64 encoded
  echo "$raw" | jq -r '.items[0].Content.Body // ""'
}

_decode_base64() {
  local encoded="$1"
  # Handle both GNU and macOS base64
  if command -v base64 &>/dev/null; then
    printf '%s' "$encoded" | base64 -d 2>/dev/null || printf '%s' "$encoded" | base64 -D 2>/dev/null
  else
    echo "$encoded"
  fi
}

# Public API

extract_token_from_email() {
  local raw="$1"
  local pattern="$2"
  local encoded_body
  encoded_body=$(_get_email_body "$raw")
  local body
  body=$(_decode_base64 "$encoded_body")
  # Extract token from URL like /verify-email?token=abc123 or /reset-password?token=abc123
  echo "$body" | grep -oE "${pattern}=[A-Za-z0-9_-]+" | head -n 1 | cut -d '=' -f2
}

wait_for_email() {
  local max_wait=10
  local delay=1
  local i=0
  local raw=""

  while [ "$i" -lt "$max_wait" ]; do
    raw=$(_get_latest_email)
    count=$(echo "$raw" | jq '.total // 0')
    if [ "$count" -gt 0 ]; then
      echo "$raw"
      return 0
    fi
    sleep "$delay"
    i=$((i + 1))
  done

  echo "{}"
  return 1
}

clear_mailhog() {
  curl -s -X DELETE "${MAILHOG_BASE}/messages" >/dev/null 2>&1 || true
}

export -f extract_token_from_email wait_for_email clear_mailhog _get_latest_email _get_email_body _decode_base64 2>/dev/null || true
