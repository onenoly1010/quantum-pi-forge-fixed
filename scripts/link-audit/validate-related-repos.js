#!/usr/bin/env node

/**
 * validate-related-repos.js
 * 
 * Purpose: Validate that all markdown files have proper "Related Repositories" sections
 * 
 * Features:
 * - Checks main documentation files for "Related Repositories" sections
 * - Verifies subdirectory READMEs have "Return to Hub" links
 * - Validates repository link formatting
 * - Generates report of missing or incorrect sections
 * 
 * Usage: node scripts/link-audit/validate-related-repos.js
 * 
 * Output: Creates .audit-logs/missing-sections.txt with findings
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const REPO_ROOT = path.resolve(__dirname, '../..');
const LOG_DIR = path.join(REPO_ROOT, '.audit-logs');
const MISSING_SECTIONS_LOG = path.join(LOG_DIR, 'missing-sections.txt');

// Files that must have "Related Repositories" sections
const REQUIRED_RELATED_REPOS = [
  'README.md',
  'IDENTITY.md',
  'INDEX.md',
  'MASTER_URLS.md'
];

// Subdirectory READMEs that should have "Return to Hub" links
const SUBDIRECTORY_READMES = [
  'backend/README.md',
  'fastapi/README.md',
  'contracts/0g-uniswap-v2/README.md',
  'pi-network/README.md',
  'scripts/runbook/README.md',
  'evaluation/README.md',
  'spaces/llm-coherence-auditor/README.md',
  'spaces/qmix-theorem-viz/README.md',
  'docs/README_UPDATE.md'
];

// Expected repository references
const EXPECTED_REPOS = [
  'quantum-pi-forge-fixed',
  'quantum-pi-forge-site',
  'pi-forge-quantum-genesis'
];

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Initialize log
let logContent = '# Missing Sections Report\n';
logContent += `Generated: ${new Date().toUTCString()}\n\n`;

let issuesFound = 0;

console.log('🔍 Validating Related Repositories sections...\n');

/**
 * Check if a file contains a "Related Repositories" section
 */
function hasRelatedReposSection(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, found: false, reason: 'File does not exist' };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for various heading formats
  const patterns = [
    /##?\s+.*Related Repositories/i,
    /##?\s+🌐\s*Related Repositories/i,
    /##?\s+Related Projects/i,
    /##?\s+Ecosystem/i
  ];
  
  for (const pattern of patterns) {
    if (pattern.test(content)) {
      return { exists: true, found: true };
    }
  }
  
  return { exists: true, found: false, reason: 'Section not found' };
}

/**
 * Check if a file contains a "Return to Hub" or similar link
 */
function hasReturnToHubLink(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, found: false, reason: 'File does not exist' };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for return links
  const patterns = [
    /Return to.*(?:Main Repository|Hub|quantum-pi-forge-fixed)/i,
    /Back to.*(?:Main Repository|Hub|quantum-pi-forge-fixed)/i,
    /\[.*(?:Main Repository|Hub|Home)\].*quantum-pi-forge-fixed/i
  ];
  
  for (const pattern of patterns) {
    if (pattern.test(content)) {
      return { exists: true, found: true };
    }
  }
  
  return { exists: true, found: false, reason: 'Return link not found' };
}

/**
 * Check if file contains expected repository references
 */
function hasExpectedRepoReferences(filePath) {
  if (!fs.existsSync(filePath)) {
    return { missing: [] };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const missing = [];
  
  for (const repo of EXPECTED_REPOS) {
    // Check if repository is mentioned with proper GitHub URL
    const repoPattern = new RegExp(`github\\.com/onenoly1010/${repo}`, 'i');
    if (!repoPattern.test(content)) {
      missing.push(repo);
    }
  }
  
  return { missing };
}

// Check main documentation files for "Related Repositories" sections
console.log('📋 Checking main documentation files...');
for (const file of REQUIRED_RELATED_REPOS) {
  const filePath = path.join(REPO_ROOT, file);
  const result = hasRelatedReposSection(filePath);
  
  if (!result.exists) {
    console.log(`  ❌ ${file}: File missing`);
    logContent += `## Missing File: ${file}\n\n`;
    logContent += `- File does not exist in repository\n\n`;
    issuesFound++;
  } else if (!result.found) {
    console.log(`  ⚠️  ${file}: Missing "Related Repositories" section`);
    logContent += `## ${file}\n\n`;
    logContent += `- ❌ Missing "Related Repositories" section\n`;
    logContent += `- Expected: ## Related Repositories or ## 🌐 Related Repositories\n\n`;
    issuesFound++;
    
    // Check for repository references
    const repoCheck = hasExpectedRepoReferences(filePath);
    if (repoCheck.missing.length > 0) {
      logContent += `- ⚠️ Missing references to: ${repoCheck.missing.join(', ')}\n\n`;
    }
  } else {
    console.log(`  ✅ ${file}: Has "Related Repositories" section`);
    
    // Still check for missing repo references
    const repoCheck = hasExpectedRepoReferences(filePath);
    if (repoCheck.missing.length > 0) {
      console.log(`     ⚠️ Missing references to: ${repoCheck.missing.join(', ')}`);
      logContent += `## ${file}\n\n`;
      logContent += `- ⚠️ Missing references to: ${repoCheck.missing.join(', ')}\n\n`;
      issuesFound++;
    }
  }
}

console.log('');

// Check subdirectory READMEs for "Return to Hub" links
console.log('🔙 Checking subdirectory READMEs...');
for (const file of SUBDIRECTORY_READMES) {
  const filePath = path.join(REPO_ROOT, file);
  const result = hasReturnToHubLink(filePath);
  
  if (!result.exists) {
    console.log(`  ℹ️  ${file}: File does not exist (optional)`);
  } else if (!result.found) {
    console.log(`  ⚠️  ${file}: Missing "Return to Hub" link`);
    logContent += `## ${file}\n\n`;
    logContent += `- ❌ Missing "Return to Hub" link\n`;
    logContent += `- Expected: Link to main repository (quantum-pi-forge-fixed)\n`;
    logContent += `- Suggested format:\n\`\`\`markdown\n`;
    logContent += `> 🏠 **[Return to Main Repository](../../README.md)** | [View on GitHub](https://github.com/onenoly1010/quantum-pi-forge-fixed)\n`;
    logContent += `\`\`\`\n\n`;
    issuesFound++;
  } else {
    console.log(`  ✅ ${file}: Has "Return to Hub" link`);
  }
}

console.log('');

// Write summary to log
logContent += '\n## Summary\n\n';
logContent += `- Files checked: ${REQUIRED_RELATED_REPOS.length + SUBDIRECTORY_READMES.length}\n`;
logContent += `- Issues found: ${issuesFound}\n`;

if (issuesFound === 0) {
  logContent += '\n✅ All files have proper navigation sections!\n';
}

// Write log file
fs.writeFileSync(MISSING_SECTIONS_LOG, logContent);

// Output summary
console.log('📊 Summary:');
console.log(`  - Files checked: ${REQUIRED_RELATED_REPOS.length + SUBDIRECTORY_READMES.length}`);
console.log(`  - Issues found: ${issuesFound}`);
console.log('');

if (issuesFound > 0) {
  console.log(`⚠️ Found ${issuesFound} issue(s)`);
  console.log(`See ${MISSING_SECTIONS_LOG} for details`);
} else {
  console.log('✅ All validation checks passed!');
}

// Exit with success (we don't fail the workflow, just report)
process.exit(0);
