#!/usr/bin/env node

/**
 * generate-constellation-map.js
 * 
 * Purpose: Auto-generate a visual constellation map of all related repositories
 * 
 * Features:
 * - Creates hierarchical relationship map
 * - Tags repositories as ✅ Active or 📦 Archived
 * - Shows functional relationships
 * - Generates markdown output
 * 
 * Usage: node scripts/link-audit/generate-constellation-map.js
 * 
 * Output: Updates CONSTELLATION_MAP.md with current status
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const REPO_ROOT = path.resolve(__dirname, '../..');
const OUTPUT_FILE = path.join(REPO_ROOT, 'CONSTELLATION_MAP.md');

// Repository definitions with metadata
const CONSTELLATION = {
  core: {
    title: 'Core Repositories',
    icon: '🏛️',
    repos: [
      {
        name: 'quantum-pi-forge-fixed',
        url: 'https://github.com/onenoly1010/quantum-pi-forge-fixed',
        description: 'Main production codebase - Next.js dashboard, FastAPI backend, smart contracts',
        status: 'active',
        role: 'Primary Hub',
        technologies: ['Next.js', 'React', 'TypeScript', 'Solidity', 'Hardhat', 'FastAPI', 'Python'],
        features: [
          'Gasless staking for OINIO tokens',
          'MetaMask integration',
          'Polygon blockchain support',
          'Real-time balance tracking',
          'Legacy node onboarding'
        ]
      },
      {
        name: 'quantum-pi-forge-site',
        url: 'https://github.com/onenoly1010/quantum-pi-forge-site',
        description: 'Marketing and landing pages for the platform',
        status: 'active',
        role: 'Public Portal',
        technologies: ['HTML', 'CSS', 'JavaScript'],
        features: [
          'Marketing website',
          'Landing pages',
          'Public-facing documentation'
        ]
      },
      {
        name: 'pi-forge-quantum-genesis',
        url: 'https://github.com/onenoly1010/pi-forge-quantum-genesis',
        description: 'Legacy code archive and historical documentation',
        status: 'archived',
        role: 'Historical Archive',
        technologies: ['Legacy codebase'],
        features: [
          'Historical documentation',
          'Legacy code reference',
          'Project evolution history'
        ]
      }
    ]
  },
  ai_research: {
    title: 'AI & Research Components',
    icon: '🤖',
    repos: [
      {
        name: 'llm-coherence-auditor',
        url: 'https://huggingface.co/spaces/onenoly1010/llm-coherence-auditor',
        description: 'Framework for auditing LLM preference stability and coherence',
        status: 'active',
        role: 'Research Tool',
        platform: 'HuggingFace Spaces',
        technologies: ['Python', 'Gradio', 'ML'],
        features: [
          'LLM preference testing',
          'Coherence analysis',
          'Stability metrics'
        ]
      },
      {
        name: 'qmix-theorem-viz',
        url: 'https://huggingface.co/spaces/onenoly1010/qmix-theorem-viz',
        description: 'Interactive multi-agent RL theorem demonstration',
        status: 'active',
        role: 'Visualization',
        platform: 'HuggingFace Spaces',
        technologies: ['Python', 'Gradio', 'RL'],
        features: [
          'QMIX algorithm visualization',
          'Multi-agent RL demonstration',
          'Interactive theorem exploration'
        ]
      },
      {
        name: 'quantum-forge-eval',
        url: 'https://huggingface.co/datasets/onenoly1010/quantum-forge-eval',
        description: 'Annotated test cases for AI agent evaluation',
        status: 'active',
        role: 'Dataset',
        platform: 'HuggingFace Datasets',
        technologies: ['Datasets', 'Evaluation'],
        features: [
          'AI agent test cases',
          'Evaluation benchmarks',
          'Annotated examples'
        ]
      }
    ]
  },
  supporting: {
    title: 'Supporting Repositories',
    icon: '🔧',
    repos: [
      {
        name: 'Ai-forge-',
        description: 'Related ethical AI project',
        status: 'documented',
        role: 'Related Project'
      },
      {
        name: 'countdown',
        description: 'Launch countdown page',
        status: 'documented',
        role: 'Marketing Tool'
      }
    ]
  }
};

/**
 * Generate status badge
 */
function getStatusBadge(status) {
  const badges = {
    'active': '✅ Active',
    'archived': '📦 Archived',
    'documented': '📝 Documented',
    'planned': '🚧 Planned'
  };
  return badges[status] || '❓ Unknown';
}

/**
 * Generate role badge
 */
function getRoleBadge(role) {
  const badges = {
    'Primary Hub': '🏠',
    'Public Portal': '🌐',
    'Historical Archive': '📚',
    'Research Tool': '🔬',
    'Visualization': '📊',
    'Dataset': '💾',
    'Related Project': '🔗',
    'Marketing Tool': '📣'
  };
  return badges[role] ? `${badges[role]} ${role}` : role;
}

/**
 * Generate constellation map content
 */
function generateConstellationMap() {
  let content = '# 🌌 Quantum Pi Forge Constellation Map\n\n';
  content += '> **Auto-generated Documentation**  \n';
  content += `> Last Updated: ${new Date().toUTCString()}  \n`;
  content += '> Maintained by: Cross-Repository Link Audit Workflow\n\n';
  content += '---\n\n';
  
  content += '## 📋 Overview\n\n';
  content += 'This constellation map provides a comprehensive view of all repositories, ';
  content += 'components, and resources in the quantum-pi-forge ecosystem. It shows the ';
  content += 'hierarchical and functional relationships among all parts of the project.\n\n';
  
  // Generate legend
  content += '## 🏷️ Legend\n\n';
  content += '### Status Indicators\n';
  content += '- ✅ **Active**: Currently maintained and actively developed\n';
  content += '- 📦 **Archived**: Historical reference, not actively maintained\n';
  content += '- 📝 **Documented**: Mentioned in ecosystem, may be external\n';
  content += '- 🚧 **Planned**: Future development, not yet implemented\n\n';
  
  content += '### Role Indicators\n';
  content += '- 🏠 **Primary Hub**: Main repository and coordination point\n';
  content += '- 🌐 **Public Portal**: Public-facing websites and landing pages\n';
  content += '- 📚 **Historical Archive**: Legacy code and documentation\n';
  content += '- 🔬 **Research Tool**: AI research and experimentation\n';
  content += '- 📊 **Visualization**: Interactive demonstrations\n';
  content += '- 💾 **Dataset**: Data collections and benchmarks\n';
  content += '- 🔗 **Related Project**: Connected but separate projects\n';
  content += '- 📣 **Marketing Tool**: Promotional and marketing materials\n\n';
  
  content += '---\n\n';
  
  // Generate each category
  for (const category of Object.values(CONSTELLATION)) {
    content += `## ${category.icon} ${category.title}\n\n`;
    
    for (const repo of category.repos) {
      content += `### ${repo.name}\n\n`;
      
      // Status and role
      content += `**Status**: ${getStatusBadge(repo.status)}  \n`;
      if (repo.role) {
        content += `**Role**: ${getRoleBadge(repo.role)}  \n`;
      }
      if (repo.platform) {
        content += `**Platform**: ${repo.platform}  \n`;
      }
      if (repo.url) {
        content += `**Link**: [${repo.url}](${repo.url})  \n`;
      }
      content += '\n';
      
      // Description
      content += `${repo.description}\n\n`;
      
      // Technologies
      if (repo.technologies) {
        content += '**Technologies**: ';
        content += repo.technologies.map(t => `\`${t}\``).join(', ');
        content += '\n\n';
      }
      
      // Features
      if (repo.features) {
        content += '**Key Features**:\n';
        for (const feature of repo.features) {
          content += `- ${feature}\n`;
        }
        content += '\n';
      }
      
      content += '---\n\n';
    }
  }
  
  // Add relationship diagram
  content += '## 🔄 Relationship Diagram\n\n';
  content += '```\n';
  content += '                    Quantum Pi Forge Ecosystem\n';
  content += '                              |\n';
  content += '        ┌─────────────────────┼─────────────────────┐\n';
  content += '        |                     |                     |\n';
  content += '   Core Repos          AI Research            Supporting\n';
  content += '        |                     |                     |\n';
  content += '  ┌─────┴─────┐        ┌─────┴─────┐         ┌─────┴─────┐\n';
  content += '  |           |        |           |         |           |\n';
  content += '🏠 Main    🌐 Site   🔬 LLM      📊 QMIX   🔗 Related  📣 Countdown\n';
  content += '  Hub                Auditor      Viz      Projects\n';
  content += '  |                     |           |\n';
  content += '  ├─ Dashboard          └───────────┴─── 💾 Eval Dataset\n';
  content += '  ├─ Backend\n';
  content += '  ├─ Smart Contracts\n';
  content += '  └─ 📚 Legacy Archive\n';
  content += '```\n\n';
  
  // Add navigation section
  content += '## 🧭 Navigation\n\n';
  content += '### Primary Documentation\n';
  content += '- [Main README](README.md) - Project overview and quick start\n';
  content += '- [Identity Guide](IDENTITY.md) - Project identity and clarification\n';
  content += '- [Master URLs](MASTER_URLS.md) - Canonical URL directory\n';
  content += '- [Index](INDEX.md) - Documentation index\n\n';
  
  content += '### Development Resources\n';
  content += '- [Copilot Instructions](.github/copilot-instructions.md) - AI-assisted development guide\n';
  content += '- [AI Agent Runbook](.github/workflows/ai-agent-handoff-runbook.yml) - Autonomous operations\n';
  content += '- [Link Audit Workflow](.github/workflows/cross-repo-link-audit.yml) - Documentation maintenance\n\n';
  
  content += '### Deployment & Operations\n';
  content += '- [Deployment Status](DEPLOYMENT_STATUS_LIVE.md) - Current deployment status\n';
  content += '- [Runbook Quick Reference](RUNBOOK_QUICK_REF.md) - Operations guide\n';
  content += '- [Health Check Workflow](.github/workflows/constellation-deploy.yml) - Service monitoring\n\n';
  
  // Add maintenance section
  content += '---\n\n';
  content += '## 🔧 Maintenance\n\n';
  content += 'This constellation map is automatically updated by the Cross-Repository Link Audit workflow.\n\n';
  content += '### Manual Updates\n\n';
  content += 'To manually update this map:\n\n';
  content += '1. Edit `scripts/link-audit/generate-constellation-map.js`\n';
  content += '2. Update the `CONSTELLATION` object with new repositories or changes\n';
  content += '3. Run `node scripts/link-audit/generate-constellation-map.js`\n';
  content += '4. Review and commit the updated `CONSTELLATION_MAP.md`\n\n';
  
  content += '### Adding New Repositories\n\n';
  content += 'When adding new repositories to the ecosystem:\n\n';
  content += '1. Add entry to the appropriate category in the generator script\n';
  content += '2. Include status, role, description, and features\n';
  content += '3. Run the generator to update this map\n';
  content += '4. Update "Related Repositories" sections in main documentation files\n';
  content += '5. Ensure new repository README includes "Return to Hub" link\n\n';
  
  content += '---\n\n';
  content += '*"From the many repositories, one truth remains."* 🌌\n';
  
  return content;
}

// Main execution
console.log('🗺️ Generating constellation map...\n');

try {
  const mapContent = generateConstellationMap();
  fs.writeFileSync(OUTPUT_FILE, mapContent);
  
  console.log('✅ Constellation map generated successfully!');
  console.log(`📄 Output: ${OUTPUT_FILE}`);
  console.log('');
  
  // Output statistics
  let totalRepos = 0;
  let activeRepos = 0;
  let archivedRepos = 0;
  
  for (const category of Object.values(CONSTELLATION)) {
    for (const repo of category.repos) {
      totalRepos++;
      if (repo.status === 'active') activeRepos++;
      if (repo.status === 'archived') archivedRepos++;
    }
  }
  
  console.log('📊 Statistics:');
  console.log(`  - Total repositories: ${totalRepos}`);
  console.log(`  - Active: ${activeRepos}`);
  console.log(`  - Archived: ${archivedRepos}`);
  console.log('');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Error generating constellation map:', error.message);
  process.exit(1);
}
