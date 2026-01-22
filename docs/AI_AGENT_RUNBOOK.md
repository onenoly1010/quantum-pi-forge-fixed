# AI Agent Autonomous Runbook

## Overview

The AI Agent Autonomous Runbook is an automated system that monitors, manages, and reports on the deployment status of the Quantum Pi Forge application. It provides continuous oversight and enables AI agents to interact with the system through well-defined interfaces.

## Features

### 1. Automated Monitoring
- **Schedule-based**: Runs every 6 hours to check system health
- **Event-driven**: Triggers on code pushes, deployments, and workflow completions
- **Service Health Checks**: Monitors FastAPI, Flask, and Gradio services

### 2. Status Issue Management
- **Auto-creation**: Creates a GitHub issue to track deployment status
- **Auto-update**: Updates the issue with latest status on every run
- **AI Agent Instructions**: Provides clear commands for AI agents to interact with the system

### 3. Operational Actions
- **Update Status**: Refresh deployment status and health checks
- **Rollback**: Revert to a previous version if issues arise
- **Update Component**: Update specific services (FastAPI, Flask, Gradio)
- **Emergency Stop**: Immediately halt all services in critical situations

## Workflow Structure

The workflow consists of several jobs that run in sequence:

```
Safety Gate → CI Pipeline → Deployment
                              ↓
                          Monitoring
                              ↓
                          Rollback (if needed)
                              ↓
                      Update Status Issue
```

### Job Descriptions

#### 🛡️ Safety Gate
- Performs initial safety checks before proceeding
- Validates that the environment is safe for deployment

#### 🔧 CI Pipeline
- Installs dependencies
- Builds the project
- Ensures code quality

#### 🚀 Deployment
- Triggers only on push to main or manual component updates
- Handles the actual deployment process
- Reports deployment status

#### 📊 Monitoring
- Checks health of all services
- Generates health check reports
- Uploads monitoring artifacts

#### 🔄 Rollback
- Executes only if triggered manually or on failure
- Reverts to a specified previous version
- Creates rollback branch for safety

## Usage

### For AI Agents

The status issue provides commands that AI agents can execute:

#### Check Deployment Status
```bash
gh run view <run_id>
```

#### Download Monitoring Reports
```bash
gh run download <run_id> -n monitoring-report
```

#### Trigger Rollback
```bash
gh workflow run "ai-agent-handoff-runbook.yml" \
  -f action=rollback \
  -f rollback_version="v1.2.3"
```

#### Update Specific Component
```bash
gh workflow run "ai-agent-handoff-runbook.yml" \
  -f action=update-component \
  -f target_component=fastapi
```

#### Emergency Stop
```bash
gh workflow run "ai-agent-handoff-runbook.yml" \
  -f action=emergency-stop
```

### For Humans

#### View Status
1. Navigate to the repository's Issues tab
2. Look for "🤖 AI Agent Autonomous Runbook Status"
3. Review the current operational status and health checks

#### Manual Workflow Trigger
1. Go to Actions → AI Agent Handoff & Autonomous Runbook
2. Click "Run workflow"
3. Select desired action from dropdown
4. Provide additional parameters if needed
5. Click "Run workflow"

## Status Issue Format

The status issue contains:

### Header
- **Operational Status**: ✅ OPERATIONAL, ⚠️ DEGRADED, or 🔴 CRITICAL
- **Last Updated**: Timestamp of last update
- **Run Link**: Link to the workflow run
- **Trigger**: What triggered the workflow
- **Branch**: Current branch

### Job Status Summary
Table showing the status of each job:
- Safety Gate
- CI Pipeline
- Deployment
- Monitoring
- Rollback

### System Health
Status of each monitored service:
- FastAPI Quantum Conduit (Port 8000)
- Flask Glyph Weaver (Port 5000)
- Gradio Truth Mirror (Port 7860)

### AI Agent Instructions
Copy-paste ready commands for common operations

### Configuration
Labels, update frequency, and emergency procedures

## Configuration

### Environment Variables

The workflow can be configured using these environment variables:

- `FASTAPI_URL`: FastAPI service URL (default: http://localhost:8000)
- `FLASK_URL`: Flask service URL (default: http://localhost:5000)
- `GRADIO_URL`: Gradio service URL (default: http://localhost:7860)
- `HEALTH_CHECK_TIMEOUT`: Health check timeout in seconds (default: 5)

### Secrets

Optional secrets for enhanced functionality:

- `SLACK_WEBHOOK_URL`: Slack webhook for notifications
- `DISCORD_WEBHOOK_URL`: Discord webhook for notifications

## Scripts

Helper scripts are located in `scripts/runbook/`:

- **health-check.sh**: Service health monitoring
- **update-component.sh**: Component update logic
- **rollback.sh**: Version rollback functionality
- **emergency-stop.sh**: Emergency service shutdown

See `scripts/runbook/README.md` for detailed script documentation.

## Troubleshooting

### Workflow Fails to Update Issue

**Symptoms**: Workflow runs but issue is not updated

**Solutions**:
1. Check that `issues: write` permission is granted in workflow
2. Verify the issue hasn't been closed or deleted
3. Check workflow logs for API errors

### Health Checks Always Fail

**Symptoms**: Services always show as unavailable

**Solutions**:
1. Verify services are actually running
2. Check service URLs in environment variables
3. Ensure health check endpoints exist
4. Increase `HEALTH_CHECK_TIMEOUT` if services are slow

### Rollback Doesn't Work

**Symptoms**: Rollback job fails or doesn't revert changes

**Solutions**:
1. Verify the target version exists in git history
2. Check that working directory is clean
3. Ensure proper git permissions
4. Review rollback script logs

## Best Practices

### For AI Agents
1. Always check the status issue before performing actions
2. Download monitoring reports when investigating issues
3. Use rollback conservatively - only when necessary
4. Document actions taken in issue comments

### For Humans
1. Review the status issue regularly
2. Keep the runbook workflow enabled
3. Respond to CRITICAL or DEGRADED statuses promptly
4. Test rollback procedures in staging first

## Future Enhancements

Potential improvements for the runbook:

- [ ] Integration with APM tools (Datadog, New Relic)
- [ ] Automated rollback on failure detection
- [ ] Multi-environment support (dev, staging, prod)
- [ ] Performance metrics tracking
- [ ] Custom alert thresholds
- [ ] Slack/Discord integration for real-time alerts
- [ ] Database health checks
- [ ] API response time monitoring

## Contributing

To improve the runbook:

1. Update the workflow file: `.github/workflows/ai-agent-handoff-runbook.yml`
2. Modify scripts in: `scripts/runbook/`
3. Test changes in a feature branch
4. Submit a PR with description of improvements

## Support

For issues or questions:

1. Check the status issue for current system state
2. Review workflow logs in Actions tab
3. Consult `scripts/runbook/README.md`
4. Open a new issue with `runbook` label

---

**Status**: ✅ Active
**Version**: 1.0.0
**Last Updated**: 2025-12-26
