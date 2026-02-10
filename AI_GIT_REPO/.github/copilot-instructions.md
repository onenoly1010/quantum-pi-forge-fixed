# Copilot Instructions for AI_GIT_REPO

> **🤖 AI Project Reference**: This repository is dedicated to AI development, experimentation, and deployment.

## ⚠️ IMPORTANT: Project Identity Clarification

**This is the AI repository**: `onenoly1010/AI_GIT_REPO`

| Fact             | Value                                                          |
| ---------------- | -------------------------------------------------------------- |
| **Project Name** | AI_GIT_REPO                                                    |
| **What It Is**   | AI development and experimentation repository                  |
| **Main Branch**  | `main`                                                         |
| **Purpose**      | Prototyping, testing, and deploying AI models and applications |

---

## Working with GitHub Copilot

This repository is configured for GitHub Copilot Coding Agent. When working with Copilot:

### Suitable Tasks

Copilot excels at **low-to-medium complexity** tasks such as:

- 🐛 Bug fixes and error handling improvements
- 🔧 Refactoring existing code
- ✅ Adding or improving tests
- 📝 Documentation updates
- ♿ Accessibility improvements
- 🧹 Technical debt cleanup
- 🎨 UI component development for AI interfaces
- 🔐 Security vulnerability fixes

**Avoid assigning** tasks that require:

- Deep domain expertise in advanced AI/ML
- Large-scale architecture changes
- Complex business logic decisions
- Critical security-sensitive operations without review

### Iteration Process

1. **Clear Issues**: Write detailed issues with acceptance criteria
2. **Review PRs**: Treat Copilot PRs like human contributions - review carefully
3. **Provide Feedback**: Use PR comments and mention `@copilot` for iterations
4. **Incremental Changes**: Prefer small, focused changes over large refactors
5. **Test Thoroughly**: Always validate changes with builds and tests

### Security Expectations

- Copilot works in sandboxed environments with restricted permissions
- All changes require human review before merging
- API keys and sensitive data must never be committed
- Environment variables are validated before use
- Code changes are audited for security vulnerabilities

## Project Overview

AI_GIT_REPO is a repository for developing, testing, and deploying AI applications. It may include machine learning models, chatbots, automation scripts, and related tools.

## Tech Stack

### Languages

- **Primary**: Python, JavaScript/TypeScript
- **AI Frameworks**: TensorFlow, PyTorch, OpenAI API, LangChain, etc.
- **Web**: Next.js, React, FastAPI, Flask

### Key Dependencies

- AI/ML libraries (to be specified per project)
- Web frameworks for interfaces
- Deployment tools (Docker, Vercel, etc.)

## Project Structure

```
AI_GIT_REPO/
├── models/                    # AI models and training scripts
├── data/                      # Datasets and data processing
├── src/                       # Main application code
├── tests/                     # Test suites
├── docs/                      # Documentation
├── scripts/                   # Utility scripts
└── .github/                   # GitHub configurations
```

## Development Commands

```bash
# Development
npm run dev          # Start development server (if applicable)
python main.py       # Run main Python script

# Building
npm run build        # Build application
python setup.py      # Install Python package

# Testing
npm test             # Run tests
pytest               # Run Python tests
```

## Coding Standards

### Python

- Use type hints
- Follow PEP 8
- Use virtual environments
- Document functions with docstrings

### JavaScript/TypeScript

- Use TypeScript for new files
- Follow ESLint rules
- Use async/await for asynchronous code
- Prefer functional programming where appropriate

### AI-Specific

- Version control for models and datasets
- Document model architectures and training parameters
- Include evaluation metrics
- Ensure reproducibility

## Environment Variables

Required environment variables (set in `.env` or deployment platform):

```env
OPENAI_API_KEY=<api-key>
MODEL_PATH=<path-to-model>
DATASET_PATH=<path-to-data>
```

**Security Note**: Never commit API keys to the repository.

## Key Features to Maintain

### 1. Model Management

- Version control for AI models
- Reproducible training pipelines
- Model evaluation and validation

### 2. Data Handling

- Secure data storage and processing
- Privacy compliance
- Data quality checks

### 3. Security

- Input validation and sanitization
- Rate limiting for API endpoints
- Secure model serving

## Common Patterns

### Python AI Script

```python
import openai

def generate_response(prompt: str) -> str:
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
```

### React AI Component

```typescript
'use client';
import { useState } from 'react';

export default function AIChat() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();
    setResponse(data.response);
  };

  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={handleSubmit}>Send</button>
      <p>{response}</p>
    </div>
  );
}
```

## Testing Considerations

- Unit tests for individual functions
- Integration tests for AI pipelines
- Performance tests for model inference
- Manual testing for user interfaces

## Deployment

- **Platforms**: Vercel, Heroku, AWS, etc.
- **Containerization**: Docker for consistent environments
- **CI/CD**: GitHub Actions for automated testing and deployment

## Automated Agent Instructions

For deterministic, machine-oriented rules governing automated coding agents, see `.github/automated-agent-instructions.md`. That file contains strict behavioral constraints, output requirements, and system-level rules that agents must follow.

## Additional Resources

- [GitHub Copilot Best Practices](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Python Best Practices](https://peps.python.org/pep-0008/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
