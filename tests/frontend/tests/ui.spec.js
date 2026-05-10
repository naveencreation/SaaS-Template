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
    await expect(page.locator("aside, nav")).toBeVisible(); // sidebar
    await expect(page.locator("header")).toBeVisible();     // topbar
    await expect(page.locator("main")).toBeVisible();       // main content
  });

  test("#47: Sidebar shows fewer links for user than super_admin", async ({ browser }) => {
    // Admin context
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await loginAs(adminPage, "admin@example.com", "admin123");
    const adminLinks = await adminPage.locator("aside nav a, aside a").count();
    await adminCtx.close();

    // Create and login as a regular user via API, then count sidebar links
    const userCtx = await browser.newContext();
    const userPage = await userCtx.newPage();
    // First create a user with user role
    const signupRes = await userCtx.request.post(`${BASE}/api/auth/signup`, {
      data: {
        email: `dash_user_${Date.now()}@test.com`,
        password: "Test1234!",
        full_name: "Dash User",
      },
    });
    expect(signupRes.status()).toBe(201);
    // Login
    await loginAs(userPage, (await signupRes.json()).email || `dash_user_${Date.now()}@test.com`, "Test1234!");
    const userLinks = await userPage.locator("aside nav a, aside a").count();
    await userCtx.close();

    expect(userLinks).toBeLessThan(adminLinks);
  });

  test("#48: Clicking a sidebar link shows active state", async ({ page }) => {
    // Find the first sidebar link that is not the current page
    const link = page.locator("aside a").first();
    await link.click();
    await expect(link).toHaveClass(/bg-blue-50|text-blue-700|active/);
  });

  test("#49: Topbar shows user name and role badge", async ({ page }) => {
    await expect(page.locator("header")).toContainText("admin");
    await expect(page.locator("header")).toContainText("super admin");
  });

  test("#50: Logout button redirects to /login", async ({ page }) => {
    await page.click("text=Logout");
    await page.waitForURL(`${BASE}/login`, { timeout: 5000 });
    await expect(page).toHaveURL(`${BASE}/login`);
  });

  test("#51: Mobile menu appears on small viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/dashboard`);
    const menuBtn = page.locator("button svg").filter({ hasText: /Menu|menu|hamburger/i }).first() ||
                    page.locator("button:has(svg)").first();
    // Look for hamburger/menu button
    const btn = page.locator("[data-testid='mobile-menu-button'], button:has(svg)").first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await expect(page.locator("nav")).toBeVisible();
    } else {
      // Fallback: look for any button that might open mobile menu
      const allBtns = page.locator("button");
      const count = await allBtns.count();
      for (let i = 0; i < count; i++) {
        const b = allBtns.nth(i);
        if (await b.isVisible().catch(() => false)) {
          await b.click();
          const navVisible = await page.locator("nav a").first().isVisible().catch(() => false);
          if (navVisible) break;
        }
      }
      await expect(page.locator("nav a").first()).toBeVisible();
    }
  });

  test("#52: Dashboard home has stat cards and recent activity", async ({ page }) => {
    // Re-login (logout may have happened in previous test)
    await loginAs(page, "admin@example.com", "admin123");
    await page.goto(`${BASE}/dashboard`);
    // At least 3 stat cards
    const cards = page.locator("main >> div >> div").first().locator("div");
    expect(await cards.count()).toBeGreaterThanOrEqual(3);
    // Recent Activity section
    await expect(page.locator("text=Recent Activity")).toBeVisible();
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
