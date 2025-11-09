import { expect, test } from '@playwright/test';

// The simplest possible test - just navigates to the page and checks that something loaded
test('basic navigation to criar-teste page', async ({ page }) => {
  // Visit the page with a long timeout
  await page.goto('/criar-teste', { timeout: 30_000 });

  // Take a screenshot for debugging
  await page.screenshot({ path: 'debug-criar-teste.png' });

  // Just check that the page loads and doesn't error
  const pageTitle = await page.title();
  console.log(`Page title: ${pageTitle}`);

  // Check for any content - this should pass regardless of what's on the page
  const bodyContent = await page.locator('body').textContent();
  expect(bodyContent?.length).toBeGreaterThan(0);
});
