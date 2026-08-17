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

async function createBrowserContext() {
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: process.env.HEADLESS !== 'false',
    viewport: process.env.LOW_RESOURCE === 'true' ? { width: 450, height: 800 } : { width: 1920, height: 1080 },
    args: [
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--disable-translate',
      '--metrics-recording-only',
      '--no-first-run',
      // Audio, GPU, and Canvas memory optimizations
      '--mute-audio',
      '--disable-audio-output',
      '--disable-audio-support-for-desktop',
      '--disable-gpu-vsync',
      '--disable-2d-canvas-clip-aa',
      '--disable-2d-canvas-image-chromium',
    ].concat(process.env.LOW_RESOURCE === 'true' ? [
      '--js-flags=--max-old-space-size=128 --expose-gc',
      '--disk-cache-size=1',
      '--media-cache-size=1',
      '--renderer-process-limit=1',
    ] : [])
  });

  if (process.env.LOW_RESOURCE === 'true') {
    // Only block media (videos, audio) and fonts to save memory and CPU
    await context.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (['media', 'font'].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });
  }

  return context;
}

async function setupPage(context) {
  const page = context.pages()[0] ?? (await context.newPage());

  // Attach Chrome DevTools Protocol session to throttle CPU & frame rates
  try {
    const client = await context.newCDPSession(page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  } catch (cdpErr) {
    console.warn('Could not attach CDP session for CPU throttling:', cdpErr.message);
  }

  await page.goto('https://gamecenter.flarie.com/ceef65b7-325a-4750-9872-af7f6c97ff2a');
  console.log('Waiting for billys to load...');

  await page.getByTestId('game-image-background').first().click();
  await page.waitForTimeout(4000);

  return page;
}

async function playGame(page) {
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

    // Trigger manual V8 Garbage Collection after round completion
    try {
      await page.evaluate(() => { if (window.gc) window.gc(); });
    } catch (e) {}
}

let gameCount = 0;
let currentContext = await createBrowserContext();
let page = await setupPage(currentContext);

while (true) {
    try {
        await playGame(page);
        gameCount++;
        console.log(`Game finished (#${gameCount}) - ` + new Date().toLocaleString());
        await page.waitForTimeout(2000);

        // Every 5 games, close the browser context completely to completely release memory back to the OS
        if (gameCount % 5 === 0) {
            console.log('--- Cleaning up browser memory: Relaunching Context ---');
            await currentContext.close();
            currentContext = await createBrowserContext();
            page = await setupPage(currentContext);
        }
    } catch (err) {
        console.error('⚠️ Error inside game round loop:', err);
        // Stagger retry to avoid high CPU spiraling
        await page.waitForTimeout(10000);
        // Reload context to start fresh
        try {
            await currentContext.close();
            currentContext = await createBrowserContext();
            page = await setupPage(currentContext);
        } catch (reloadErr) {
            console.error('Failed to restart context after error:', reloadErr);
        }
    }
}