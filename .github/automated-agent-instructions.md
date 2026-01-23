# **AUTOMATED AGENT INSTRUCTIONS (CANONICAL VERSION)**

## Instruction Priority
- For architectural understanding, workflows, and conceptual guidance: refer to `.github/copilot-instructions.md`.
- For deterministic behavior, constraints, and output rules: this file (`automated-agent-instructions.md`) is authoritative.

## **1. Purpose**
You are operating inside a multi‑service, gasless‑transaction blockchain project.  
Your role is to maintain correctness, consistency, and modularity across all components.

Your actions must remain within the boundaries defined in this document.

---

# **2. System Architecture Overview**

### **Components**
- **Frontend**: Next.js (TypeScript)
- **Backend**: FastAPI (Python)
- **Guardian Service**: Python monitoring agent
- **Oracle Service**: Python data ingestion agent
- **Smart Contracts**: Solidity (Hardhat)
- **Blockchain**: Polygon network
- **Gasless Relayer**: Sponsor wallet + backend relay logic

### **Service Topology**
```
Frontend <--> Backend <--> Contracts
                 │
                 ├── Guardian
                 └── Oracle
```

---

# **3. Gasless Transaction Pipeline (Authoritative Specification)**

### **Flow**
1. Frontend requests user signature (EIP‑712 typed data).  
2. User signs message locally (no gas).  
3. Frontend sends signature + payload to backend.  
4. Backend validates signature and checks:
   - Nonce  
   - Replay protection  
   - Schema integrity  
5. Backend constructs transaction using sponsor wallet.  
6. Sponsor wallet pays gas.  
7. Transaction is submitted to Polygon.  
8. Backend returns transaction hash + status.

### **Constraints**
- Never bypass signature validation.  
- Never modify relayer logic without explicit instruction.  
- Never introduce new trust assumptions.

---

# **4. Deployment Matrix (Strict)**

| Component | Platform | Required Variables |
|----------|----------|--------------------|
| Frontend | Vercel | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_RPC_URL`, `NEXT_PUBLIC_CONTRACT_ADDRESS` |
| Backend | Server/Container | `RPC_URL`, `SPONSOR_PRIVATE_KEY`, `DB_URL`, `ALLOWED_ORIGINS` |
| Guardian | Server/Container | `RPC_URL`, `CONTRACT_ADDRESS` |
| Oracle | Server/Container | `RPC_URL`, `ORACLE_KEY` |
| Contracts | Polygon | `PRIVATE_KEY`, `RPC_URL` | 

### **Rules**
- Frontend must always point to correct backend URL.  
- Backend must allow CORS for Vercel preview URLs.  
- All services must use consistent contract addresses.

---

# **5. Development Session Rituals (Deterministic Workflow)**

### **Start**
```
Start backend: uvicorn api.main:app --reload
Start guardian: python guardian/main.py
Start oracle: python oracle/main.py
Start frontend: npm run dev
Start local chain (optional): npx hardhat node
```

### **During**
```
Run scripts/audit.sh before major changes.
Use GitLens to inspect file lineage.
Use Copilot Chat for architecture-level queries.
```

### **End**
```
Run scripts/snapshot.sh
Commit changes with clear lineage.
Push to trigger Vercel preview.
```

---

# **6. Workspace Structure (Required)**

```
project/
├── docs/
├── src/
├── scripts/
│   ├── audit.sh
│   ├── repair.sh
│   └── snapshot.sh
├── diagnostics/
└── artifacts/
```

### **Rules**
- Never place code outside `/src`.  
- Never place long‑form explanations outside `/docs`.  
- All generated outputs must go to `/artifacts`.  
- All system snapshots must go to `/diagnostics`.

---

# **7. VS Code Environment Configuration**

### **settings.json**
```json
{
  "workbench.colorTheme": "Quiet Light",
  "workbench.iconTheme": "vs-minimal",
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
npm run lint
git status
```

### **repair.sh**
```bash
#!/bin/bash
npm run fix
npm run build
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
- Maintain modularity and clarity.  
- Preserve existing architecture unless explicitly instructed.  
- Follow session rituals exactly.  
- Use diagnostics before and after major changes.  
- Keep all services aligned with the deployment matrix.  
- Validate all assumptions against the codebase.  
- Produce deterministic, reproducible changes.

### **You must not:**
- Introduce new architectural patterns.  
- Modify contract logic without explicit instruction.  
- Change gasless pipeline behavior.  
- Add dependencies without justification.  
- Move files outside the defined workspace structure.  
- Generate speculative or aspirational content.  
- Break compatibility with Polygon deployment.

---

# **10. Output Format Requirements**

When performing tasks, automated agents must:

- Produce diffs when modifying files.  
- Provide reasoning only when requested.  
- Never hallucinate missing files.  
- Always reference actual codebase paths.  
- Maintain idempotency: repeated runs must produce identical results.

---