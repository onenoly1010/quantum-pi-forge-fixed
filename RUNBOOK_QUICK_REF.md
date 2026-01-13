# 🤖 AI Agent Runbook Quick Reference

## Workflow Location
`.github/workflows/ai-agent-handoff-runbook.yml`

## Manual Trigger Commands

### Check Status
```bash
# View latest workflow run
gh run list --workflow="ai-agent-handoff-runbook.yml" --limit 1

# View specific run
gh run view <run_id>
```

### Update Status
```bash
gh workflow run "ai-agent-handoff-runbook.yml" \
  -f action=update-status
```

### Rollback to Version
```bash
gh workflow run "ai-agent-handoff-runbook.yml" \
  -f action=rollback \
  -f rollback_version="v1.2.3"
```

### Update Component
```bash
gh workflow run "ai-agent-handoff-runbook.yml" \
  -f action=update-component \
  -f target_component=fastapi
```

### Emergency Stop
```bash
gh workflow run "ai-agent-handoff-runbook.yml" \
  -f action=emergency-stop
```

## Local Script Usage

### Health Check
```bash
./scripts/runbook/health-check.sh all
./scripts/runbook/health-check.sh fastapi
./scripts/runbook/health-check.sh flask
./scripts/runbook/health-check.sh gradio
```

### Component Update
```bash
./scripts/runbook/update-component.sh fastapi
```

### Rollback
```bash
./scripts/runbook/rollback.sh v1.2.3
```

### Emergency Stop
```bash
./scripts/runbook/emergency-stop.sh
```

## Environment Variables

```bash
# Service URLs (optional, defaults shown)
export FASTAPI_URL="http://localhost:8000"
export FLASK_URL="http://localhost:5000"
export GRADIO_URL="http://localhost:7860"

# Health check timeout in seconds
export HEALTH_CHECK_TIMEOUT=5
```

## Status Issue

Look for: **"🤖 AI Agent Autonomous Runbook Status"** in repository issues

Contains:
- ✅ Operational status
- 📊 Job status summary
- 🏥 System health
- 📝 AI agent instructions
- 🚨 Emergency procedures

## Monitoring Schedule

- **Automatic**: Every 6 hours
- **On Push**: Triggered on main branch
- **On Deployment**: After other workflows complete
- **Manual**: Via workflow_dispatch

## Documentation

- **Full Guide**: `docs/AI_AGENT_RUNBOOK.md`
- **Scripts Guide**: `scripts/runbook/README.md`

## Support

1. Check status issue for current state
2. Review workflow logs in Actions tab
3. Consult documentation files
4. Open issue with `runbook` label

---

**Quick Start**: The workflow runs automatically and maintains a status issue. No configuration needed to start!

**For Production**: Configure service URLs and implement update logic in scripts as needed.

**Status**: ✅ Ready to Use
