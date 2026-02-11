# 🚀 Cross-Repository Link Audit Setup Guide

> **Complete onboarding documentation for the automated link audit system**

This guide provides comprehensive instructions for setting up, configuring, and maintaining the Cross-Repository Link Audit workflow in the Quantum Pi Forge ecosystem.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)
8. [FAQ](#faq)

---

## Overview

### What Does It Do?

The Cross-Repository Link Audit System provides:

- **Automated Link Checking**: Validates all markdown links weekly
- **Documentation Consistency**: Ensures all READMEs have proper navigation
- **Constellation Mapping**: Auto-generates ecosystem overview
- **Automated Fixes**: Creates PRs with standardized links and sections
- **Issue Tracking**: Notifies maintainers of critical problems

### When Does It Run?

- **Automatically**: Every Sunday at 00:00 UTC (weekly)
- **On Pull Requests**: When documentation files are modified
- **Manually**: Via GitHub Actions workflow dispatch

### What Gets Generated?

- `CONSTELLATION_MAP.md` - Visual ecosystem overview
- `.audit-logs/` - Detailed validation reports
- Pull Requests - Automated fixes (when enabled)
- GitHub Issues - Critical failure notifications

---

## Prerequisites

### Required Tools

For local development and testing:

```bash
# Node.js (v14 or later)
node --version

# npm (usually bundled with Node.js)
npm --version

# Git
git --version

# Bash shell (Linux/macOS/WSL)
bash --version

# Optional: GitHub CLI for workflow management
gh --version
```

### Repository Permissions

Workflow requires these GitHub permissions (already configured in workflow file):

- `contents: write` - For creating branches and commits
- `issues: write` - For creating failure notifications
- `pull-requests: write` - For creating automated PRs

---

## Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/onenoly1010/quantum-pi-forge-fixed.git
cd quantum-pi-forge-fixed
```

### Step 2: Verify Scripts

Check that all scripts are present:

```bash
ls -la scripts/link-audit/
```

You should see:
- `check-links.sh` - Link validation script
- `validate-related-repos.js` - Section validation script
- `generate-constellation-map.js` - Constellation map generator
- `fix-links.sh` - Automated fix script
- `README.md` - Scripts documentation

### Step 3: Make Scripts Executable

```bash
chmod +x scripts/link-audit/*.sh
```

### Step 4: Install Optional Dependencies

For enhanced link checking (optional):

```bash
npm install -g markdown-link-check
```

### Step 5: Verify Workflow File

Check that workflow is present:

```bash
cat .github/workflows/cross-repo-link-audit.yml
```

---

## Configuration

### Workflow Configuration

The workflow is configured in `.github/workflows/cross-repo-link-audit.yml`.

#### Trigger Schedule

```yaml
schedule:
  - cron: '0 0 * * 0'  # Sunday at midnight UTC
```

To change schedule (e.g., daily at 2 AM UTC):

```yaml
schedule:
  - cron: '0 2 * * *'  # Every day at 2 AM UTC
```

#### File Paths to Monitor

```yaml
pull_request:
  paths:
    - '**.md'              # All markdown files
    - 'docs/**'            # Documentation directory
    - '.github/workflows/cross-repo-link-audit.yml'
    - 'scripts/link-audit/**'
```

Add more paths as needed:

```yaml
paths:
  - '**.md'
  - 'docs/**'
  - 'README*'           # All README files
  - 'CONTRIBUTING.md'   # Specific file
```

### Script Configuration

#### check-links.sh

Edit to skip certain URLs:

```bash
# In check-links.sh, line ~45
if [[ "$url" =~ (huggingface\.co|localhost|127\.0\.0\.1|example\.com|your-domain\.com) ]]; then
  return 0
fi
```

#### validate-related-repos.js

Edit to add/remove required files:

```javascript
// In validate-related-repos.js, line ~24
const REQUIRED_RELATED_REPOS = [
  'README.md',
  'IDENTITY.md',
  'INDEX.md',
  'MASTER_URLS.md',
  'YOUR_FILE.md'  // Add your file
];
```

#### generate-constellation-map.js

Edit to add new repositories:

```javascript
// In generate-constellation-map.js, line ~27
const CONSTELLATION = {
  core: {
    title: 'Core Repositories',
    icon: '🏛️',
    repos: [
      {
        name: 'your-new-repo',
        url: 'https://github.com/onenoly1010/your-new-repo',
        description: 'Description of your repository',
        status: 'active',  // 'active', 'archived', 'documented', 'planned'
        role: 'Your Role',
        technologies: ['Tech1', 'Tech2'],
        features: [
          'Feature 1',
          'Feature 2'
        ]
      }
      // ... existing repos
    ]
  }
  // ... other categories
};
```

---

## Usage

### Local Testing

#### Run All Checks

```bash
# From repository root
cd /path/to/quantum-pi-forge-fixed

# Check links
bash scripts/link-audit/check-links.sh

# Validate sections
node scripts/link-audit/validate-related-repos.js

# Generate constellation map
node scripts/link-audit/generate-constellation-map.js

# View results
ls -la .audit-logs/
cat .audit-logs/broken-links.txt
cat .audit-logs/missing-sections.txt
```

#### Run Automated Fixes

```bash
# Dry run - see what would be fixed
bash scripts/link-audit/check-links.sh
bash scripts/link-audit/fix-links.sh

# Check git status to see changes
git status
git diff

# Review changes before committing
git add -p

# Commit if satisfied
git commit -m "docs: fix cross-repository links"
```

### GitHub Actions Usage

#### View Workflow Status

```bash
# List recent runs
gh run list --workflow="cross-repo-link-audit.yml"

# View specific run
gh run view <run-id>

# View logs
gh run view <run-id> --log
```

#### Manual Trigger

```bash
# Report-only mode
gh workflow run "cross-repo-link-audit.yml" \
  -f report_only=true

# Auto-fix mode (creates PR)
gh workflow run "cross-repo-link-audit.yml" \
  -f fix_issues=true
```

Or via GitHub UI:
1. Go to **Actions** tab
2. Select **🔗 Cross-Repo Link Audit** workflow
3. Click **Run workflow**
4. Choose options and click **Run workflow**

#### Download Artifacts

```bash
# List runs and get run ID
gh run list --workflow="cross-repo-link-audit.yml"

# Download artifacts
gh run download <run-id> -n link-audit-logs-<run-number>

# Extract and view
cd link-audit-logs-<run-number>
cat broken-links.txt
cat missing-sections.txt
```

### Pull Request Review

When auto-fix creates a PR:

1. **Navigate to PR**: Check repository Pull Requests tab
2. **Review Changes**: Look at file diffs
3. **Check Labels**: Should have `documentation`, `automated`, `link-audit`
4. **Verify Links**: Ensure all link changes are correct
5. **Test Locally**: Optional - pull branch and test
6. **Approve/Request Changes**: Review as you would any PR
7. **Merge**: Click merge when satisfied

---

## Troubleshooting

### Common Issues

#### Issue: Scripts Don't Run

**Symptoms**: 
- "Permission denied" error
- "command not found" error

**Solutions**:

```bash
# Make scripts executable
chmod +x scripts/link-audit/*.sh

# Verify permissions
ls -la scripts/link-audit/

# Check Node.js installation
node --version
npm --version

# Install Node.js if missing (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Issue: Workflow Doesn't Trigger

**Symptoms**:
- Scheduled runs don't happen
- PR trigger doesn't work

**Solutions**:

```bash
# Check if workflow is enabled
gh workflow list

# Enable if disabled
gh workflow enable "cross-repo-link-audit.yml"

# Verify cron syntax
# Use https://crontab.guru/ to validate

# Check GitHub Actions permissions
# Settings → Actions → General → Workflow permissions
# Ensure "Read and write permissions" is enabled
```

#### Issue: Auto-Fix Doesn't Create PR

**Symptoms**:
- Fixes run but no PR appears

**Solutions**:

1. Check workflow logs for PR creation step
2. Verify `fix_issues` input is `true`
3. Ensure changes were actually made (`git status` in workflow)
4. Check repository settings allow PR creation from workflows

```bash
# View workflow run
gh run view <run-id> --log

# Look for "Create Pull Request" step
# Check for errors or "No changes to commit"
```

#### Issue: Node.js Module Errors

**Symptoms**:
- "Cannot find module" error
- "require is not defined" error

**Solutions**:

The scripts use ES modules. Ensure they start with:

```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

Not:

```javascript
const fs = require('fs');  // ❌ Won't work
const path = require('path');  // ❌ Won't work
```

#### Issue: Link Validation Timeout

**Symptoms**:
- Many "Status: 000" errors
- Script hangs or takes very long

**Solutions**:

```bash
# In check-links.sh, adjust timeout
# Line ~47
curl -L -s -o /dev/null -w "%{http_code}" --max-time 30 "$url"
#                                                      ^^^ Increase from 10 to 30
```

Or skip external link checking:

```bash
# In check-links.sh, comment out live checks
# Line ~193
# check_url "$url" "$relative_path" "$line_num"
```

---

## Maintenance

### Regular Tasks

#### Weekly (Automatic)
- Workflow runs and generates reports
- Review auto-generated PRs
- Merge approved changes

#### Monthly (Manual)
- Review artifact storage usage
- Clean up old workflow runs if needed
- Check for script updates in main branch

#### Quarterly (Manual)
- Review constellation map accuracy
- Update repository descriptions if changed
- Verify all links to external resources
- Update documentation

### Adding New Repositories

1. **Update Generator Script**:

```bash
# Edit scripts/link-audit/generate-constellation-map.js
# Add repository to appropriate category

vim scripts/link-audit/generate-constellation-map.js
```

2. **Regenerate Map**:

```bash
node scripts/link-audit/generate-constellation-map.js
```

3. **Update Main Documentation**:

```bash
# Add to README.md, IDENTITY.md, etc.
# Under "Related Repositories" section
```

4. **Commit Changes**:

```bash
git add CONSTELLATION_MAP.md README.md IDENTITY.md
git commit -m "docs: add new repository to constellation"
git push
```

### Updating Workflow Schedule

Edit `.github/workflows/cross-repo-link-audit.yml`:

```yaml
schedule:
  - cron: '0 0 * * 0'  # Current: Sunday midnight
  # Change to your desired schedule
  # Examples:
  # - cron: '0 0 * * *'     # Daily at midnight
  # - cron: '0 2 * * 1,4'   # Monday and Thursday at 2 AM
  # - cron: '0 0 1 * *'     # First day of each month
```

Commit and push to activate.

### Managing Artifacts

Artifacts are retained for 30 days by default. To change:

```yaml
# In workflow file
- name: Upload Audit Logs
  uses: actions/upload-artifact@v4
  with:
    name: link-audit-logs-${{ github.run_number }}
    path: .audit-logs/
    retention-days: 90  # Change from 30 to 90
```

To manually clean up old runs:

```bash
# List runs older than 30 days
gh run list --workflow="cross-repo-link-audit.yml" --created="<2026-01-01"

# Delete specific run
gh run delete <run-id>

# Delete all runs older than X days (be careful!)
gh run list --workflow="cross-repo-link-audit.yml" --json databaseId --created="<2026-01-01" | \
  jq -r '.[].databaseId' | \
  xargs -I {} gh run delete {}
```

---

## FAQ

### Q: How often should the workflow run?

**A**: Weekly (Sunday) is recommended for most projects. Increase frequency if you have many contributors or frequent documentation changes.

### Q: Can I disable auto-fix?

**A**: Yes. Set `fix_issues: false` in manual dispatch, or remove the auto-fix step from the workflow file.

### Q: What happens if links are broken due to deleted repositories?

**A**: The workflow creates an issue for manual review. You'll need to decide whether to update the link or remove the reference.

### Q: Can I use this for multiple repositories?

**A**: The workflow is designed for a single repository but checks all related repos. To run across multiple repos, deploy the workflow in each one and adjust the constellation map accordingly.

### Q: How do I exclude certain files from checking?

**A**: Edit the `find` command in `check-links.sh`:

```bash
MD_FILES=$(find "$REPO_ROOT" -type f -name "*.md" \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/vendor/*" \
  ! -path "*/.venv/*" \
  ! -path "*/out/*" \
  ! -path "*/your-excluded-dir/*")  # Add your exclusion
```

### Q: What if I don't want the constellation map?

**A**: Comment out or remove the "Generate Constellation Map" step from the workflow file. The map is optional.

### Q: How do I report a bug in the workflow?

**A**: Create a GitHub issue with:
- Label: `link-audit`
- Description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Workflow run ID if applicable

### Q: Can I customize the PR title and description?

**A**: Yes! Edit the "Create Pull Request" step in the workflow file:

```yaml
- name: Create Pull Request
  uses: peter-evans/create-pull-request@v6
  with:
    title: 'Your Custom Title'
    body: |
      Your custom PR description
      
      With multiple lines
```

### Q: What's the performance impact?

**A**: Minimal. The workflow runs once per week and takes 2-5 minutes. It doesn't affect site performance or deployment.

---

## Support

### Getting Help

- **Documentation**: Start with this guide and [scripts/link-audit/README.md](README.md)
- **Issues**: Create GitHub issue with `link-audit` label
- **Logs**: Check workflow run logs for detailed error messages
- **Community**: Ask in project discussions or team channels

### Useful Commands

```bash
# Quick validation
node scripts/link-audit/validate-related-repos.js

# Quick link check
bash scripts/link-audit/check-links.sh | tail -20

# Generate map
node scripts/link-audit/generate-constellation-map.js

# View recent workflows
gh run list --limit 10

# Trigger workflow
gh workflow run "cross-repo-link-audit.yml"

# View workflow status
gh run watch
```

---

## Next Steps

1. **Test Locally**: Run scripts to verify everything works
2. **Review Configuration**: Adjust schedule and paths if needed
3. **Update Constellation**: Add any missing repositories
4. **Enable Workflow**: Ensure workflow is enabled in GitHub
5. **Monitor First Run**: Watch the first scheduled or manual run
6. **Review and Merge**: Check first auto-PR carefully

---

**Last Updated**: January 29, 2026  
**Version**: 1.0.0  
**Maintained By**: Quantum Pi Forge Development Team

---

*"From the many repositories, one truth remains."* 🌌
