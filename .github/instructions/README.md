# Granular Copilot Instructions

This directory contains specialized instruction files that apply to specific file types or directories in the repository.

## How It Works

Each `*.instructions.md` file contains YAML frontmatter that specifies:
- **description**: Brief explanation of what the instructions cover
- **applyTo**: Glob pattern matching files this applies to
- **excludeAgent** (optional): Agents that should ignore these instructions

GitHub Copilot automatically reads and applies these instructions when working with matching files.

## Instruction Files

### typescript-react.instructions.md
- **Applies to**: `**/*.{ts,tsx}`
- **Purpose**: TypeScript and React component development guidelines
- **Key Topics**: Component structure, styling with Tailwind CSS, Web3 integration, type safety

### solidity-contracts.instructions.md
- **Applies to**: `contracts/**/*.sol`
- **Purpose**: Smart contract development and security guidelines
- **Key Topics**: Solidity versions, security best practices, gas optimization, testing

### api-routes.instructions.md
- **Applies to**: `app/api/**/*.{ts,js}`
- **Purpose**: Next.js API route patterns and security
- **Key Topics**: Input validation, error handling, blockchain interactions, environment variables

### documentation.instructions.md
- **Applies to**: `**/*.md`
- **Purpose**: Documentation style and formatting guidelines
- **Key Topics**: Markdown syntax, code examples, writing style, templates

## Adding New Instructions

To add instructions for a specific area:

1. Create a new file: `<topic>.instructions.md`
2. Add YAML frontmatter:
   ```yaml
   ---
   description: "Brief description"
   applyTo: "glob/pattern/**/*.ext"
   ---
   ```
3. Write clear, actionable guidelines with code examples
4. Test by having Copilot work on matching files

## Best Practices

- **Be specific**: Target narrow file patterns for focused guidance
- **Include examples**: Show code patterns, not just rules
- **Keep updated**: Review and update as conventions evolve
- **Avoid conflicts**: Ensure patterns don't overlap with contradictory rules
- **Test effectiveness**: Monitor Copilot's suggestions to verify instructions work

## Hierarchy

Instructions are applied in this order:
1. **Global** (`.github/copilot-instructions.md`) - Base guidelines for all files
2. **Granular** (`.github/instructions/*.instructions.md`) - Specific overrides

More specific instructions take precedence when there's overlap.

## Resources

- [GitHub Copilot Custom Instructions Guide](https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot)
- [Instruction File Format Documentation](https://docs.github.com/en/copilot/customizing-copilot/creating-a-custom-instructions-file)
