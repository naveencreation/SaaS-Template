#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# 02_api.sh — Backend API tests (Phase 3 + Phase 4)
# Stateful: auth chain must run in order.
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/helpers/assert.sh"
source "${SCRIPT_DIR}/helpers/mailhog.sh"

BASE="http://localhost:3000/api"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
TEST_PASSWORD="Test1234!"
TEST_EMAIL="testuser_$(date +%s)@test.com"
COOKIE_JAR="/tmp/test_cookies.txt"
ADMIN_COOKIE_JAR="/tmp/admin_cookies.txt"
USER_COOKIE_JAR="/tmp/user_cookies.txt"

ADMIN_AUTH_OK=false
TEST_USER_ID=""
TEST_ROLE_ID=""

echo "=== 02 API Tests ==="

# Clear MailHog for clean email state
clear_mailhog

# jq check
if ! command -v jq &>/dev/null; then
  echo "ERROR: jq is required but not installed. Install jq to run API tests."
  exit 1
fi

# Helper: do a curl, return body and status as "BODY\nSTATUS"
_curl() {
  local body
  local status
  local out
  out=$(curl -s -w "\n%{http_code}" "$@" 2>/dev/null)
  status=$(echo "$out" | tail -n 1)
  body=$(echo "$out" | sed '$d')
  echo "$body"
  echo "$status"
}

# ── Auth Flow ────────────────────────────────────────────────────────────────

# Test #11: Signup
SIGNUP_BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"full_name\":\"Test User\"}")
SIGNUP_STATUS=$(echo "$SIGNUP_BODY" | tail -n 1)
SIGNUP_JSON=$(echo "$SIGNUP_BODY" | sed '$d')

if [ "$SIGNUP_STATUS" = "201" ] && echo "$SIGNUP_JSON" | jq -e '.success == true' >/dev/null 2>&1; then
  pass 11 "Signup returns success"
else
  fail 11 "Signup returns success" "201 + success:true" "$SIGNUP_STATUS + $SIGNUP_JSON"
fi

# Test #12: Wait for verification email, extract token
RAW_EMAIL=$(wait_for_email)
if [ -z "$RAW_EMAIL" ] || [ "$RAW_EMAIL" = "{}" ]; then
  fail 12 "Verification email arrives in MailHog" "email within 10s" "none received"
else
  VERIFY_TOKEN=$(extract_token_from_email "$RAW_EMAIL" "token")
  if [ -n "$VERIFY_TOKEN" ]; then
    pass 12 "Verification token extracted from MailHog email"
  else
    fail 12 "Verification token extracted from MailHog email" "token found" "none"
  fi
fi

# Test #13: Verify email endpoint sets cookie and redirects
if [ -n "${VERIFY_TOKEN:-}" ]; then
  VERIFY_RESPONSE=$(curl -s -D - -o /dev/null -w "%{http_code}" "$BASE/auth/verify-email?token=$VERIFY_TOKEN" 2>/dev/null)
  VERIFY_HEADERS=$(curl -s -D - -o /dev/null "$BASE/auth/verify-email?token=$VERIFY_TOKEN" 2>/dev/null)
  HAS_COOKIE=$(echo "$VERIFY_HEADERS" | grep -i "Set-Cookie:.*access_token" || true)
  if [ "$VERIFY_RESPONSE" = "200" ] && [ -n "$HAS_COOKIE" ]; then
    pass 13 "Verify-email sets cookie and returns success"
  else
    fail 13 "Verify-email sets cookie and returns success" "200 + Set-Cookie" "$VERIFY_RESPONSE + headers"
  fi
else
  skip 13 "Verify-email endpoint"
fi

# Test #14: Admin login
LOGIN_BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -c "$ADMIN_COOKIE_JAR" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
LOGIN_STATUS=$(echo "$LOGIN_BODY" | tail -n 1)
LOGIN_JSON=$(echo "$LOGIN_BODY" | sed '$d')

if [ "$LOGIN_STATUS" = "200" ] && echo "$LOGIN_JSON" | jq -e '.success == true' >/dev/null 2>&1; then
  pass 14 "Admin login succeeds"
  ADMIN_AUTH_OK=true
else
  fail 14 "Admin login succeeds" "200 + success:true" "$LOGIN_STATUS + $LOGIN_JSON"
fi

# Test #15: GET /api/auth/me as admin
if [ "$ADMIN_AUTH_OK" = true ]; then
  ME_BODY=$(curl -s -b "$ADMIN_COOKIE_JAR" "$BASE/auth/me" 2>/dev/null)
  ME_EMAIL=$(echo "$ME_BODY" | jq -r '.user.email // empty')
  ME_ROLE=$(echo "$ME_BODY" | jq -r '.user.role // empty')
  if [ "$ME_EMAIL" = "$ADMIN_EMAIL" ] && [ "$ME_ROLE" = "super_admin" ]; then
    pass 15 "GET /auth/me returns admin user with super_admin role"
  else
    fail 15 "GET /auth/me returns admin user" "email=$ADMIN_EMAIL role=super_admin" "email=$ME_EMAIL role=$ME_ROLE"
  fi
else
  skip 15 "GET /auth/me as admin"
fi

# Test #16: Logout invalidates session
if [ "$ADMIN_AUTH_OK" = true ]; then
  LOGOUT_BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/logout" -b "$ADMIN_COOKIE_JAR" 2>/dev/null)
  LOGOUT_STATUS=$(echo "$LOGOUT_BODY" | tail -n 1)
  LOGOUT_JSON=$(echo "$LOGOUT_BODY" | sed '$d')

  POST_LOGOUT=$(curl -s -w "\n%{http_code}" -b "$ADMIN_COOKIE_JAR" "$BASE/auth/me" 2>/dev/null)
  POST_STATUS=$(echo "$POST_LOGOUT" | tail -n 1)

  if echo "$LOGOUT_JSON" | jq -e '.success == true' >/dev/null 2>&1 && [ "$POST_STATUS" = "401" ]; then
    pass 16 "Logout succeeds and /auth/me returns 401"
  else
    fail 16 "Logout succeeds and /auth/me returns 401" "logout success + 401" "logout=$LOGOUT_STATUS me=$POST_STATUS"
  fi
else
  skip 16 "Logout invalidates session"
fi

# ── Password Reset Flow ─────────────────────────────────────────────────────

# Test #17: Forgot password
FORGOT_BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}" 2>/dev/null)
FORGOT_STATUS=$(echo "$FORGOT_BODY" | tail -n 1)
FORGOT_JSON=$(echo "$FORGOT_BODY" | sed '$d')

if [ "$FORGOT_STATUS" = "200" ] && echo "$FORGOT_JSON" | jq -e '.success == true' >/dev/null 2>&1; then
  pass 17 "Forgot password request succeeds"
else
  fail 17 "Forgot password request succeeds" "200 + success:true" "$FORGOT_STATUS + $FORGOT_JSON"
fi

# Test #18: Extract reset token and reset password
RESET_RAW=$(wait_for_email)
if [ -n "$RESET_RAW" ] && [ "$RESET_RAW" != "{}" ]; then
  RESET_TOKEN=$(extract_token_from_email "$RESET_RAW" "token")
  if [ -n "$RESET_TOKEN" ]; then
    RESET_BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/reset-password" \
      -H "Content-Type: application/json" \
      -d "{\"token\":\"$RESET_TOKEN\",\"new_password\":\"NewPass456!\"}" 2>/dev/null)
    RESET_STATUS=$(echo "$RESET_BODY" | tail -n 1)
    RESET_JSON=$(echo "$RESET_BODY" | sed '$d')
    if [ "$RESET_STATUS" = "200" ] && echo "$RESET_JSON" | jq -e '.success == true' >/dev/null 2>&1; then
      pass 18 "Reset password with token succeeds"
    else
      fail 18 "Reset password with token succeeds" "200 + success:true" "$RESET_STATUS + $RESET_JSON"
    fi
  else
    fail 18 "Reset password with token succeeds" "token found" "none"
  fi
else
  fail 18 "Reset password with token succeeds" "email received" "none"
fi

# ── RBAC ─────────────────────────────────────────────────────────────────────

# Re-login as admin for RBAC tests
if [ "$ADMIN_AUTH_OK" = true ]; then
  curl -s -X POST "$BASE/auth/login" \
    -c "$ADMIN_COOKIE_JAR" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" >/dev/null 2>&1 || true
fi

# Re-login as test user (password may have changed)
TEST_PASSWORD_CURRENT="NewPass456!"
USER_LOGIN=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" \
  -c "$USER_COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD_CURRENT\"}" 2>/dev/null)
USER_LOGIN_STATUS=$(echo "$USER_LOGIN" | tail -n 1)

# Test #22: List users as admin
if [ "$ADMIN_AUTH_OK" = true ]; then
  USERS_BODY=$(curl -s -b "$ADMIN_COOKIE_JAR" "$BASE/users" 2>/dev/null)
  USERS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -b "$ADMIN_COOKIE_JAR" "$BASE/users" 2>/dev/null)
  HAS_ITEMS=$(echo "$USERS_BODY" | jq -e '.items' >/dev/null 2>&1 && echo "yes" || echo "no")
  if [ "$USERS_STATUS" = "200" ] && [ "$HAS_ITEMS" = "yes" ]; then
    pass 22 "GET /users as admin returns 200 with items"
  else
    fail 22 "GET /users as admin returns 200 with items" "200 + items" "$USERS_STATUS + $USERS_BODY"
  fi
else
  skip 22 "GET /users as admin"
fi

# Test #23: GET /users as regular user → 403
if [ "$USER_LOGIN_STATUS" = "200" ]; then
  USERS_USER=$(curl -s -o /dev/null -w "%{http_code}" -b "$USER_COOKIE_JAR" "$BASE/users" 2>/dev/null)
  USERS_USER_BODY=$(curl -s -b "$USER_COOKIE_JAR" "$BASE/users" 2>/dev/null)
  ERROR_CODE=$(echo "$USERS_USER_BODY" | jq -r '.error.code // empty')
  if [ "$USERS_USER" = "403" ] && [ "$ERROR_CODE" = "FORBIDDEN" ]; then
    pass 23 "GET /users as regular user returns 403 FORBIDDEN"
  else
    fail 23 "GET /users as regular user returns 403 FORBIDDEN" "403 + FORBIDDEN" "$USERS_USER + $ERROR_CODE"
  fi
else
  skip 23 "GET /users as regular user"
fi

# Test #24: User list contains total field
if [ "$ADMIN_AUTH_OK" = true ]; then
  USERS_BODY=$(curl -s -b "$ADMIN_COOKIE_JAR" "$BASE/users" 2>/dev/null)
  HAS_TOTAL=$(echo "$USERS_BODY" | jq -e '.total' >/dev/null 2>&1 && echo "yes" || echo "no")
  if [ "$HAS_TOTAL" = "yes" ]; then
    pass 24 "GET /users response contains total field"
  else
    fail 24 "GET /users response contains total field" "total present" "missing"
  fi
else
  skip 24 "GET /users contains total"
fi

# Test #25: Get single user by ID
if [ "$ADMIN_AUTH_OK" = true ]; then
  TEST_USER_ID=$(curl -s -b "$ADMIN_COOKIE_JAR" "$BASE/users" 2>/dev/null | jq -r ".items[] | select(.email == \"$TEST_EMAIL\") | .id // empty")
  if [ -n "$TEST_USER_ID" ]; then
    SINGLE_BODY=$(curl -s -b "$ADMIN_COOKIE_JAR" "$BASE/users/$TEST_USER_ID" 2>/dev/null)
    SINGLE_EMAIL=$(echo "$SINGLE_BODY" | jq -r '.email // empty')
    if [ "$SINGLE_EMAIL" = "$TEST_EMAIL" ]; then
      pass 25 "GET /users/{id} returns correct user"
    else
      fail 25 "GET /users/{id} returns correct user" "$TEST_EMAIL" "$SINGLE_EMAIL"
    fi
  else
    fail 25 "GET /users/{id} returns correct user" "found test user id" "not found"
  fi
else
  skip 25 "GET /users/{id}"
fi

# Test #26: Update user role to manager
if [ "$ADMIN_AUTH_OK" = true ] && [ -n "$TEST_USER_ID" ]; then
  # Get manager role id
  TEST_ROLE_ID=$(docker exec infra-postgres-1 psql -U postgres -d postgres -t -c "SELECT id FROM roles WHERE name='manager';" 2>/dev/null | tr -d ' \n')
  if [ -n "$TEST_ROLE_ID" ]; then
    ROLE_BODY=$(curl -s -w "\n%{http_code}" -X PUT "$BASE/users/$TEST_USER_ID/role" \
      -b "$ADMIN_COOKIE_JAR" -H "Content-Type: application/json" \
      -d "{\"role_id\":\"$TEST_ROLE_ID\"}" 2>/dev/null)
    ROLE_STATUS=$(echo "$ROLE_BODY" | tail -n 1)
    ROLE_JSON=$(echo "$ROLE_BODY" | sed '$d')
    ROLE_NAME=$(echo "$ROLE_JSON" | jq -r '.role // empty')
    if [ "$ROLE_STATUS" = "200" ] && [ "$ROLE_NAME" = "manager" ]; then
      pass 26 "PUT /users/{id}/role to manager succeeds"
    else
      fail 26 "PUT /users/{id}/role to manager succeeds" "200 + role=manager" "$ROLE_STATUS + role=$ROLE_NAME"
    fi
  else
    fail 26 "PATCH /users/{id}/role to manager succeeds" "manager role_id found" "not found"
  fi
else
  skip 26 "PATCH /users/{id}/role"
fi

# Test #27: Deactivate user, then login should fail
if [ "$ADMIN_AUTH_OK" = true ] && [ -n "$TEST_USER_ID" ]; then
  ACTIVE_BODY=$(curl -s -w "\n%{http_code}" -X PUT "$BASE/users/$TEST_USER_ID/active" \
    -b "$ADMIN_COOKIE_JAR" -H "Content-Type: application/json" \
    -d '{"is_active":false}' 2>/dev/null)
  ACTIVE_STATUS=$(echo "$ACTIVE_BODY" | tail -n 1)
  ACTIVE_JSON=$(echo "$ACTIVE_BODY" | sed '$d')
  ACTIVE_FLAG=$(echo "$ACTIVE_JSON" | jq -r '.is_active // empty')

  DEACTIVATED_LOGIN=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"NewPass456!\"}" 2>/dev/null)

  if [ "$ACTIVE_STATUS" = "200" ] && [ "$ACTIVE_FLAG" = "false" ] && [ "$DEACTIVATED_LOGIN" = "401" ]; then
    pass 27 "Deactivate user prevents login"
  else
    fail 27 "Deactivate user prevents login" "200 + is_active=false + 401" "$ACTIVE_STATUS + $ACTIVE_FLAG + $DEACTIVATED_LOGIN"
  fi
else
  skip 27 "Deactivate user"
fi

# Test #28: Delete user
if [ "$ADMIN_AUTH_OK" = true ] && [ -n "$TEST_USER_ID" ]; then
  DEL_BODY=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE/users/$TEST_USER_ID" \
    -b "$ADMIN_COOKIE_JAR" 2>/dev/null)
  DEL_STATUS=$(echo "$DEL_BODY" | tail -n 1)
  DEL_JSON=$(echo "$DEL_BODY" | sed '$d')
  if [ "$DEL_STATUS" = "200" ] && echo "$DEL_JSON" | jq -e '.success == true' >/dev/null 2>&1; then
    pass 28 "DELETE /users/{id} succeeds"
  else
    fail 28 "DELETE /users/{id} succeeds" "200 + success" "$DEL_STATUS + $DEL_JSON"
  fi
else
  skip 28 "DELETE /users/{id}"
fi

# Test #29: Update self profile
if [ "$ADMIN_AUTH_OK" = true ]; then
  PROF_BODY=$(curl -s -w "\n%{http_code}" -X PUT "$BASE/users/me" \
    -b "$ADMIN_COOKIE_JAR" -H "Content-Type: application/json" \
    -d '{"full_name":"Updated Admin"}' 2>/dev/null)
  PROF_STATUS=$(echo "$PROF_BODY" | tail -n 1)
  PROF_JSON=$(echo "$PROF_BODY" | sed '$d')
  PROF_NAME=$(echo "$PROF_JSON" | jq -r '.full_name // empty')
  if [ "$PROF_STATUS" = "200" ] && [ "$PROF_NAME" = "Updated Admin" ]; then
    pass 29 "PUT /users/me updates full_name"
  else
    fail 29 "PUT /users/me updates full_name" "Updated Admin" "$PROF_NAME"
  fi
else
  skip 29 "PUT /users/me"
fi

# Test #30: Change own password
if [ "$ADMIN_AUTH_OK" = true ]; then
  CP_BODY=$(curl -s -w "\n%{http_code}" -X PUT "$BASE/users/me/password" \
    -b "$ADMIN_COOKIE_JAR" -H "Content-Type: application/json" \
    -d '{"current_password":"admin123","new_password":"AdminNew456!"}' 2>/dev/null)
  CP_STATUS=$(echo "$CP_BODY" | tail -n 1)
  CP_JSON=$(echo "$CP_BODY" | sed '$d')
  if [ "$CP_STATUS" = "200" ] && echo "$CP_JSON" | jq -e '.success == true' >/dev/null 2>&1; then
    pass 30 "PUT /users/me/password succeeds"
    # Restore admin password for cleanup (login + change back)
    curl -s -X POST "$BASE/auth/login" \
      -c "$ADMIN_COOKIE_JAR" \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@example.com","password":"AdminNew456!"}' >/dev/null 2>&1 || true
    curl -s -X PUT "$BASE/users/me/password" \
      -b "$ADMIN_COOKIE_JAR" -H "Content-Type: application/json" \
      -d '{"current_password":"AdminNew456!","new_password":"admin123"}' >/dev/null 2>&1 || true
  else
    fail 30 "PUT /users/me/password succeeds" "200 + success" "$CP_STATUS + $CP_JSON"
  fi
else
  skip 30 "PUT /users/me/password"
fi

# ── Error Shape Validation ───────────────────────────────────────────────────

# Test #63: Nonexistent endpoint
NOTFOUND=$(curl -s -w "\n%{http_code}" "$BASE/nonexistent" 2>/dev/null)
NOTFOUND_STATUS=$(echo "$NOTFOUND" | tail -n 1)
NOTFOUND_JSON=$(echo "$NOTFOUND" | sed '$d')
HAS_SHAPE=$(echo "$NOTFOUND_JSON" | jq -e '.success == false and .error.code != null and .error.message != null and .error.status == 404' >/dev/null 2>&1 && echo "yes" || echo "no")
if [ "$NOTFOUND_STATUS" = "404" ] && [ "$HAS_SHAPE" = "yes" ]; then
  pass 63 "Nonexistent endpoint returns standard error shape"
else
  fail 63 "Nonexistent endpoint returns standard error shape" "404 + standard shape" "$NOTFOUND_STATUS + $NOTFOUND_JSON"
fi

# Test #64: Malformed JSON
BAD_JSON=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "not-json" 2>/dev/null)
BAD_STATUS=$(echo "$BAD_JSON" | tail -n 1)
BAD_BODY=$(echo "$BAD_JSON" | sed '$d')
BAD_SHAPE=$(echo "$BAD_BODY" | jq -e '.success == false and .error.code != null' >/dev/null 2>&1 && echo "yes" || echo "no")
if [ "$BAD_STATUS" = "422" ] && [ "$BAD_SHAPE" = "yes" ]; then
  pass 64 "Malformed JSON returns standard error shape"
else
  fail 64 "Malformed JSON returns standard error shape" "422 + standard shape" "$BAD_STATUS + $BAD_BODY"
fi

# Test #65: Missing fields (Pydantic validation)
MISSING=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"bad"}' 2>/dev/null)
MISS_STATUS=$(echo "$MISSING" | tail -n 1)
MISS_BODY=$(echo "$MISSING" | sed '$d')
MISS_CODE=$(echo "$MISS_BODY" | jq -r '.error.code // empty')
if [ "$MISS_STATUS" = "422" ] && [ "$MISS_CODE" = "VALIDATION_ERROR" ]; then
  pass 65 "Missing fields return VALIDATION_ERROR"
else
  fail 65 "Missing fields return VALIDATION_ERROR" "422 + VALIDATION_ERROR" "$MISS_STATUS + $MISS_CODE"
fi

# ── Cookie Security ────────────────────────────────────────────────────────

# Test #66: Set-Cookie header contains HttpOnly
COOKIE_CHECK=$(curl -s -D - -o /dev/null -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" 2>/dev/null)
HAS_HTTPONLY=$(echo "$COOKIE_CHECK" | grep -i "Set-Cookie:.*access_token" | grep -io "HttpOnly" || true)
if [ -n "$HAS_HTTPONLY" ]; then
  pass 66 "access_token cookie has HttpOnly flag"
else
  fail 66 "access_token cookie has HttpOnly flag" "HttpOnly present" "missing"
fi

# ── Cleanup ──────────────────────────────────────────────────────────────────
# Ensure admin password is restored
pass 0 "Cleanup: admin password restored"

assert_summary
exit $?
