# SaaS Template — Manual Testing Guide

## Prerequisites

1. Docker Compose is running: `docker compose -f infra/docker-compose.yml ps` shows 5 running + 1 exited (`migrate`)
2. Frontend is accessible: `http://localhost:3000`
3. Backend is accessible via proxy: `http://localhost:3000/api`
4. MailHog is accessible: `http://localhost:8025`

---

## Section A: Infrastructure (Phase 1 + Phase 2)

### A1 — Containers Running
```bash
docker compose -f infra/docker-compose.yml ps
```
- [ ] `postgres` running
- [ ] `redis` running
- [ ] `mailhog` running
- [ ] `backend` running
- [ ] `frontend` running
- [ ] `migrate` exited (0)

### A2 — Health Endpoint
```bash
curl http://localhost:3000/api/health
```
- [ ] Returns `{"status":"ok"}`

### A3 — Postgres
```bash
# Get container name
docker ps --format '{{.Names}}' | grep postgres
docker exec <CONTAINER> pg_isready -U saas_user -d saas_db
```
- [ ] `accepting connections`

### A4 — Redis
```bash
docker exec <redis_container> redis-cli ping
```
- [ ] Returns `PONG`

### A5 — Backend Port Not Exposed Directly
```bash
curl http://localhost:8000/health
```
- [ ] `Connection refused` or timeout (should NOT be directly reachable)

### A6 — Migrations Applied
```bash
# Get container name for postgres
docker exec <CONTAINER> psql -U saas_user -d saas_db -c "SELECT version_num FROM alembic_version;"
```
- [ ] Returns a non-empty revision hash (e.g. `01860f1765c8`)

### A7 — Super Admin Exists
```bash
# Replace admin email with value from .env (SUPER_ADMIN_EMAIL)
# Default: admin@myapp.com
docker exec <CONTAINER> psql -U saas_user -d saas_db -c "SELECT email, role_id FROM users WHERE email='admin@myapp.com';"
```
- [ ] Returns 1 row with the admin email

### A8 — Roles Table
```bash
docker exec <CONTAINER> psql -U saas_user -d saas_db -c "SELECT name FROM roles ORDER BY id;"
```
- [ ] `super_admin`, `admin`, `manager`, `user` (4 rows)

### A9 — OAuth Accounts Table
```bash
docker exec <CONTAINER> psql -U saas_user -d saas_db -c "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='oauth_accounts');"
```
- [ ] Returns `true`

---

## Section B: API — Auth Flow (Phase 3)

Base URL: `http://localhost:3000/api`

### B1 — Signup
```bash
curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"manual_test@test.com","password":"Test1234!","full_name":"Manual Test"}'
```
- [ ] Status `201`
- [ ] JSON contains `"success": true`

### B2 — Verification Email Arrives
Open `http://localhost:8025` in browser.
- [ ] Email from `noreply@myapp.com` exists
- [ ] Subject contains "Verify your email"
- [ ] Body contains a link with `?token=...` (copy the token)

### B3 — Verify Email Endpoint
Use the token from B2:
```bash
curl -s -D - -o /dev/null -w "%{http_code}" \
  "http://localhost:3000/api/auth/verify-email?token=<PASTE_TOKEN>"
```
- [ ] Status `200`
- [ ] Response headers contain `Set-Cookie: access_token=...`

### B4 — Admin Login
Use credentials from `.env` (`SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`):
```bash
curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/auth/login" \
  -c /tmp/admin_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@myapp.com","password":"changeme123"}'
```
- [ ] Status `200`
- [ ] JSON contains `"success": true` and user info

### B5 — Get Current User (via Cookie)
```bash
curl -s -b /tmp/admin_cookies.txt "http://localhost:3000/api/auth/me"
```
- [ ] Status `200`
- [ ] JSON contains `user.email` matching admin email
- [ ] JSON contains `user.role` = `super_admin`

### B6 — Logout
```bash
curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/auth/logout" -b /tmp/admin_cookies.txt
```
- [ ] Status `200`
- [ ] `"success": true`

### B7 — Logged-Out Access Denied
```bash
curl -s -w "\n%{http_code}" -b /tmp/admin_cookies.txt "http://localhost:3000/api/auth/me"
```
- [ ] Status `401`
- [ ] JSON contains `error.code = NOT_AUTHENTICATED`

### B8 — Forgot Password
```bash
curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"manual_test@test.com"}'
```
- [ ] Status `200`
- [ ] `"success": true` (even if email doesn't exist — prevents enumeration)

### B9 — Reset Password
1. Open `http://localhost:8025` and find the reset email for `manual_test@test.com`
2. Copy the `?token=...` value from the link
3. Run:
```bash
curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"token":"<PASTE_TOKEN>","new_password":"NewPass456!"}'
```
- [ ] Status `200`
- [ ] `"success": true`

---

## Section C: API — RBAC (Phase 4)

**IMPORTANT: Re-login as admin before each RBAC test (cookie from B4 gets cleared on logout).**

### C1 — Re-login as Admin
```bash
curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/auth/login" \
  -c /tmp/admin_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@myapp.com","password":"changeme123"}'
```
- [ ] Status `200`

### C2 — List Users
```bash
curl -s -b /tmp/admin_cookies.txt "http://localhost:3000/api/users"
```
- [ ] Status `200`
- [ ] JSON contains `items` (array)
- [ ] JSON contains `total` (number)

### C3 — Get User by ID
From the list above, pick a user ID and run:
```bash
curl -s -b /tmp/admin_cookies.txt "http://localhost:3000/api/users/<ID>"
```
- [ ] Status `200`
- [ ] JSON contains correct `email` and `id`

### C4 — Update User Role
1. Find the `manager` role ID from Postgres:
```bash
docker exec <CONTAINER> psql -U saas_user -d saas_db -t -c "SELECT id FROM roles WHERE name='manager';"
```
2. Update the test user (from C3):
```bash
curl -s -w "\n%{http_code}" -X PUT "http://localhost:3000/api/users/<ID>/role" \
  -b /tmp/admin_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"role_id":"<MANAGER_ROLE_ID>"}'
```
- [ ] Status `200`
- [ ] JSON contains `role: manager`

### C5 — Deactivate User
```bash
curl -s -w "\n%{http_code}" -X PUT "http://localhost:3000/api/users/<ID>/active" \
  -b /tmp/admin_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"is_active":false}'
```
- [ ] Status `200`
- [ ] JSON contains `is_active: false`

### C6 — Deactivated User Cannot Login
```bash
curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"manual_test@test.com","password":"NewPass456!"}'
```
- [ ] Status `401`

### C7 — Delete User
```bash
curl -s -w "\n%{http_code}" -X DELETE "http://localhost:3000/api/users/<ID>" \
  -b /tmp/admin_cookies.txt
```
- [ ] Status `200`
- [ ] `"success": true`

### C8 — Update Own Profile
```bash
curl -s -w "\n%{http_code}" -X PUT "http://localhost:3000/api/users/me" \
  -b /tmp/admin_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Updated Admin"}'
```
- [ ] Status `200`
- [ ] JSON contains `full_name: Updated Admin`

### C9 — Change Own Password
```bash
curl -s -w "\n%{http_code}" -X PUT "http://localhost:3000/api/users/me/password" \
  -b /tmp/admin_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"current_password":"changeme123","new_password":"AdminNew456!"}'
```
- [ ] Status `200`
- [ ] `"success": true`

### C10 — Login with New Password
```bash
curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/auth/login" \
  -c /tmp/admin_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@myapp.com","password":"AdminNew456!"}'
```
- [ ] Status `200`

### C11 — Restore Admin Password (cleanup)
```bash
curl -s -X PUT "http://localhost:3000/api/users/me/password" \
  -b /tmp/admin_cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"current_password":"AdminNew456!","new_password":"changeme123"}'
```
- [ ] Status `200` (optional check)

---

## Section D: API — Error Shapes (Standard §10)

### D1 — Nonexistent Endpoint
```bash
curl -s -w "\n%{http_code}" "http://localhost:3000/api/nonexistent"
```
- [ ] Status `404`
- [ ] JSON contains `{ "success": false, "error": { "code": "...", "message": "...", "status": 404 } }`

### D2 — Malformed JSON
```bash
curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d 'not-json'
```
- [ ] Status `422`
- [ ] JSON contains `error.code` (e.g. `VALIDATION_ERROR` or `MALFORMED_JSON`)

### D3 — Missing Fields (Validation)
```bash
curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"bad"}'
```
- [ ] Status `422`
- [ ] JSON contains `error.code = VALIDATION_ERROR`

### D4 — Cookie Security (HttpOnly)
```bash
curl -s -D - -o /dev/null -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@myapp.com","password":"changeme123"}' | grep -i "Set-Cookie"
```
- [ ] `access_token` cookie contains `HttpOnly`
- [ ] `access_token` cookie does NOT appear in browser `document.cookie` (tested in Section F)

---

## Section E: Frontend — Public Zone (Phase 5)

Open `http://localhost:3000` in browser.

### E1 — Landing Page
- [ ] Hero section with "Sign up" and "Log in" buttons visible
- [ ] Feature cards visible
- [ ] Navbar has links to `/login` and `/signup`

### E2 — Signup Page
1. Click "Sign up"
2. Fill form:
   - Full name: `UI Test User`
   - Email: `uitest_$(date +%s)@test.com`
   - Password: `Test1234!`
3. Click "Sign up"
- [ ] Success message: "Check your email"
- [ ] No unhandled errors in browser console (F12 → Console)

### E3 — Verify Email (UI)
1. Open `http://localhost:8025`
2. Find the verification email
3. Click the link (or copy token and visit `http://localhost:3000/api/auth/verify-email?token=<TOKEN>`)
4. Browser should redirect to `/dashboard`
- [ ] Dashboard loads after clicking verification link

### E4 — Login Page
1. Open `http://localhost:3000/login`
2. Enter admin credentials (from `.env`)
3. Click "Log in"
- [ ] Redirects to `/dashboard`
- [ ] No errors in console

### E5 — Forgot Password Page
1. Open `http://localhost:3000/forgot-password`
2. Enter `uitest@test.com`
3. Click "Send reset link"
- [ ] Generic success message: "If an account exists with that email, we've sent a password reset link."

### E6 — Reset Password Validation
1. Open `http://localhost:3000/reset-password?token=abc`
2. Enter:
   - New password: `Pass1234!`
   - Confirm password: `Different123!`
3. Click "Reset password"
- [ ] Error: "Passwords do not match."

---

## Section F: Frontend — Dashboard Zone (Phase 5)

Log in as admin first (E4).

### F1 — Dashboard Layout
- [ ] Sidebar visible with navigation links
- [ ] Topbar visible with user name and role badge
- [ ] Main content area visible

### F2 — Sidebar Links (Super Admin)
- [ ] Links visible: Dashboard, Users, Analytics, Settings (or whatever your super_admin has)

### F3 — Sidebar Active State
1. Click a sidebar link (e.g., Users)
- [ ] URL changes to `/users`
- [ ] Active link is visually highlighted (different color/background)

### F4 — Topbar User Info
- [ ] Displays admin's full name
- [ ] Displays `super_admin` role badge

### F5 — Logout
1. Click "Logout" in topbar or sidebar
- [ ] Redirects to `/login`
- [ ] Going back to `/dashboard` redirects to `/login` (middleware protection)

### F6 — Mobile Menu (Small Viewport)
1. Resize browser to < 768px width (or use DevTools → Toggle Device Toolbar)
2. Click hamburger menu icon
- [ ] Sidebar slides in from the left
- [ ] Overlay/backdrop appears
- [ ] Clicking outside or close button hides sidebar

### F7 — Dashboard Home Content
- [ ] Stat cards visible (e.g., Total Users, Active Sessions, Revenue)
- [ ] Recent activity section visible

---

## Section G: Security Checks

### G1 — Cookie Not Accessible via JavaScript
1. Log in as admin (E4)
2. Open DevTools Console (F12 → Console)
3. Type: `document.cookie`
- [ ] `access_token` is **NOT** in the output (because it's `HttpOnly`)

### G2 — Redirect Unauthenticated Users
1. Clear cookies (DevTools → Application → Cookies → Delete all)
2. Visit `http://localhost:3000/dashboard`
- [ ] Redirects to `/login`

### G3 — Redirect Authenticated Users Away from Login
1. Log in as admin
2. Manually visit `http://localhost:3000/login`
- [ ] Redirects to `/dashboard`

### G4 — Non-Admin Cannot Access Admin Routes
1. Create a regular user (signup + verify email)
2. Log in as that user
3. Try visiting `http://localhost:3000/users` (admin-only route)
- [ ] Either 403 or redirect to dashboard with limited sidebar

---

## Troubleshooting Quick Reference

| Symptom | Likely Cause | Fix |
|---------|-----------|-----|
| `Connection refused` on :3000 | Frontend container down | `docker compose restart frontend` |
| `404 {"detail":"Not Found"}` | Old backend image running | `docker compose restart backend` |
| Login works but `/users` 401 | Proxy not converting cookie to `Authorization` | Must restart backend+frontend after code changes |
| MailHog shows no emails | MailHog container not running / emails deleted | `docker compose restart mailhog` |
| Test user doesn't exist | Signup not completed / wrong email | Check DB: `SELECT email FROM users;` |
| Admin login 401 | Wrong password or `.env` mismatch | Check `.env` `SUPER_ADMIN_PASSWORD` |

---

## Appendix: Quick Postgres Queries

```bash
# Connect to DB
docker exec -it <postgres_container> psql -U saas_user -d saas_db

# Check all users
SELECT id, email, full_name, role_id, is_active, is_verified FROM users;

# Check all roles
SELECT id, name FROM roles;

# Check migrations
SELECT * FROM alembic_version;

# Reset admin password (if you changed it and forgot)
UPDATE users SET password_hash='<generate bcrypt>' WHERE email='admin@myapp.com';
```

---

*Last updated: May 10, 2026*
