// Reuses the persistent profile from login.js, so you are already logged in
// everywhere. Put your game automation where indicated.
//   npm run play
import { chromium } from '@playwright/test';
import path from 'path';

// Allow overriding the profile name
const profileName = process.env.PROFILE;
let userDataDir = process.env.USER_DATA_DIR;

if (!userDataDir && profileName) {
  // Support both 'user-hampus' and 'hampus' by checking if the user passed the full folder name
  const profileFolder = profileName.startsWith('user-') ? profileName : `user-${profileName}`;
  userDataDir = path.join(process.cwd(), profileFolder);
}

const context = await chromium.launchPersistentContext(userDataDir, {
  headless: process.env.HEADLESS !== 'false',
  viewport: process.env.LOW_RESOURCE === 'true' ? { width: 450, height: 800 } : { width: 1920, height: 1080 },
  args: [
    '--disable-dev-shm-usage',
    '--no-sandbox',
  ].concat(process.env.LOW_RESOURCE === 'true' ? [
    '--disable-gpu',
    '--js-flags="--max-old-space-size=256"',
    '--disable-audio-output',
    '--disable-canvas-aa',
    '--disable-2d-canvas-clip-aa',
    '--disable-gl-drawing-for-tests',
    '--disable-software-rasterizer',
    '--no-first-run',
  ] : [])
});
const page = context.pages()[0] ?? (await context.newPage());

if (process.env.LOW_RESOURCE === 'true') {
  // Only block media (videos, audio) and fonts to save memory and CPU
  // We keep images and stylesheets so the layout/canvas rendering works correctly.
  await page.route('**/*', (route) => {
    const resourceType = route.request().resourceType();
    if (['media', 'font'].includes(resourceType)) {
      route.abort();
    } else {
      route.continue();
    }
  });
}

await page.goto('https://gamecenter.flarie.com/ceef65b7-325a-4750-9872-af7f6c97ff2a');

console.log('Waiting for billys to load...');

await page.getByTestId('game-image-background').first().click();

await page.waitForTimeout(4000);

async function playGame() {
    await page.locator('iframe[title="platform"]').contentFrame().getByTestId('START_BUTTON_CONTAINER').click();

    await page.waitForTimeout(2500);

    // Hold space key for 5 seconds
    await page.keyboard.down('Space');
    await page.waitForTimeout(5000);
    await page.keyboard.up('Space');

    // Keep holding space until START_BUTTON_CONTAINER appears
    let buttonFound = false;
    while (!buttonFound) {
      const startButton = page.locator('iframe[title="platform"]').contentFrame().getByTestId('START_BUTTON_CONTAINER');
      buttonFound = await startButton.isVisible().catch(() => false);
      
      if (!buttonFound) {
        await page.keyboard.down('Space');
        await page.waitForTimeout(5000);
        await page.keyboard.up('Space');
      }
    }

    await page.waitForTimeout(2500);
}

while (true) { // Change this to a higher number for more rounds
    try {
        await playGame();
        console.log('Game finished - ' + new Date().toLocaleString());
        await page.waitForTimeout(2000);
    } catch (err) {
        console.error('⚠️ Error inside game round loop:', err);
        // Stagger retry to avoid high CPU spiraling
        await page.waitForTimeout(10000);
        // Reload page to start fresh
        try {
            await page.reload();
            await page.waitForTimeout(5000);
        } catch (reloadErr) {
            console.error('Failed to reload page after error:', reloadErr);
        }
    }
}