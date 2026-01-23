# **AUTOMATED AGENT INSTRUCTIONS (CANONICAL VERSION)**

## **1. Purpose**
You are operating inside an AI development repository.  
Your role is to maintain correctness, consistency, and modularity across AI projects.

Your actions must remain within the boundaries defined in this document.

---

# **2. System Architecture Overview**

### **Components**
- **Models**: AI/ML models (TensorFlow, PyTorch, etc.)
- **Data Processing**: Scripts for data ingestion and preprocessing
- **APIs**: FastAPI/Flask backends for AI services
- **Frontends**: React/Next.js interfaces for AI interactions
- **Deployment**: Docker, cloud platforms

### **Service Topology**
```
Frontend <--> API <--> Models
                 │
                 └── Data Processing
```

---

# **3. AI Pipeline (Authoritative Specification)**

### **Flow**
1. Data ingestion and preprocessing
2. Model training/validation
3. API endpoint creation
4. Frontend integration
5. Deployment and monitoring

### **Constraints**
- Never expose API keys in code
- Never commit sensitive data
- Always validate model outputs
- Maintain reproducibility

---

# **4. Deployment Matrix (Strict)**

| Component | Platform | Required Variables |
|----------|----------|--------------------|
| Frontend | Vercel | `NEXT_PUBLIC_API_URL` |
| API | Server/Container | `API_KEY`, `MODEL_PATH`, `DB_URL` |
| Models | Server/Container | `DATA_PATH`, `MODEL_CONFIG` |

### **Rules**
- APIs must have proper authentication
- Models must be versioned
- Data must be securely stored

---

# **5. Development Session Rituals (Deterministic Workflow)**

### **Start**
```
Activate virtual environment: source venv/bin/activate
Start API: uvicorn main:app --reload
Start frontend: npm run dev
```

### **During**
```
Run tests before major changes
Use GitLens to inspect file lineage
Use Copilot Chat for AI-specific queries
```

### **End**
```
Run scripts/snapshot.sh
Commit changes with clear lineage
Push to trigger deployment
```

---

# **6. Workspace Structure (Required)**

```
project/
├── models/
├── data/
├── src/
├── scripts/
│   ├── audit.sh
│   ├── repair.sh
│   └── snapshot.sh
├── diagnostics/
└── artifacts/
```

### **Rules**
- Never place code outside `/src`
- Never place models outside `/models`
- All generated outputs must go to `/artifacts`
- All system snapshots must go to `/diagnostics`

---

# **7. VS Code Environment Configuration**

### **settings.json**
```json
{
  "workbench.colorTheme": "Quiet Light",
  "editor.fontLigatures": true,
  "editor.formatOnSave": true,
  "editor.inlineSuggest.enabled": true,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "git.enableSmartCommit": true,
  "explorer.compactFolders": false
}
```

### **keybindings.json**
```json
[
  { "key": "ctrl+e", "command": "workbench.action.quickOpen" },
  { "key": "ctrl+shift+f", "command": "workbench.action.findInFiles" },
  { "key": "ctrl+shift+g", "command": "workbench.view.scm" }
]
```

### **extensions.json**
```json
{
  "recommendations": [
    "github.copilot",
    "github.copilot-chat",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "eamodio.gitlens",
    "streetsidesoftware.code-spell-checker",
    "usernamehw.errorlens",
    "humao.rest-client"
  ]
}
```

---

# **8. Diagnostic & Repair Scripts**

### **audit.sh**
```bash
#!/bin/bash
python -m pytest
npm test
```

### **repair.sh**
```bash
#!/bin/bash
pip install -r requirements.txt
npm install
```

### **snapshot.sh**
```bash
#!/bin/bash
OUTPUT="diagnostics/system-snapshot-$(date +%Y%m%d-%H%M%S).md"
{
  echo "# Snapshot"
  echo "Timestamp: $(date)"
  git status
  git log -n 5
} > "$OUTPUT"
```

---

# **9. Automated Agent Behavioral Rules**

### **You must:**
- Maintain modularity and clarity
- Preserve existing AI architectures unless instructed
- Follow session rituals exactly
- Use diagnostics before and after major changes
- Keep all services aligned with the deployment matrix
- Validate all assumptions against the codebase
- Produce deterministic, reproducible changes

### **You must not:**
- Introduce new AI frameworks without justification
- Modify model logic without explicit instruction
- Change pipeline behavior
- Add dependencies without approval
- Move files outside the defined workspace structure
- Generate speculative content
- Break compatibility with deployment platforms

---

# **10. Output Format Requirements**

When performing tasks, automated agents must:

- Produce diffs when modifying files
- Provide reasoning only when requested
- Never hallucinate missing files
- Always reference actual codebase paths
- Maintain idempotency: repeated runs must produce identical results

---

## Instruction Priority
- For architectural understanding, workflows, and conceptual guidance: refer to `.github/copilot-instructions.md`.
- For deterministic behavior, constraints, and output rules: this file (`automated-agent-instructions.md`) is authoritative.