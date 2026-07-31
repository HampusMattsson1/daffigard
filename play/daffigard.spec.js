// @ts-check
import { test, expect } from '@playwright/test';
import fs from 'fs';

test('has title', async ({ page }) => {
  // Cookies + localStorage come from auth.json. Restore sessionStorage too,
  // before any page script runs, so auth held in sessionStorage survives.
  if (fs.existsSync('session-storage.json')) {
    const session = fs.readFileSync('session-storage.json', 'utf-8');
    await page.addInitScript((data) => {
      const entries = JSON.parse(data);
      for (const [k, v] of Object.entries(entries)) window.sessionStorage.setItem(k, v);
    }, session);
  }

  // Navigate to the page (session will be loaded automatically)
  await page.goto('https://gamecenter.flarie.com/cff63f8b-5eba-4c79-b604-b17b2c5a1a75');

  // Scroll to a specific coordinate (x: 0, y: 0)
  // await page.evaluate(() => window.scrollTo(0, 0));

  // Wait to see the page
  // await page.waitForTimeout(8000);

  // Expect a title "to contain" a substring.
  // await expect(page).toHaveTitle(/Game Center/);

  // PLAY
  await page.getByTestId('game-image-background').nth(3).click();
  await page.locator('iframe[title="evolve"]').contentFrame().getByTestId('START_BUTTON_CONTAINER').click();
  await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
    position: {
      x: 309,
      y: 413
    }
  });
  await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
    position: {
      x: 254,
      y: 422
    }
  });
  await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
    position: {
      x: 161,
      y: 421
    }
  });
  await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
    position: {
      x: 230,
      y: 384
    }
  });
  await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
    position: {
      x: 289,
      y: 369
    }
  });
  await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
    position: {
      x: 290,
      y: 369
    }
  });
  await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
    position: {
      x: 232,
      y: 375
    }
  });
  await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
    position: {
      x: 305,
      y: 368
    }
  });
  await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
    position: {
      x: 211,
      y: 374
    }
  });
  await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
    position: {
      x: 231,
      y: 368
    }
  });
  await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
    position: {
      x: 224,
      y: 367
    }
  });
  await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
    position: {
      x: 222,
      y: 367
    }
  });
  await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
    position: {
      x: 222,
      y: 372
    }
  });
  await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
    position: {
      x: 44,
      y: 26
    }
  });
});
  // await expect(page).toHaveTitle(/Game Center/);
// });
