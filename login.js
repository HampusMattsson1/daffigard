// One-time login using a persistent profile that stores EVERYTHING:
// HttpOnly cookies on every domain, localStorage, sessionStorage, IndexedDB.
//   npm run login
// Sign in, then just close the browser window.
import { chromium } from '@playwright/test';

// Allow overriding the profile name (default to 'user-data')
const profileName = process.env.PROFILE || 'user-data';
const profileFolder = profileName.startsWith('user-') ? profileName : `user-${profileName}`;

const context = await chromium.launchPersistentContext(`./${profileFolder}`, {
  headless: false,
  viewport: { width: 1920, height: 1080 },
});
const page = context.pages()[0] ?? (await context.newPage());
// await page.goto('https://gamecenter.flarie.com/cff63f8b-5eba-4c79-b604-b17b2c5a1a75'); // Dafgård
await page.goto('https://gamecenter.flarie.com/ceef65b7-325a-4750-9872-af7f6c97ff2a'); // Billys

console.log('🔑 Log in, then close the browser window to save the session.');
await context.waitForEvent('close', { timeout: 0 });
