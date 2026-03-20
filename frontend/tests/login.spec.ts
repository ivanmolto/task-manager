import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("User can log in and reach the dashboard", async ({ page }) => {
    // Navigate to the app login
    await page.goto("http://localhost:3000/auth/login");

    // Ensure the page has loaded by checking for the primary input
    await expect(page.getByLabel(/email/i)).toBeVisible();

    // Fill credentials securely using environment variables
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD!);

    // Click the submit button
    await page.getByRole("button", { name: /sign in/i }).click();

    // Verify routing and dashboard rendering
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByText("Total Tasks")).toBeVisible();
  });
});
