import fs from 'fs';
import path from 'path';

// List of cache directories to purge while keeping session/cookies/IndexedDB
const JUNK_PATHS = [
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

// Lock files that prevent Chromium/Chrome from launching
const LOCK_FILES = [
  'SingletonLock',
  'SingletonCookie',
  'SingletonSocket',
];

// Calculate directory size in bytes
function getDirectorySize(dirPath) {
  let totalSize = 0;
  if (!fs.existsSync(dirPath)) return 0;

  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (err) {
    // Ignore permissions or locked files
  }
  return totalSize;
}

function cleanProfileDirectory(profileDir) {
  const absolutePath = path.resolve(profileDir);
  let freedBytes = 0;

  // -------------------------------------------------------------
  // 1. Remove Chromium process lock files
  // -------------------------------------------------------------
  for (const lockFile of LOCK_FILES) {
    const lockPath = path.join(absolutePath, lockFile);
    if (fs.existsSync(lockPath) || fs.lstatSync(lockPath, { throwIfNoEntry: false })) {
      try {
        fs.rmSync(lockPath, { force: true });
        console.log(`  🔓 Removed lock file: ${lockFile}`);
      } catch (err) {
        console.warn(`  ⚠️ Could not remove lock file ${lockFile}:`, err);
      }
    }
  }

  // -------------------------------------------------------------
  // 2. Remove junk / cache directories
  // -------------------------------------------------------------
  const subTargets = [
    absolutePath,
    path.join(absolutePath, 'Default'),
  ];

  for (const targetFolder of subTargets) {
    if (!fs.existsSync(targetFolder)) continue;

    for (const junkDir of JUNK_PATHS) {
      const fullPath = path.join(targetFolder, junkDir);

      if (fs.existsSync(fullPath)) {
        try {
          const size = getDirectorySize(fullPath);
          fs.rmSync(fullPath, { recursive: true, force: true });
          freedBytes += size;
          console.log(`  🧹 Removed: ${path.relative(absolutePath, fullPath)} (${(size / 1024 / 1024).toFixed(2)} MB)`);
        } catch (err) {
          console.warn(`  ⚠️ Could not remove ${fullPath}:`, err);
        }
      }
    }
  }

  return freedBytes;
}

// -------------------------------------------------------------
// Scan workspace for all folders starting with 'user'
// -------------------------------------------------------------
const projectRoot = process.cwd();
const userFolders = fs.readdirSync(projectRoot).filter((item) => {
  const fullPath = path.join(projectRoot, item);
  return item.startsWith('user') && fs.statSync(fullPath).isDirectory();
});

if (userFolders.length === 0) {
  console.log('❌ No folders starting with "user" were found in the current directory.');
} else {
  console.log(`🔍 Found ${userFolders.length} profile directory/directories: ${userFolders.join(', ')}\n`);
  
  let totalFreedBytes = 0;

  for (const folder of userFolders) {
    console.log(`📁 Cleaning: ${folder}`);
    const freed = cleanProfileDirectory(folder);
    totalFreedBytes += freed;
    console.log(`   Subtotal freed: ${(freed / 1024 / 1024).toFixed(2)} MB\n`);
  }

  console.log(`==========================================`);
  console.log(`✅ Total space saved across all user profiles: ${(totalFreedBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`==========================================`);
}