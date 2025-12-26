# AI Agent Autonomous Runbook Scripts

This directory contains scripts used by the AI Agent Autonomous Runbook workflow.

## Scripts

### health-check.sh

Health check script for monitoring service availability.

**Usage:**
```bash
# Check all services
./health-check.sh all

# Check specific service
./health-check.sh fastapi
./health-check.sh flask
./health-check.sh gradio
```

**Environment Variables:**
- `FASTAPI_URL` - FastAPI service URL (default: http://localhost:8000)
- `FLASK_URL` - Flask service URL (default: http://localhost:5000)
- `GRADIO_URL` - Gradio service URL (default: http://localhost:7860)
- `HEALTH_CHECK_TIMEOUT` - Timeout in seconds (default: 5)

### update-component.sh

Script for updating specific components.

**Usage:**
```bash
# Update all components
./update-component.sh all

# Update specific component
./update-component.sh fastapi
./update-component.sh flask
./update-component.sh gradio
```

### rollback.sh

Rollback script to revert to a previous version.

**Usage:**
```bash
# Rollback to a specific version
./rollback.sh v1.2.3

# Rollback to a specific commit
./rollback.sh abc1234
```

**Notes:**
- Creates a new rollback branch
- Requires a clean working directory
- Does not automatically push changes

### emergency-stop.sh

Emergency stop script to immediately halt all services.

**Usage:**
```bash
./emergency-stop.sh
```

**What it does:**
- Stops services on ports 8000, 5000, and 7860
- Terminates Node.js, FastAPI, Flask, and Gradio processes
- Provides status report of stopped services

## Integration with GitHub Actions

These scripts are used by the `.github/workflows/ai-agent-handoff-runbook.yml` workflow:

- **health-check.sh** - Used in the Monitoring job
- **update-component.sh** - Used when `action=update-component` is triggered
- **rollback.sh** - Used when `action=rollback` is triggered
- **emergency-stop.sh** - Used when `action=emergency-stop` is triggered

## Manual Usage

You can run these scripts manually for troubleshooting or maintenance:

```bash
# Check service health
cd /path/to/quantum-pi-forge-fixed
./scripts/runbook/health-check.sh all

# Perform emergency stop
./scripts/runbook/emergency-stop.sh

# Rollback to previous version
./scripts/runbook/rollback.sh v1.0.0
```

## Customization

To customize these scripts for your specific deployment:

1. Update service URLs in health-check.sh
2. Implement actual update logic in update-component.sh
3. Adjust process detection patterns in emergency-stop.sh
4. Modify rollback strategy in rollback.sh

## Security Considerations

- Scripts should only be run by authorized personnel or automated workflows
- Emergency stop should be used only in critical situations
- Rollback operations should be tested in a staging environment first
- Always review logs before and after script execution
