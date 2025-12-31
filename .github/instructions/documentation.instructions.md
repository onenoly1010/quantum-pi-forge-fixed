---
description: "Documentation and Markdown file guidelines"
applyTo: "**/*.md"
excludeAgent: "code-review"
---

# Documentation Instructions

## Markdown Style Guide

### Headers
- Use ATX-style headers (`#` prefix)
- Include a blank line before and after headers
- Use sentence case for headers
- Maximum header depth: 4 levels (`####`)

```markdown
# Main Title

## Section Header

### Subsection

#### Sub-subsection
```

### Code Blocks

Always specify the language for syntax highlighting:

````markdown
```typescript
const example = "code";
```

```bash
npm run build
```

```solidity
pragma solidity ^0.8.20;
```
````

### Links

Use descriptive link text:

```markdown
✅ See [GitHub Copilot Best Practices](https://docs.github.com/...)
❌ See [here](https://docs.github.com/...)
```

### Lists

- Use `-` for unordered lists
- Use `1.` for ordered lists (auto-numbering)
- Indent nested lists with 2 spaces

```markdown
- First item
- Second item
  - Nested item
  - Another nested item
- Third item
```

### Tables

Use alignment for better readability:

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
| Value 4  | Value 5  | Value 6  |
```

### Emphasis

- Use `**bold**` for **important information**
- Use `*italic*` for *emphasis*
- Use `code` for inline code, commands, or file names

### Emojis

Use emojis sparingly for visual markers:
- ✅ Success/correct way
- ❌ Error/incorrect way
- 🔧 Configuration
- 📝 Documentation
- 🐛 Bug fix
- ✨ New feature
- 🔐 Security

## Documentation Types

### README.md
- **Purpose**: Project overview and getting started guide
- **Sections**: Introduction, Installation, Usage, Contributing, License
- Keep concise - link to detailed docs

### Technical Documentation
- **Purpose**: In-depth technical specifications
- **Include**: Architecture, API references, data models
- Use diagrams where helpful

### Guides and Tutorials
- **Purpose**: Step-by-step instructions
- **Structure**: Prerequisites → Steps → Verification
- Include code examples and expected outputs

### CHANGELOG.md
- Follow [Keep a Changelog](https://keepachangelog.com/) format
- Group changes: Added, Changed, Deprecated, Removed, Fixed, Security
- Include version numbers and dates

```markdown
## [1.0.0] - 2025-12-31

### Added
- New feature description

### Fixed
- Bug fix description
```

## Project-Specific Guidelines

### IDENTITY.md
- Primary source of truth for project identity
- Reference this in other docs when needed
- Keep updated with project evolution

### Copilot Instructions
- Use YAML frontmatter for metadata
- Include practical code examples
- Organize with clear sections
- Maintain actionable Do's and Don'ts

### Deployment Documentation
- Include environment variables
- Document all deployment steps
- Add troubleshooting section
- Keep updated with infrastructure changes

## Writing Style

### Clarity
- Use active voice
- Write short, clear sentences
- Avoid jargon unless necessary (then define it)
- Use examples to illustrate complex concepts

### Consistency
- Maintain consistent terminology
- Use the same code style across examples
- Follow established patterns in existing docs

### Completeness
- Explain the "why" not just the "what"
- Include prerequisites
- Add links to related documentation
- Provide context for decisions

## Code Examples in Documentation

### Good Example
```markdown
## Connecting to MetaMask

First, ensure MetaMask is installed and unlocked. Then use the following code:

​```typescript
import { ethers } from 'ethers';

async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);
  
  return accounts[0];
}
​```

This function:
1. Checks if MetaMask is available
2. Requests account access
3. Returns the first account address

**Expected output**: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
```

### What Makes It Good
- ✅ Explains what the code does
- ✅ Shows complete, runnable example
- ✅ Includes error handling
- ✅ Provides expected output
- ✅ Uses proper syntax highlighting

## Updating Documentation

When making code changes:
1. **Check for related docs**: Search for files that reference changed code
2. **Update examples**: Ensure code examples still work
3. **Update version numbers**: If applicable
4. **Update timestamps**: In dated documentation
5. **Test instructions**: Verify documented steps still work

## DON'Ts

- ❌ Don't use abbreviations without defining them first
- ❌ Don't include sensitive information (keys, tokens, passwords)
- ❌ Don't leave broken links
- ❌ Don't forget to update version numbers
- ❌ Don't write overly long paragraphs (max 4-5 lines)
- ❌ Don't use relative file paths without context
- ❌ Don't assume reader's knowledge level

## Templates

### Issue Template
```markdown
## Problem
[Describe what needs to be done]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Context
[Relevant files, systems, or background]

## Testing
[How to verify the changes work]
```

### PR Description Template
```markdown
## Changes
[Summary of changes made]

## Related Issue
Fixes #[issue-number]

## Testing Done
- [ ] Build passes (`npm run build`)
- [ ] Manual testing completed
- [ ] Documentation updated

## Screenshots
[If applicable]
```

## Version Control for Docs

- Commit documentation changes with related code changes
- Use clear commit messages: `docs: update API endpoint documentation`
- Review documentation in PRs alongside code changes
