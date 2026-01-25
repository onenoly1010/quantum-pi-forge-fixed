#!/usr/bin/env node
// Validate that package-lock.json contains expected versions for critical packages
const fs = require('fs');
const path = require('path');

const lockfilePath = path.resolve(process.cwd(), 'package-lock.json');
if (!fs.existsSync(lockfilePath)) {
  console.error('❌ package-lock.json not found. Run npm install to generate it.');
  process.exit(2);
}

const lock = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
const checks = [
  { name: 'picomatch', want: '2.3.1' },
  { name: 'ws', want: '8.17.1' }
];

function findVersion(lock, pkgName) {
  // package-lock v2 layout: dependencies object at root
  if (lock.dependencies && lock.dependencies[pkgName]) {
    return lock.dependencies[pkgName].version;
  }

  // fallback: search recursively
  const stack = Object.values(lock.dependencies || {});
  while (stack.length) {
    const node = stack.pop();
    if (node && node.version && node.name === pkgName) return node.version;
    if (node && node.dependencies) stack.push(...Object.values(node.dependencies));
  }
  return null;
}

let failed = false;
for (const c of checks) {
  const ver = findVersion(lock, c.name);
  if (!ver) {
    console.error(`❌ ${c.name} not found in package-lock.json`);
    failed = true;
  } else if (ver !== c.want) {
    console.error(`❌ ${c.name} version mismatch: found ${ver}, expected ${c.want}`);
    failed = true;
  } else {
    console.log(`✅ ${c.name} == ${c.want}`);
  }
}

if (failed) {
  console.error('\nAction: Add overrides to package.json and run `npm install` to regenerate package-lock.json, then commit the updated lockfile.');
  process.exit(1);
}
console.log('\nAll lockfile checks passed.');
process.exit(0);
