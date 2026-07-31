// @ts-check
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  // Wait for 5 seconds before starting
  await page.waitForTimeout(5000);

  // Set viewport to 2560x1440
  await page.setViewportSize({ width: 2560, height: 1440 });

  await page.goto('https://gamecenter.flarie.com/cff63f8b-5eba-4c79-b604-b17b2c5a1a75');

  // Scroll to a specific coordinate (x: 0, y: 0)
  await page.evaluate(() => window.scrollTo(0, 0));

  // Wait 8 seconds at the end
  await page.waitForTimeout(8000);

  // Login

  

  // Alternative: Scroll to a specific element by selector
  // await page.locator('#element-id').scrollIntoViewIfNeeded();

  // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Game Center/);

});

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
