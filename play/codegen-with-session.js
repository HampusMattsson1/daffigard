import { chromium } from 'playwright';

(async () => {
  const context = await chromium.launchPersistentContext('./user-simon', {
    headless: false
  });

  const page = context.pages()[0] || await context.newPage();

  await page.goto('https://gamecenter.flarie.com/cff63f8b-5eba-4c79-b604-b17b2c5a1a75');
  // await page.goto('https://gamecenter.flarie.com/ceef65b7-325a-4750-9872-af7f6c97ff2a'); // Billys

  await page.pause();
})();