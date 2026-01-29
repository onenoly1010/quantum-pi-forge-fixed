# 🌌 Quantum Pi Forge Constellation Map

> **Auto-generated Documentation**  
> Last Updated: Thu, 29 Jan 2026 22:10:20 GMT  
> Maintained by: Cross-Repository Link Audit Workflow

---

## 📋 Overview

This constellation map provides a comprehensive view of all repositories, components, and resources in the quantum-pi-forge ecosystem. It shows the hierarchical and functional relationships among all parts of the project.

## 🏷️ Legend

### Status Indicators
- ✅ **Active**: Currently maintained and actively developed
- 📦 **Archived**: Historical reference, not actively maintained
- 📝 **Documented**: Mentioned in ecosystem, may be external
- 🚧 **Planned**: Future development, not yet implemented

### Role Indicators
- 🏠 **Primary Hub**: Main repository and coordination point
- 🌐 **Public Portal**: Public-facing websites and landing pages
- 📚 **Historical Archive**: Legacy code and documentation
- 🔬 **Research Tool**: AI research and experimentation
- 📊 **Visualization**: Interactive demonstrations
- 💾 **Dataset**: Data collections and benchmarks
- 🔗 **Related Project**: Connected but separate projects
- 📣 **Marketing Tool**: Promotional and marketing materials

---

## 🏛️ Core Repositories

### quantum-pi-forge-fixed

**Status**: ✅ Active  
**Role**: 🏠 Primary Hub  
**Link**: [https://github.com/onenoly1010/quantum-pi-forge-fixed](https://github.com/onenoly1010/quantum-pi-forge-fixed)  

Main production codebase - Next.js dashboard, FastAPI backend, smart contracts

**Technologies**: `Next.js`, `React`, `TypeScript`, `Solidity`, `Hardhat`, `FastAPI`, `Python`

**Key Features**:
- Gasless staking for OINIO tokens
- MetaMask integration
- Polygon blockchain support
- Real-time balance tracking
- Legacy node onboarding

---

### quantum-pi-forge-site

**Status**: ✅ Active  
**Role**: 🌐 Public Portal  
**Link**: [https://github.com/onenoly1010/quantum-pi-forge-site](https://github.com/onenoly1010/quantum-pi-forge-site)  

Marketing and landing pages for the platform

**Technologies**: `HTML`, `CSS`, `JavaScript`

**Key Features**:
- Marketing website
- Landing pages
- Public-facing documentation

---

### pi-forge-quantum-genesis

**Status**: 📦 Archived  
**Role**: 📚 Historical Archive  
**Link**: [https://github.com/onenoly1010/pi-forge-quantum-genesis](https://github.com/onenoly1010/pi-forge-quantum-genesis)  

Legacy code archive and historical documentation

**Technologies**: `Legacy codebase`

**Key Features**:
- Historical documentation
- Legacy code reference
- Project evolution history

---

## 🤖 AI & Research Components

### llm-coherence-auditor

**Status**: ✅ Active  
**Role**: 🔬 Research Tool  
**Platform**: HuggingFace Spaces  
**Link**: [https://huggingface.co/spaces/onenoly1010/llm-coherence-auditor](https://huggingface.co/spaces/onenoly1010/llm-coherence-auditor)  

Framework for auditing LLM preference stability and coherence

**Technologies**: `Python`, `Gradio`, `ML`

**Key Features**:
- LLM preference testing
- Coherence analysis
- Stability metrics

---

### qmix-theorem-viz

**Status**: ✅ Active  
**Role**: 📊 Visualization  
**Platform**: HuggingFace Spaces  
**Link**: [https://huggingface.co/spaces/onenoly1010/qmix-theorem-viz](https://huggingface.co/spaces/onenoly1010/qmix-theorem-viz)  

Interactive multi-agent RL theorem demonstration

**Technologies**: `Python`, `Gradio`, `RL`

**Key Features**:
- QMIX algorithm visualization
- Multi-agent RL demonstration
- Interactive theorem exploration

---

### quantum-forge-eval

**Status**: ✅ Active  
**Role**: 💾 Dataset  
**Platform**: HuggingFace Datasets  
**Link**: [https://huggingface.co/datasets/onenoly1010/quantum-forge-eval](https://huggingface.co/datasets/onenoly1010/quantum-forge-eval)  

Annotated test cases for AI agent evaluation

**Technologies**: `Datasets`, `Evaluation`

**Key Features**:
- AI agent test cases
- Evaluation benchmarks
- Annotated examples

---

## 🔧 Supporting Repositories

### Ai-forge-

**Status**: 📝 Documented  
**Role**: 🔗 Related Project  

Related ethical AI project

---

### countdown

**Status**: 📝 Documented  
**Role**: 📣 Marketing Tool  

Launch countdown page

---

## 🔄 Relationship Diagram

```
                    Quantum Pi Forge Ecosystem
                              |
        ┌─────────────────────┼─────────────────────┐
        |                     |                     |
   Core Repos          AI Research            Supporting
        |                     |                     |
  ┌─────┴─────┐        ┌─────┴─────┐         ┌─────┴─────┐
  |           |        |           |         |           |
🏠 Main    🌐 Site   🔬 LLM      📊 QMIX   🔗 Related  📣 Countdown
  Hub                Auditor      Viz      Projects
  |                     |           |
  ├─ Dashboard          └───────────┴─── 💾 Eval Dataset
  ├─ Backend
  ├─ Smart Contracts
  └─ 📚 Legacy Archive
```

## 🧭 Navigation

### Primary Documentation
- [Main README](README.md) - Project overview and quick start
- [Identity Guide](IDENTITY.md) - Project identity and clarification
- [Master URLs](MASTER_URLS.md) - Canonical URL directory
- [Index](INDEX.md) - Documentation index

### Development Resources
- [Copilot Instructions](.github/copilot-instructions.md) - AI-assisted development guide
- [AI Agent Runbook](.github/workflows/ai-agent-handoff-runbook.yml) - Autonomous operations
- [Link Audit Workflow](.github/workflows/cross-repo-link-audit.yml) - Documentation maintenance

### Deployment & Operations
- [Deployment Status](DEPLOYMENT_STATUS_LIVE.md) - Current deployment status
- [Runbook Quick Reference](RUNBOOK_QUICK_REF.md) - Operations guide
- [Health Check Workflow](.github/workflows/constellation-deploy.yml) - Service monitoring

---

## 🔧 Maintenance

This constellation map is automatically updated by the Cross-Repository Link Audit workflow.

### Manual Updates

To manually update this map:

1. Edit `scripts/link-audit/generate-constellation-map.js`
2. Update the `CONSTELLATION` object with new repositories or changes
3. Run `node scripts/link-audit/generate-constellation-map.js`
4. Review and commit the updated `CONSTELLATION_MAP.md`

### Adding New Repositories

When adding new repositories to the ecosystem:

1. Add entry to the appropriate category in the generator script
2. Include status, role, description, and features
3. Run the generator to update this map
4. Update "Related Repositories" sections in main documentation files
5. Ensure new repository README includes "Return to Hub" link

---

*"From the many repositories, one truth remains."* 🌌
