// One-time login using a persistent profile that stores EVERYTHING:
// HttpOnly cookies on every domain, localStorage, sessionStorage, IndexedDB.
//   npm run login
// Sign in, then just close the browser window.
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Allow overriding the profile name (default to 'user-data')
const profileName = process.env.PROFILE || 'user-data';
const profileFolder = profileName.startsWith('user-') ? profileName : `user-${profileName}`;
const profilePath = path.resolve(`./${profileFolder}`);

const context = await chromium.launchPersistentContext(profilePath, {
  headless: false,
  viewport: { width: 1920, height: 1080 },
  // Prevent Chromium from generating unnecessary disk and GPU caches
  args: [
    '--disk-cache-size=1',
    '--media-cache-size=1',
    '--disable-gpu-shader-disk-cache',
    '--disable-component-update',
    '--disable-extensions',
  ],
});

const page = context.pages()[0] ?? (await context.newPage());
// await page.goto('https://gamecenter.flarie.com/cff63f8b-5eba-4c79-b604-b17b2c5a1a75'); // Dafgård
await page.goto('https://gamecenter.flarie.com/ceef65b7-325a-4750-9872-af7f6c97ff2a'); // Billys

console.log('🔑 Log in, then close the browser window to save the session.');
await context.waitForEvent('close', { timeout: 0 });

// Wait briefly for Chromium process to completely release file locks
await new Promise((resolve) => setTimeout(resolve, 1000));

// Purge GPU, shader, crash logs, and HTTP cache directories
function pruneProfileCache(targetDir: string) {
  const junkPaths = [
    // GPU & Shader caches
    'GPUCache',
    'GrShaderCache',
    'ShaderCache',
    'DawnCache',
    'DawnGraphiteCache',
    // Disk & Media caches
    'Cache',
    'Code Cache',
    'Media Cache',
    // Telemetry & Crash logs
    'Crashpad',
    'Crash Reports',
    'BrowserMetrics',
    // Temporary service worker caches (preserves IndexedDB/Cookies)
    'Service Worker/CacheStorage',
    'Service Worker/ScriptCache',
  ];

  // Most caches live inside the 'Default' subfolder of the persistent context
  const baseDir = fs.existsSync(path.join(targetDir, 'Default'))
    ? path.join(targetDir, 'Default')
    : targetDir;

  for (const subDir of junkPaths) {
    const fullPath = path.join(baseDir, subDir);
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`🧹 Removed cache: ${subDir}`);
      } catch (err) {
        console.warn(`⚠️ Could not remove ${subDir}:`, err);
      }
    }
  }
}

pruneProfileCache(profilePath);
console.log('✅ Clean profile saved successfully!');