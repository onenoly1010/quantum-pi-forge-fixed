# 🤖 AI Agent Autonomous Runbook

## Overview

The AI Agent Autonomous Runbook is an automated system for managing deployment, monitoring, and rollback operations for the Quantum Pi Forge services. It provides automated health monitoring, deployment tracking, and emergency response capabilities.

## Monitored Services

The runbook monitors three core services:

1. **FastAPI Quantum Conduit** - Port 8000
2. **Flask Glyph Weaver** - Port 5000  
3. **Gradio Truth Mirror** - Port 7860

## Workflow Actions

### Available Actions

The workflow supports the following actions via `workflow_dispatch`:

#### 1. Deploy
Deploys the application to production environment.

```bash
gh workflow run "ai-agent-handoff-runbook.yml" -f action=deploy
```

#### 2. Rollback
Reverts to a previous deployment version.

```bash
# Rollback to a specific version
gh workflow run "ai-agent-handoff-runbook.yml" \
  -f action=rollback \
  -f rollback_version="deployment-20231222-120000"

# Automatic rollback (uses most recent deployment)
gh workflow run "ai-agent-handoff-runbook.yml" -f action=rollback
```

#### 3. Emergency Stop
Immediately halts operations and triggers rollback if critical issues are detected.

```bash
gh workflow run "ai-agent-handoff-runbook.yml" -f action=emergency-stop
```

#### 4. Update Component
Updates a specific component without full redeployment.

```bash
# Update specific component
gh workflow run "ai-agent-handoff-runbook.yml" \
  -f action=update-component \
  -f target_component=fastapi

# Valid components: fastapi, flask, gradio, all
```

#### 5. Health Check
Performs a health check on all monitored services.

```bash
gh workflow run "ai-agent-handoff-runbook.yml" -f action=healthcheck
```

## Automatic Triggers

### On Push to Main
When code is pushed to the `main` branch, the workflow automatically:
1. Runs the safety gate
2. Executes CI pipeline (build and test)
3. Deploys the application
4. Monitors system health
5. Updates the status issue

### Scheduled Monitoring
The workflow runs every 6 hours to:
- Check system health
- Update the status issue
- Generate monitoring reports

## Jobs

### 🛡️ Safety Gate
Validates that the requested action is safe to proceed and checks approval requirements.

**Outputs:**
- `approved`: Whether the action is approved
- `action`: The action to be performed

### 🔧 CI Pipeline
Builds and tests the application before deployment.

**Steps:**
1. Checkout repository
2. Setup Node.js environment
3. Install dependencies
4. Build application
5. Run tests

**Outputs:**
- `build_status`: success/failed

### 🚀 Deployment
Deploys the application or specific components.

**Steps:**
1. Deploy services based on target component
2. Tag deployment with timestamp
3. Generate deployment artifacts

**Outputs:**
- `deployment_status`: success/failed
- `deployment_time`: ISO timestamp

### 📊 Monitoring
Continuously monitors service health and generates reports.

**Health States:**
- `healthy`: Service is operating normally
- `degraded`: Service is experiencing issues but still operational
- `down`: Service is not responding

**Outputs:**
- `monitoring_status`: overall system health
- `fastapi_health`: FastAPI service status
- `flask_health`: Flask service status
- `gradio_health`: Gradio service status

### 🔄 Rollback
Automatically triggered when:
- Action is explicitly set to `rollback`
- Action is set to `emergency-stop`
- Monitoring detects critical status

**Steps:**
1. Identify rollback target version
2. Execute rollback procedure
3. Verify rollback success

**Outputs:**
- `rollback_status`: executed/failed

### 📝 Update Status Issue
Automatically updates the tracking issue with current system status.

**Updates:**
- Job execution results
- System health metrics
- Timestamps and run information
- AI agent instructions

### 📢 Notifications
Sends alerts for critical events via configured webhooks.

**Triggers:**
- Critical system status
- Rollback execution
- Emergency stops

**Supported Platforms:**
- Slack (via `SLACK_WEBHOOK_URL`)
- Discord (via `DISCORD_WEBHOOK_URL`)

## Status Issue

The runbook maintains a GitHub issue (Issue #1) that serves as a real-time dashboard.

### Status Issue Content

- **Header**: Current system state (OPERATIONAL/ROLLED BACK)
- **Last Updated**: ISO timestamp
- **Run Link**: Direct link to the workflow run
- **Job Status Summary**: Table of all job results
- **System Health**: Current status of all monitored services
- **AI Agent Instructions**: Commands for interacting with the system
- **Configuration**: Setup and emergency procedures

### Status Examples

#### Healthy System
```
# ✅ OPERATIONAL

**Last Updated**: 2025-12-22T13:00:00.000Z
**Run**: #12345
...
## System Health

- FastAPI Quantum Conduit (Port 8000): ✅ healthy
- Flask Glyph Weaver (Port 5000): ✅ healthy
- Gradio Truth Mirror (Port 7860): ✅ healthy
```

#### Degraded System
```
# ⚠️ DEGRADED

...
## System Health

- FastAPI Quantum Conduit (Port 8000): ⚠️ degraded
- Flask Glyph Weaver (Port 5000): ✅ healthy
- Gradio Truth Mirror (Port 7860): ⚠️ degraded
```

#### After Rollback
```
# 🔄 ROLLED BACK

...
| 🔄 Rollback | success | ✅ Executed |
```

## Monitoring Reports

The workflow generates JSON monitoring reports stored as artifacts.

### Report Structure

```json
{
  "timestamp": "2025-12-22T13:00:00.000Z",
  "run_id": "12345",
  "overall_status": "healthy",
  "services": {
    "fastapi": {
      "status": "healthy",
      "port": 8000
    },
    "flask": {
      "status": "healthy",
      "port": 5000
    },
    "gradio": {
      "status": "healthy",
      "port": 7860
    }
  }
}
```

### Downloading Reports

```bash
# Download from specific run
gh run download 12345 -n monitoring-report

# View latest monitoring report
gh run list --workflow=ai-agent-handoff-runbook.yml --limit=1
gh run download $(gh run list --workflow=ai-agent-handoff-runbook.yml --limit=1 --json databaseId -q '.[0].databaseId') -n monitoring-report
```

## Configuration

### Environment Variables

Set in the workflow file:
- `STATUS_ISSUE_NUMBER`: GitHub issue number for status tracking (default: 1)
- `FASTAPI_PORT`: FastAPI service port (default: 8000)
- `FLASK_PORT`: Flask service port (default: 5000)
- `GRADIO_PORT`: Gradio service port (default: 7860)

### Secrets (Optional)

Configure in repository settings:
- `SLACK_WEBHOOK_URL`: Slack webhook for notifications
- `DISCORD_WEBHOOK_URL`: Discord webhook for notifications

### Repository Variables

Optional variables for webhook URLs:
- `SLACK_WEBHOOK_URL`
- `DISCORD_WEBHOOK_URL`

## Emergency Procedures

### Critical System Failure

If all monitoring shows critical failure:

1. **Immediate Response**
   ```bash
   gh workflow run "ai-agent-handoff-runbook.yml" -f action=emergency-stop
   ```

2. **Check Workflow Logs**
   ```bash
   gh run list --workflow=ai-agent-handoff-runbook.yml --limit=1
   gh run view <run-id> --log
   ```

3. **Manual Rollback** (if automated fails)
   ```bash
   gh workflow run "ai-agent-handoff-runbook.yml" \
     -f action=rollback \
     -f rollback_version="<known-good-version>"
   ```

### Partial Degradation

If some services are degraded but not critical:

1. **Update Specific Component**
   ```bash
   # For FastAPI issues
   gh workflow run "ai-agent-handoff-runbook.yml" \
     -f action=update-component \
     -f target_component=fastapi
   ```

2. **Monitor Recovery**
   ```bash
   # Wait for next scheduled check or trigger manually
   gh workflow run "ai-agent-handoff-runbook.yml" -f action=healthcheck
   ```

### False Alarms

If monitoring reports issues but services are actually healthy:

1. Check the monitoring report artifacts
2. Verify services manually
3. If confirmed false alarm, continue normal operations
4. Consider adjusting health check thresholds

## Best Practices

### Regular Monitoring

- Review the status issue daily
- Set up webhook notifications for critical events
- Keep track of deployment tags for quick rollback

### Deployment Strategy

- Always deploy during low-traffic periods
- Monitor for at least 30 minutes post-deployment
- Keep the previous deployment tag handy for quick rollback

### Rollback Preparation

- Deployment tags are automatically created
- Latest tag format: `deployment-YYYYMMDD-HHMMSS`
- Keep a list of known-good versions

### Testing Changes

Before deploying to production:
1. Test in development environment
2. Review CI pipeline results
3. Ensure all tests pass
4. Have rollback plan ready

## Troubleshooting

### Workflow Won't Start

- Check workflow permissions in repository settings
- Verify GitHub Actions is enabled
- Check branch protection rules

### Status Issue Not Updating

- Verify issue number matches `STATUS_ISSUE_NUMBER`
- Check workflow has `issues: write` permission
- Ensure issue exists (workflow will create if missing)

### Deployment Fails

- Check CI pipeline logs
- Review build errors
- Verify Node.js version compatibility
- Check dependency conflicts

### Rollback Fails

- Verify deployment tags exist
- Check rollback version format
- Review rollback logs for specific errors

### Health Checks Always Fail

- Verify service ports are correct
- Check services are actually running
- Review health check logic in monitoring job

## Future Enhancements

Planned improvements:

- [ ] Actual HTTP health checks for services
- [ ] Integration with monitoring platforms (Datadog, New Relic)
- [ ] Automated performance testing
- [ ] Blue-green deployment support
- [ ] Canary deployment strategy
- [ ] SLA tracking and reporting
- [ ] Historical metrics dashboard

## Support

For issues or questions:

1. Check the status issue for current system state
2. Review workflow run logs
3. Check this documentation
4. Contact repository maintainer

---

*Last Updated: 2025-12-22*
*Version: 1.0.0*
