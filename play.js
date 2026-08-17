// Reuses the persistent profile from login.js, so you are already logged in
// everywhere. Put your game automation where indicated.
//   npm run play
import { chromium } from '@playwright/test';

// Allow overriding the profile name (default to 'user-data')
const profileName = process.env.PROFILE || 'user-data';
// Support both 'user-hampus' and 'hampus' by checking if the user passed the full folder name
const profileFolder = profileName.startsWith('user-') ? profileName : `user-${profileName}`;
const userDataDir = process.env.USER_DATA_DIR || `./${profileFolder}`;

async function createBrowserContext() {
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: process.env.HEADLESS !== 'false',
    viewport: process.env.LOW_RESOURCE === 'true' ? { width: 450, height: 800 } : { width: 1280, height: 720 },
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
      // Audio & GPU / Canvas Memory Optimizations
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
    // Block media and fonts to save memory and CPU
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

  // Attach Chrome DevTools Protocol session to throttle frame rate / CPU work
  try {
    const client = await context.newCDPSession(page);
    // Emulate CPU throttling (4x slowing down frame loop dramatically reduces RAM/CPU spikes)
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  } catch (cdpErr) {
    console.warn('Could not attach CDP session for CPU throttling:', cdpErr.message);
  }

  await page.goto('https://gamecenter.flarie.com/cff63f8b-5eba-4c79-b604-b17b2c5a1a75');
  console.log('Waiting for game to load...');
  await page.waitForTimeout(4000);

  // PLAY
  await page.getByTestId('game-image-background').nth(3).click();
  await page.waitForTimeout(4000);

  return page;
}

async function playGame(page) {
    console.log('Starting a new game - ' + new Date().toLocaleString());
    await page.locator('iframe[title="evolve"]').contentFrame().getByTestId('START_BUTTON_CONTAINER').click({ force: true });
    await page.waitForTimeout(3000);

    // Spela 50-90 tryck
    let numClicks = Math.floor(Math.random() * (100 - 90 + 1)) + 90; // Random number between 90 and 100
    for (let i = 0; i < numClicks; i++) {

        let waitSeconds = Math.random() * (1500 - 1250) + 1250; // Random wait between 1.25 and 1.5 seconds

        await page.waitForTimeout(waitSeconds);

        let randomX = 377;
        let randomY = 351;

        await page.locator('iframe[title="evolve"]').contentFrame().locator('canvas').click({
        position: {
            x: randomX,
            y: randomY
        },
        force: true
        });

        // Trigger manual V8 Garbage Collection every 20 clicks to purge Canvas buffer leaks
        if (i % 20 === 0) {
          try {
            await page.evaluate(() => { if (window.gc) window.gc(); });
          } catch (e) {
            // Ignore if gc is unavailable
          }
        }
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

// Spela igen - Recreates context every 5 rounds to prevent WebGL context memory buildup
let gameCount = 0;
let currentContext = await createBrowserContext();
let page = await setupPage(currentContext);

while (true) {
    try {
        await playGame(page);
        gameCount++;
        console.log(`Game finished (#${gameCount}) - ` + new Date().toLocaleString());
        await page.waitForTimeout(5000);

        // Every 5 games, close the browser context completely to free WebGL texture RAM back to OS
        if (gameCount % 5 === 0) {
            console.log('--- Cleaning up browser memory: Relaunching Context ---');
            await currentContext.close();
            currentContext = await createBrowserContext();
            page = await setupPage(currentContext);
        }
    } catch (err) {
        console.error('⚠️ Error inside game round loop:', err);
        await page.waitForTimeout(10000);
        try {
            await currentContext.close();
            currentContext = await createBrowserContext();
            page = await setupPage(currentContext);
        } catch (reloadErr) {
            console.error('Failed to restart context after error:', reloadErr);
        }
    }
}