# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui.spec.js >> Dashboard Zone — requires login >> #50: Logout button redirects to /login
- Location: tests\ui.spec.js:163:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 5000ms exceeded.
=========================== logs ===========================
waiting for navigation to "http://localhost:3000/dashboard" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - heading "Log in" [level=2] [ref=e5]
    - paragraph [ref=e6]: Welcome back! Please enter your details.
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: Email*
        - textbox "Email*" [ref=e10]:
          - /placeholder: you@example.com
          - text: admin@example.com
      - generic [ref=e11]:
        - generic [ref=e12]: Password*
        - textbox "Password*" [ref=e13]:
          - /placeholder: ••••••••
          - text: admin123
      - paragraph [ref=e14]: Invalid credentials.
      - button "Log in" [ref=e15] [cursor=pointer]
    - paragraph [ref=e16]:
      - link "Forgot password?" [ref=e17] [cursor=pointer]:
        - /url: /forgot-password
    - paragraph [ref=e18]:
      - text: Don't have an account?
      - link "Sign up" [ref=e19] [cursor=pointer]:
        - /url: /signup
  - alert [ref=e20]
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
> 11  |   await page.waitForURL(`${BASE}/dashboard`, { timeout: 5000 });
      |              ^ TimeoutError: page.waitForURL: Timeout 5000ms exceeded.
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
  22  |     await expect(page.locator('a[href="/signup"]')).toBeVisible();
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
```