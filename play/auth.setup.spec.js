// @ts-check
import { test } from '@playwright/test';
import fs from 'fs';

// Run this ONCE to log in manually. It opens a real browser, lets you sign in,
// then saves the full session (cookies + localStorage) to auth.json.
// All other tests reuse auth.json, so you don't log in every run.
//   npm run login
test('setup - record session and cookies', async ({ page, context }) => {
  test.setTimeout(0); // no timeout; you control how long login takes

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('https://gamecenter.flarie.com/cff63f8b-5eba-4c79-b604-b17b2c5a1a75');

  // Pause: a browser window + inspector open. Log in manually, then click
  // "Resume" in the Playwright Inspector to continue and save the session.
  await page.pause();

  // Save the complete session state (cookies, local storage, session storage)
  await context.storageState({ path: 'auth.json' });

  // storageState does NOT include sessionStorage; many sites keep auth there.
  const sessionStorage = await page.evaluate(() => JSON.stringify(window.sessionStorage));
  fs.writeFileSync('session-storage.json', sessionStorage);

  console.log('✅ Session saved to auth.json (cookies+localStorage) and session-storage.json');
});
