# 🔗 Cross-Repository Link Audit System

> **Automated Documentation Management for the Quantum Pi Forge Constellation**

This directory contains scripts and tools for maintaining documentation consistency, validating cross-repository links, and ensuring proper navigation across the quantum-pi-forge ecosystem.

---

## 📋 Overview

The Cross-Repository Link Audit System automates:

1. **Link Validation** - Checks all markdown links for broken or outdated references
2. **Section Validation** - Ensures all documentation has proper "Related Repositories" sections
3. **Constellation Mapping** - Auto-generates ecosystem overview with hierarchical relationships
4. **Automated Fixes** - Standardizes links and adds missing sections automatically

---

## 🗂️ Components

### Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `check-links.sh` | Validate all links in markdown files | `bash scripts/link-audit/check-links.sh` |
| `validate-related-repos.js` | Check for required documentation sections | `node scripts/link-audit/validate-related-repos.js` |
| `generate-constellation-map.js` | Create ecosystem overview | `node scripts/link-audit/generate-constellation-map.js` |
| `fix-links.sh` | Automatically fix common issues | `bash scripts/link-audit/fix-links.sh` |

### GitHub Workflow

- **Workflow**: `.github/workflows/cross-repo-link-audit.yml`
- **Triggers**: 
  - Weekly schedule (every Sunday at 00:00 UTC)
  - Pull requests modifying documentation
  - Manual dispatch with options

---

## 🚀 Quick Start

### Running Locally

```bash
# Check for broken links
bash scripts/link-audit/check-links.sh

# Validate documentation sections
node scripts/link-audit/validate-related-repos.js

# Generate constellation map
node scripts/link-audit/generate-constellation-map.js

# Run all checks and fixes
bash scripts/link-audit/fix-links.sh
```

### Prerequisites

```bash
# Install Node.js dependencies (if not already installed)
npm install -g markdown-link-check

# Ensure bash, jq, and curl are available
sudo apt-get update
sudo apt-get install -y jq curl
```

---

## 📊 Workflow Usage

### Automatic Runs

The workflow runs automatically:
- **Weekly**: Every Sunday at midnight UTC
- **On PRs**: When documentation files are modified

### Manual Trigger

Trigger manually with options:

```bash
# Report-only mode (no changes)
gh workflow run "🔗 Cross-Repo Link Audit" -f report_only=true

# Auto-fix mode (creates PR with fixes)
gh workflow run "🔗 Cross-Repo Link Audit" -f fix_issues=true
```

---

## 🔍 What Gets Checked

### Link Validation

- ✅ **External Links**: HTTP/HTTPS URLs (with timeout handling)
- ✅ **Internal Links**: File references within repository
- ✅ **Anchor Links**: Heading references in markdown files
- ✅ **Canonical URLs**: Ensures `https://github.com/onenoly1010/{repo}` format

### Section Validation

#### Main Documentation Files
Must have "Related Repositories" section:
- `README.md`
- `IDENTITY.md`
- `INDEX.md`
- `MASTER_URLS.md`

#### Subdirectory READMEs
Should have "Return to Hub" link:
- `backend/README.md`
- `fastapi/README.md`
- `contracts/0g-uniswap-v2/README.md`
- `pi-network/README.md`
- `scripts/runbook/README.md`
- `evaluation/README.md`
- `spaces/*/README.md`
- `docs/README_UPDATE.md`

### Repository References

Validates presence of all core repositories:
- `quantum-pi-forge-fixed`
- `quantum-pi-forge-site`
- `pi-forge-quantum-genesis`

---

## 🔧 Automated Fixes

The system can automatically fix:

### Link Standardization
```markdown
# Before
github.com/onenoly1010/quantum-pi-forge-fixed

# After
https://github.com/onenoly1010/quantum-pi-forge-fixed
```

### Missing Sections

Adds "Related Repositories" section to main docs:
```markdown
## 🌐 Related Repositories

This repository is part of the Quantum Pi Forge constellation...

| Repository | Description | Status |
|------------|-------------|--------|
| [quantum-pi-forge-fixed](https://github.com/onenoly1010/quantum-pi-forge-fixed) | Main production codebase | ✅ Active |
...
```

Adds "Return to Hub" link to subdirectory READMEs:
```markdown
> 🏠 **[Return to Main Repository](../../README.md)** | [View on GitHub](https://github.com/onenoly1010/quantum-pi-forge-fixed)
```

---

## 📤 Output & Artifacts

### Workflow Artifacts

Each workflow run produces:

```
.audit-logs/
├── markdown-files.txt          # List of scanned files
├── broken-links.txt            # Broken link report
├── non-canonical-urls.txt      # Non-standard URL report
├── missing-sections.txt        # Missing section report
└── fixed-issues.txt            # Changes made report
```

**Retention**: 30 days

### Download Artifacts

```bash
# List recent runs
gh run list --workflow="cross-repo-link-audit.yml"

# Download artifacts from specific run
gh run download <run-id> -n link-audit-logs-<run-number>
```

---

## 🔄 Pull Request Workflow

When auto-fix is enabled (weekly runs or manual dispatch with `fix_issues=true`):

1. **Scan** - Workflow scans all documentation
2. **Fix** - Applies automated fixes to files
3. **PR Created** - Creates pull request with changes
4. **Review** - Maintainer reviews and merges

### PR Labels
- `documentation`
- `automated`
- `link-audit`

### Review Checklist
- [ ] All link changes point to valid resources
- [ ] Repository descriptions are accurate
- [ ] Status indicators (✅/📦) are correct
- [ ] No sensitive information exposed

---

## 🚨 Error Handling

### Critical Failures

If workflow fails critically (schedule or manual dispatch):

1. **Issue Created**: Automatically creates GitHub issue
2. **Labels**: `link-audit`, `automated`, `critical`, `documentation`
3. **Contents**: Workflow details, error logs, action required

### Manual Intervention

Some issues require manual fixes:
- Repositories that were deleted or renamed
- Complex internal reference issues
- Network timeouts during validation
- Ambiguous link destinations

---

## 🗺️ Constellation Map

### Auto-Generated Documentation

`CONSTELLATION_MAP.md` provides:

- **Hierarchical Overview**: Shows relationships between repos
- **Status Indicators**: ✅ Active or 📦 Archived
- **Role Badges**: Identifies purpose of each component
- **Technology Stack**: Lists technologies used
- **Key Features**: Highlights main capabilities

### Updating the Map

```bash
# Generate/update constellation map
node scripts/link-audit/generate-constellation-map.js

# Review changes
git diff CONSTELLATION_MAP.md

# Commit if correct
git add CONSTELLATION_MAP.md
git commit -m "docs: update constellation map"
```

### Adding New Repositories

Edit `scripts/link-audit/generate-constellation-map.js`:

```javascript
{
  name: 'new-repo-name',
  url: 'https://github.com/onenoly1010/new-repo-name',
  description: 'Brief description',
  status: 'active',  // or 'archived', 'documented', 'planned'
  role: 'Role Name',
  technologies: ['Tech1', 'Tech2'],
  features: [
    'Feature 1',
    'Feature 2'
  ]
}
```

---

## 📝 Best Practices

### For Documentation Writers

1. **Use Canonical URLs**: Always use full `https://github.com/onenoly1010/{repo}` format
2. **Include Sections**: Add "Related Repositories" to main docs
3. **Add Navigation**: Include "Return to Hub" in subdirectory READMEs
4. **Test Links**: Verify links before committing
5. **Check Anchors**: Ensure heading references match actual headings

### For Maintainers

1. **Review Auto-PRs**: Carefully review automated pull requests
2. **Update Generator**: Keep constellation map generator current
3. **Monitor Issues**: Address critical failure issues promptly
4. **Test Changes**: Run scripts locally before merging
5. **Update Docs**: Keep this README current with changes

---

## 🔍 Troubleshooting

### Script Errors

```bash
# Check script permissions
ls -la scripts/link-audit/

# Make executable if needed
chmod +x scripts/link-audit/*.sh

# Check Node.js version
node --version  # Should be v14+

# Test individual script
bash -x scripts/link-audit/check-links.sh
```

### Workflow Failures

```bash
# View workflow runs
gh run list --workflow="cross-repo-link-audit.yml"

# View specific run details
gh run view <run-id>

# Download logs
gh run view <run-id> --log
```

### Common Issues

#### Issue: "Permission denied" when running scripts
**Solution**: Run `chmod +x scripts/link-audit/*.sh`

#### Issue: "command not found: node"
**Solution**: Install Node.js v14 or later

#### Issue: "curl: command not found"
**Solution**: Install curl with `sudo apt-get install curl`

#### Issue: Workflow doesn't trigger on schedule
**Solution**: Check workflow is enabled in repository settings

#### Issue: Auto-fix doesn't create PR
**Solution**: Ensure `fix_issues` input is set to `true`

---

## 📚 Related Documentation

- [Main README](../../README.md) - Project overview
- [Copilot Instructions](../../.github/copilot-instructions.md) - AI development guide
- [AI Agent Runbook](../../.github/workflows/ai-agent-handoff-runbook.yml) - Operations automation
- [Constellation Map](../../CONSTELLATION_MAP.md) - Ecosystem overview

---

## 🤝 Contributing

Improvements to the link audit system are welcome!

### Adding New Checks

1. Edit appropriate script (`check-links.sh`, `validate-related-repos.js`)
2. Add validation logic
3. Update output format
4. Test thoroughly
5. Update this README

### Reporting Issues

Use GitHub issues with:
- Label: `link-audit`
- Description of problem
- Steps to reproduce
- Expected vs actual behavior

---

## 📄 License

Part of the Quantum Pi Forge ecosystem - see main repository for license details.

---

## ✨ Maintenance Schedule

- **Weekly**: Automated audit runs every Sunday
- **Quarterly**: Manual review of all scripts and templates
- **As Needed**: Updates when new repositories added to ecosystem

---

**Last Updated**: Auto-generated by Cross-Repository Link Audit Workflow  
**Maintained By**: Quantum Pi Forge Development Team  
**Version**: 1.0.0

---

*"From the many repositories, one truth remains."* 🌌
