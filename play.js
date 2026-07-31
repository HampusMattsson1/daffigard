// Reuses the persistent profile from login.js, so you are already logged in
// everywhere. Put your game automation where indicated.
//   npm run play
import { chromium } from '@playwright/test';

// Allow overriding the profile name (default to 'user-data')
const profileName = process.env.PROFILE || 'user-data';
// Support both 'user-hampus' and 'hampus' by checking if the user passed the full folder name
const profileFolder = profileName.startsWith('user-') ? profileName : `user-${profileName}`;
const userDataDir = process.env.USER_DATA_DIR || `./${profileFolder}`;

const context = await chromium.launchPersistentContext(userDataDir, {
  headless: process.env.HEADLESS !== 'false',
  viewport: process.env.LOW_RESOURCE === 'true' ? { width: 450, height: 800 } : { width: 1280, height: 720 },
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

await page.goto('https://gamecenter.flarie.com/cff63f8b-5eba-4c79-b604-b17b2c5a1a75');

console.log('Waiting for game to load...');

// --- game automation goes here ---
await page.waitForTimeout(4000);

// PLAY
await page.getByTestId('game-image-background').nth(3).click();
await page.waitForTimeout(4000);

// let playTimeCount = 0; // Unlimited

async function playGame() {
    console.log('Starting a new game - ' + new Date().toLocaleString());
    await page.locator('iframe[title="evolve"]').contentFrame().getByTestId('START_BUTTON_CONTAINER').click({ force: true });
    await page.waitForTimeout(3000);

    // Spela 50-90 tryck
    let numClicks = Math.floor(Math.random() * (100 - 90 + 1)) + 90; // Random number between 90 and 100
    for (let i = 0; i < numClicks; i++) {

        let waitSeconds = Math.random() * (1500 - 1250) + 1250; // Random wait between 1.25 and 1.5 seconds

        await page.waitForTimeout(waitSeconds);

        // let randomX = Math.floor(Math.random() * (309 - 161 + 1)) + 161; // Random X between 161 and 309
        // let randomY = Math.floor(Math.random() * (422 - 369 + 1)) + 369; // Random Y between 369 and 422
        let randomX = 377
        let randomY = 351

        await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
        position: {
            x: randomX,
            y: randomY
        },
        force: true
        });
    }

    await page.waitForTimeout(3000);

    // Klicka tillbaka
    await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
    position: {
        x: 44,
        y: 26
    },
    force: true
    });
}

// Spela igen
while (true) { // Change this to a higher number for more rounds
    try {
        await playGame();
        console.log('Game finished - ' + new Date().toLocaleString());
        await page.waitForTimeout(5000);
    } catch (err) {
        console.error('⚠️ Error inside game round loop:', err);
        // Stagger retry to avoid high CPU spiraling
        await page.waitForTimeout(10000);
        // Reload page to start fresh
        try {
            await page.reload();
            await page.waitForTimeout(5000);
            await page.getByTestId('game-image-background').nth(3).click({ force: true });
            await page.waitForTimeout(4000);
        } catch (reloadErr) {
            console.error('Failed to reload page after error:', reloadErr);
        }
    }
}

// await context.close();
