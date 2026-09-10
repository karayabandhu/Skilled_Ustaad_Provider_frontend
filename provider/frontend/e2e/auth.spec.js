import { test, expect } from "@playwright/test";

test.describe("Provider Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // We expect the app to be running at localhost:5173
    await page.goto("/");
  });

  test("should load the home page correctly", async ({ page }) => {
    // Check if the title exists
    await expect(page).toHaveTitle(/Provider/i);
    // Find the main action button
    const registerButton = page.getByRole("button", { name: /Register as Provider/i });
    await expect(registerButton).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    // Find login button/link and click
    const loginLink = page.getByRole("link", { name: /login/i });
    if (await loginLink.count() > 0) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test("should show error boundary when navigating to a broken page (if any)", async ({ page }) => {
    // This is a placeholder for testing the error boundary in E2E
    // You can simulate a crash by visiting a route that throws an error
    // For now, we just verify the app doesn't crash on standard routes
    await page.goto("/profile");
    // Should redirect to home if not logged in
    await expect(page).toHaveURL(/\/$/);
  });
});
