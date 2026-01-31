#!/usr/bin/env node

/**
 * Lint Status Checker
 * Shows a summary of current linting issues
 */

const { execSync } = require('child_process');

try {
  console.log('🔍 Checking ESLint status...\n');

  // Run ESLint and capture output
  const output = execSync('npx eslint . --format=compact', {
    encoding: 'utf8',
    cwd: process.cwd(),
    stdio: 'pipe'
  });

  const lines = output.trim().split('\n');
  const errorCount = lines.filter(line => line.includes('error')).length;
  const warningCount = lines.filter(line => line.includes('warning')).length;

  console.log(`📊 Lint Summary:`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`⚠️  Warnings: ${warningCount}`);
  console.log(`📝 Total Issues: ${errorCount + warningCount}`);

  if (errorCount === 0 && warningCount === 0) {
    console.log('\n✅ All linting issues resolved!');
  } else {
    console.log('\n🔧 Top issues:');
    lines.slice(0, 10).forEach((line, i) => {
      if (line.trim()) console.log(`${i + 1}. ${line}`);
    });
  }

} catch (error) {
  const output = error.stdout || error.stderr || '';
  const lines = output.trim().split('\n');
  const errorCount = lines.filter(line => line.includes('error')).length;
  const warningCount = lines.filter(line => line.includes('warning')).length;

  console.log(`📊 Lint Summary:`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`⚠️  Warnings: ${warningCount}`);
  console.log(`📝 Total Issues: ${errorCount + warningCount}`);

  if (errorCount + warningCount > 0) {
    console.log('\n🔧 Top issues:');
    lines.slice(0, 10).forEach((line, i) => {
      if (line.trim()) console.log(`${i + 1}. ${line}`);
    });
  }
}