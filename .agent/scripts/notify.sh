#!/bin/bash
set -e

# Quantum Pi Forge — Notification Service
# Sends deployment/rollback alerts to Slack and Microsoft Teams

SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"
TEAMS_WEBHOOK="${TEAMS_WEBHOOK_URL:-}"
NOTIFICATION_LEVEL="${NOTIFICATION_LEVEL:-info}"  # info, warning, critical

# Color codes for rich formatting
COLOR_SUCCESS="28a745"      # Green
COLOR_WARNING="ffc107"      # Amber
COLOR_CRITICAL="dc3545"     # Red
COLOR_INFO="0366d6"         # Blue

send_slack_notification() {
  local title="$1"
  local message="$2"
  local status="$3"          # success, warning, critical
  local color_var="COLOR_$status"
  local color="${!color_var:-$COLOR_INFO}"

  if [ -z "$SLACK_WEBHOOK" ]; then
    return 0
  fi

  local payload=$(cat <<EOF
{
  "attachments": [
    {
      "color": "#$color",
      "title": "$title",
      "text": "$message",
      "fields": [
        {
          "title": "Repository",
          "value": "$GITHUB_REPOSITORY",
          "short": true
        },
        {
          "title": "Branch",
          "value": "$GITHUB_REF_NAME",
          "short": true
        },
        {
          "title": "Commit",
          "value": "$GITHUB_SHA",
          "short": true
        },
        {
          "title": "Actor",
          "value": "$GITHUB_ACTOR",
          "short": true
        },
        {
          "title": "Timestamp",
          "value": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
          "short": true
        },
        {
          "title": "Workflow Run",
          "value": "<$GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID|View Details>",
          "short": true
        }
      ],
      "footer": "Quantum Pi Forge Agent",
      "ts": $(date +%s)
    }
  ]
}
EOF
)

  curl -X POST \
    -H 'Content-type: application/json' \
    --data "$payload" \
    "$SLACK_WEBHOOK" 2>/dev/null || {
    echo "[WARN] Slack notification failed"
  }
}

send_teams_notification() {
  local title="$1"
  local message="$2"
  local status="$3"          # success, warning, critical
  local color_var="COLOR_$status"
  local color="${!color_var:-$COLOR_INFO}"
  local theme_color="${color#\#}"

  if [ -z "$TEAMS_WEBHOOK" ]; then
    return 0
  fi

  local payload=$(cat <<EOF
{
  "@type": "MessageCard",
  "@context": "https://schema.org/extensions",
  "summary": "$title",
  "themeColor": "$theme_color",
  "sections": [
    {
      "activityTitle": "$title",
      "activitySubtitle": "Quantum Pi Forge Agent",
      "text": "$message",
      "facts": [
        {
          "name": "Repository:",
          "value": "$GITHUB_REPOSITORY"
        },
        {
          "name": "Branch:",
          "value": "$GITHUB_REF_NAME"
        },
        {
          "name": "Commit:",
          "value": "$GITHUB_SHA"
        },
        {
          "name": "Actor:",
          "value": "$GITHUB_ACTOR"
        },
        {
          "name": "Timestamp:",
          "value": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
        }
      ]
    }
  ],
  "potentialAction": [
    {
      "@type": "OpenUri",
      "name": "View Workflow",
      "targets": [
        {
          "os": "default",
          "uri": "$GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"
        }
      ]
    }
  ]
}
EOF
)

  curl -X POST \
    -H 'Content-type: application/json' \
    --data "$payload" \
    "$TEAMS_WEBHOOK" 2>/dev/null || {
    echo "[WARN] Teams notification failed"
  }
}

# Export functions for use in other scripts
export -f send_slack_notification
export -f send_teams_notification
