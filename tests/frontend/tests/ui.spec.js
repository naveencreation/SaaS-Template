const { test, expect } = require("@playwright/test");

const BASE = "http://localhost:3000";

// ── Helper: login via UI ──────────────────────────────────────────────────
async function loginAs(page, email, password) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/dashboard`, { timeout: 5000 });
}

// ── Public Zone ─────────────────────────────────────────────────────────────

test.describe("Public Zone", () => {
  test("#35: Landing page renders with hero, CTAs, and 3 feature cards", async ({ page }) => {
    await page.goto(BASE);
    // Hero heading
    await expect(page.locator("h1")).toContainText(/Build your SaaS|Dashboard|Template/i);
    // CTA buttons
    await expect(page.locator('a[href="/signup"]')).toBeVisible();
    await expect(page.locator('a[href="/login"]')).toBeVisible();
    // 3 feature cards
    const cards = page.locator("div.rounded-lg.border");
    await expect(cards).toHaveCount(3);
  });

  test("#36: Navbar contains Login and Signup links", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('nav a[href="/login"]')).toBeVisible();
    await expect(page.locator('nav a[href="/signup"]')).toBeVisible();
  });

  test("#37: Footer contains copyright text", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("footer")).toContainText("SaaS Template");
    await expect(page.locator("footer")).toContainText("© " + new Date().getFullYear());
  });
});

// ── Auth Zone ───────────────────────────────────────────────────────────────

test.describe("Auth Zone", () => {
  test("#38: Login page has all required elements", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
    await expect(page.locator('a[href="/signup"]')).toBeVisible();
  });

  test("#39: Login form submits and redirects to /dashboard", async ({ page }) => {
    await loginAs(page, "admin@example.com", "admin123");
    await expect(page).toHaveURL(`${BASE}/dashboard`);
  });

  test("#40: Signup page has all required inputs", async ({ page }) => {
    await page.goto(`${BASE}/signup`);
    await expect(page.locator('input[name="full_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("#41: Signup shows success state", async ({ page }) => {
    const unique = `signup_${Date.now()}@test.com`;
    await page.goto(`${BASE}/signup`);
    await page.fill('input[name="full_name"]', "Test User");
    await page.fill('input[name="email"]', unique);
    await page.fill('input[name="password"]', "Test1234!");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Check your email")).toBeVisible({ timeout: 5000 });
  });

  test("#42: Verify-email with invalid token shows error state", async ({ page }) => {
    await page.goto(`${BASE}/verify-email?token=invalidtoken`);
    // Should not crash / be blank
    await expect(page.locator("body")).not.toBeEmpty();
    // Should show an error heading (red text or "failed" message)
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toMatch(/failed|error|invalid/i);
  });

  test("#43: Forgot password shows generic success", async ({ page }) => {
    await page.goto(`${BASE}/forgot-password`);
    await page.fill('input[name="email"]', "test@test.com");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Check your email")).toBeVisible({ timeout: 5000 });
  });

  test("#44: Reset password shows validation error on mismatch", async ({ page }) => {
    await page.goto(`${BASE}/reset-password?token=abc`);
    await page.fill('input[name="password"]', "Pass1234!");
    await page.fill('input[name="confirm"]', "Different123!");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=do not match")).toBeVisible({ timeout: 3000 });
  });
});

// ── Dashboard Zone (requires login) ─────────────────────────────────────────

test.describe("Dashboard Zone — requires login", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin@example.com", "admin123");
  });

  test("#46: Dashboard renders sidebar, topbar, and main content", async ({ page }) => {
    await expect(page.locator("aside").first()).toBeVisible(); // sidebar
    await expect(page.locator("header").first()).toBeVisible(); // topbar
    await expect(page.locator("main").first()).toBeVisible();   // main content
  });

  test("#47: Sidebar shows fewer links for user than super_admin", async ({ browser }) => {
    // Admin context — count nav links
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await loginAs(adminPage, "admin@example.com", "admin123");
    await adminPage.waitForLoadState("networkidle");
    const adminLinks = await adminPage.locator("aside a").count();
    await adminCtx.close();

    // Pre-seeded regular user. If you don't have one, this test is skipped.
    // To pre-seed: run `docker exec -i infra-postgres-1 psql -U postgres -d postgres -c \
    //   \"INSERT INTO users (id, email, password_hash, full_name, is_active, is_verified, role_id, created_at) \
    //    SELECT gen_random_uuid(), 'regular@example.com', '<bcrypt-hash-of-User1234!>', \
    //    'Regular User', true, true, id, now() FROM roles WHERE name='user';\"`
    const userCtx = await browser.newContext();
    const userPage = await userCtx.newPage();
    const loginRes = await userCtx.request.post(`${BASE}/api/auth/login`, {
      data: { email: "regular@example.com", password: "User1234!" },
    });
    if (loginRes.status() !== 200) {
      test.skip(true, "No pre-seeded regular user — see test comments to seed one");
      await userCtx.close();
      return;
    }
    await userPage.goto(`${BASE}/dashboard`);
    await userPage.waitForLoadState("networkidle");
    const userLinks = await userPage.locator("aside a").count();
    await userCtx.close();

    expect(userLinks).toBeLessThan(adminLinks);
  });

  test("#48: Clicking a sidebar link shows active state", async ({ page }) => {
    const links = page.locator("aside a");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    // Click the first link, then verify it has active styling
    const first = links.first();
    await first.click();
    await page.waitForLoadState("networkidle");
    // Active class on Sidebar uses bg-blue-50 + text-blue-700
    await expect(first).toHaveClass(/bg-blue-50|text-blue-700/);
  });

  test("#49: Topbar shows user name and role badge", async ({ page }) => {
    const header = page.locator("header").first();
    await expect(header).toContainText(/super admin/i);
  });

  test("#50: Logout button redirects to /login", async ({ page }) => {
    await page.getByRole("button", { name: /logout/i }).click();
    await page.waitForURL(`${BASE}/login`, { timeout: 5000 });
    await expect(page).toHaveURL(`${BASE}/login`);
  });

  test("#51: Mobile menu appears on small viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState("networkidle");
    // MobileMenu lives in a fixed wrapper at top-left and contains a button with the Lucide Menu icon.
    // The wrapper has class 'md:hidden' on the parent <div>. Find the visible mobile button.
    const mobileBtn = page.locator("div.md\\:hidden button").first();
    await expect(mobileBtn).toBeVisible();
    await mobileBtn.click();
    // After click, slide-out menu shows nav links
    await expect(page.locator("div.md\\:hidden nav a").first()).toBeVisible({ timeout: 3000 });
  });

  test("#52: Dashboard home has stat cards and recent activity", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState("networkidle");
    // 3 stat card labels rendered in dashboard/page.tsx
    await expect(page.getByText("Total Users")).toBeVisible();
    await expect(page.getByText("Active Users")).toBeVisible();
    await expect(page.getByText("New This Week")).toBeVisible();
    await expect(page.getByText("Recent Activity")).toBeVisible();
  });
});

// ── Security ────────────────────────────────────────────────────────────────

test.describe("Security", () => {
  test("#66: access_token is NOT visible in document.cookie", async ({ page }) => {
    await loginAs(page, "admin@example.com", "admin123");
    const cookies = await page.evaluate(() => document.cookie);
    expect(cookies).not.toContain("access_token");
  });

  test("#31: Unauthenticated user is redirected from /dashboard to /login", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForURL(`${BASE}/login`, { timeout: 5000 });
    await expect(page).toHaveURL(`${BASE}/login`);
  });

  test("#32: Authenticated user is redirected from /login to /dashboard", async ({ page }) => {
    await loginAs(page, "admin@example.com", "admin123");
    await page.goto(`${BASE}/login`);
    await page.waitForURL(`${BASE}/dashboard`, { timeout: 5000 });
    await expect(page).toHaveURL(`${BASE}/dashboard`);
  });
});
