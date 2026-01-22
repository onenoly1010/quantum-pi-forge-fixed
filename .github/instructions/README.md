# GitHub Copilot Custom Agent Instructions

This directory is reserved for custom agent-specific instructions.

## Purpose

The `.github/instructions/` directory is used to store instruction files for custom GitHub Copilot agents. These instructions provide specialized guidance for specific types of tasks or domain areas.

## Usage

To add custom agent instructions:

1. Create a new `.md` file in this directory
2. Name it descriptively (e.g., `security-review.md`, `api-development.md`)
3. Write instructions specific to that agent's domain
4. Reference the instructions in your GitHub Copilot workflow

## Main Repository Instructions

For general repository-wide Copilot instructions, see:
- **Primary**: `.github/copilot-instructions.md` - Comprehensive guide for all Copilot interactions

## Example Structure

```
.github/instructions/
├── README.md                    # This file
├── security-review.md           # Instructions for security-focused agents
├── blockchain-development.md    # Instructions for smart contract work
└── documentation.md             # Instructions for documentation agents
```

## Notes

- Agent instruction files should be in Markdown format
- Instructions should be clear, specific, and actionable
- Keep instructions focused on the agent's specific domain
- Avoid duplicating information from the main copilot-instructions.md

## References

- [GitHub Copilot Best Practices](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
- [Copilot for Repositories](https://gh.io/copilot-coding-agent-tips)
