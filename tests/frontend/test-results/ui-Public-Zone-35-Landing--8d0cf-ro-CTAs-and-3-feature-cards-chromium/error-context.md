# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui.spec.js >> Public Zone >> #35: Landing page renders with hero, CTAs, and 3 feature cards
- Location: tests\ui.spec.js:17:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('a[href="/signup"]')
Expected: visible
Error: strict mode violation: locator('a[href="/signup"]') resolved to 2 elements:
    1) <a href="/signup" class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Sign up</a> aka getByRole('link', { name: 'Sign up' })
    2) <a href="/signup" class="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700">Get Started</a> aka getByRole('link', { name: 'Get Started' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('a[href="/signup"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e4]:
        - link "SaaS Template" [ref=e5] [cursor=pointer]:
          - /url: /
        - generic [ref=e6]:
          - link "Log in" [ref=e7] [cursor=pointer]:
            - /url: /login
          - link "Sign up" [ref=e8] [cursor=pointer]:
            - /url: /signup
    - main [ref=e9]:
      - generic [ref=e10]:
        - heading "Build your SaaS faster" [level=1] [ref=e11]
        - paragraph [ref=e12]: A production-grade starter template with auth, RBAC, dashboard, and business logic patterns. Focus on your product, not the boilerplate.
        - generic [ref=e13]:
          - link "Get Started" [ref=e14] [cursor=pointer]:
            - /url: /signup
          - link "Log in" [ref=e15] [cursor=pointer]:
            - /url: /login
        - generic [ref=e16]:
          - generic [ref=e17]:
            - heading "Authentication" [level=3] [ref=e18]
            - paragraph [ref=e19]: JWT + OAuth + email verification out of the box.
          - generic [ref=e20]:
            - heading "Role-Based Access" [level=3] [ref=e21]
            - paragraph [ref=e22]: 4 roles, route guards, and force logout on role change.
          - generic [ref=e23]:
            - heading "Pluggable Business Logic" [level=3] [ref=e24]
            - paragraph [ref=e25]: Add a feature with 4 files and 2 config lines.
    - contentinfo [ref=e26]: © 2026 SaaS Template. All rights reserved.
  - alert [ref=e27]
```

# Test source

```ts
  1   | const { test, expect } = require("@playwright/test");
  2   | 
  3   | const BASE = "http://localhost:3000";
  4   | 
  5   | // ── Helper: login via UI ──────────────────────────────────────────────────
  6   | async function loginAs(page, email, password) {
  7   |   await page.goto(`${BASE}/login`);
  8   |   await page.fill('input[name="email"]', email);
  9   |   await page.fill('input[name="password"]', password);
  10  |   await page.click('button[type="submit"]');
  11  |   await page.waitForURL(`${BASE}/dashboard`, { timeout: 5000 });
  12  | }
  13  | 
  14  | // ── Public Zone ─────────────────────────────────────────────────────────────
  15  | 
  16  | test.describe("Public Zone", () => {
  17  |   test("#35: Landing page renders with hero, CTAs, and 3 feature cards", async ({ page }) => {
  18  |     await page.goto(BASE);
  19  |     // Hero heading
  20  |     await expect(page.locator("h1")).toContainText(/Build your SaaS|Dashboard|Template/i);
  21  |     // CTA buttons
> 22  |     await expect(page.locator('a[href="/signup"]')).toBeVisible();
      |                                                     ^ Error: expect(locator).toBeVisible() failed
  23  |     await expect(page.locator('a[href="/login"]')).toBeVisible();
  24  |     // 3 feature cards
  25  |     const cards = page.locator("div.rounded-lg.border");
  26  |     await expect(cards).toHaveCount(3);
  27  |   });
  28  | 
  29  |   test("#36: Navbar contains Login and Signup links", async ({ page }) => {
  30  |     await page.goto(BASE);
  31  |     await expect(page.locator('nav a[href="/login"]')).toBeVisible();
  32  |     await expect(page.locator('nav a[href="/signup"]')).toBeVisible();
  33  |   });
  34  | 
  35  |   test("#37: Footer contains copyright text", async ({ page }) => {
  36  |     await page.goto(BASE);
  37  |     await expect(page.locator("footer")).toContainText("SaaS Template");
  38  |     await expect(page.locator("footer")).toContainText("© " + new Date().getFullYear());
  39  |   });
  40  | });
  41  | 
  42  | // ── Auth Zone ───────────────────────────────────────────────────────────────
  43  | 
  44  | test.describe("Auth Zone", () => {
  45  |   test("#38: Login page has all required elements", async ({ page }) => {
  46  |     await page.goto(`${BASE}/login`);
  47  |     await expect(page.locator('input[name="email"]')).toBeVisible();
  48  |     await expect(page.locator('input[name="password"]')).toBeVisible();
  49  |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  50  |     await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
  51  |     await expect(page.locator('a[href="/signup"]')).toBeVisible();
  52  |   });
  53  | 
  54  |   test("#39: Login form submits and redirects to /dashboard", async ({ page }) => {
  55  |     await loginAs(page, "admin@example.com", "admin123");
  56  |     await expect(page).toHaveURL(`${BASE}/dashboard`);
  57  |   });
  58  | 
  59  |   test("#40: Signup page has all required inputs", async ({ page }) => {
  60  |     await page.goto(`${BASE}/signup`);
  61  |     await expect(page.locator('input[name="full_name"]')).toBeVisible();
  62  |     await expect(page.locator('input[name="email"]')).toBeVisible();
  63  |     await expect(page.locator('input[name="password"]')).toBeVisible();
  64  |   });
  65  | 
  66  |   test("#41: Signup shows success state", async ({ page }) => {
  67  |     const unique = `signup_${Date.now()}@test.com`;
  68  |     await page.goto(`${BASE}/signup`);
  69  |     await page.fill('input[name="full_name"]', "Test User");
  70  |     await page.fill('input[name="email"]', unique);
  71  |     await page.fill('input[name="password"]', "Test1234!");
  72  |     await page.click('button[type="submit"]');
  73  |     await expect(page.locator("text=Check your email")).toBeVisible({ timeout: 5000 });
  74  |   });
  75  | 
  76  |   test("#42: Verify-email with invalid token shows error state", async ({ page }) => {
  77  |     await page.goto(`${BASE}/verify-email?token=invalidtoken`);
  78  |     // Should not crash / be blank
  79  |     await expect(page.locator("body")).not.toBeEmpty();
  80  |     // Should show an error heading (red text or "failed" message)
  81  |     const bodyText = await page.locator("body").textContent();
  82  |     expect(bodyText).toMatch(/failed|error|invalid/i);
  83  |   });
  84  | 
  85  |   test("#43: Forgot password shows generic success", async ({ page }) => {
  86  |     await page.goto(`${BASE}/forgot-password`);
  87  |     await page.fill('input[name="email"]', "test@test.com");
  88  |     await page.click('button[type="submit"]');
  89  |     await expect(page.locator("text=Check your email")).toBeVisible({ timeout: 5000 });
  90  |   });
  91  | 
  92  |   test("#44: Reset password shows validation error on mismatch", async ({ page }) => {
  93  |     await page.goto(`${BASE}/reset-password?token=abc`);
  94  |     await page.fill('input[name="password"]', "Pass1234!");
  95  |     await page.fill('input[name="confirm"]', "Different123!");
  96  |     await page.click('button[type="submit"]');
  97  |     await expect(page.locator("text=do not match")).toBeVisible({ timeout: 3000 });
  98  |   });
  99  | });
  100 | 
  101 | // ── Dashboard Zone (requires login) ─────────────────────────────────────────
  102 | 
  103 | test.describe("Dashboard Zone — requires login", () => {
  104 |   test.beforeEach(async ({ page }) => {
  105 |     await loginAs(page, "admin@example.com", "admin123");
  106 |   });
  107 | 
  108 |   test("#46: Dashboard renders sidebar, topbar, and main content", async ({ page }) => {
  109 |     await expect(page.locator("aside").first()).toBeVisible(); // sidebar
  110 |     await expect(page.locator("header").first()).toBeVisible(); // topbar
  111 |     await expect(page.locator("main").first()).toBeVisible();   // main content
  112 |   });
  113 | 
  114 |   test("#47: Sidebar shows fewer links for user than super_admin", async ({ browser }) => {
  115 |     // Admin context — count nav links
  116 |     const adminCtx = await browser.newContext();
  117 |     const adminPage = await adminCtx.newPage();
  118 |     await loginAs(adminPage, "admin@example.com", "admin123");
  119 |     await adminPage.waitForLoadState("networkidle");
  120 |     const adminLinks = await adminPage.locator("aside a").count();
  121 |     await adminCtx.close();
  122 | 
```