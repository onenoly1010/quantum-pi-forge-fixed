#!/bin/bash

# ===================================
# OINIO GRANT MONITORING SCRIPT
# ===================================
# Monitors 0G Guild for grant approval status
# Executes flash launch when approved

set -e

# Load environment
if [ ! -f ".env.launch" ]; then
    echo "❌ .env.launch not found. Run: cp .env.launch.template .env.launch"
    exit 1
fi

source .env.launch

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="${LOG_FILE:-.logs/monitor-grant.log}"
mkdir -p "$(dirname "$LOG_FILE")"

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $*${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $*${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $*${NC}" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check required env vars
    if [ -z "$GUILD_API_KEY" ]; then
        log_error "GUILD_API_KEY not set"
        exit 1
    fi
    
    if [ -z "$0G_GRANT_ID" ]; then
        log_error "0G_GRANT_ID not set"
        exit 1
    fi
    
    # Check for curl
    if ! command -v curl &> /dev/null; then
        log_error "curl not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Check grant status from 0G Guild API
check_grant_status() {
    log_info "Checking grant status for ID: $0G_GRANT_ID"
    
    local response
    response=$(curl -s -X GET "https://api.guild.0g.ai/grants/$0G_GRANT_ID" \
        -H "Authorization: Bearer $GUILD_API_KEY" \
        -H "Content-Type: application/json")
    
    # Extract status from response
    local status
    status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$status" ]; then
        log_error "Failed to get grant status"
        log_info "Response: $response"
        return 1
    fi
    
    log_info "Current grant status: $status"
    echo "$status"
}

# Execute flash launch when grant approved
execute_flash_launch() {
    log_warning "🚨 GRANT APPROVED! Executing flash launch sequence..."
    
    # Check for launch script
    if [ ! -f "scripts/deploy.sh" ]; then
        log_error "Deploy script not found at scripts/deploy.sh"
        return 1
    fi
    
    # Execute deployment
    log_info "Starting deployment..."
    if bash scripts/deploy.sh; then
        log_success "🚀 FLASH LAUNCH COMPLETED SUCCESSFULLY"
        
        # Send notification
        send_discord_notification "success" "🚀 OINIO Flash Launch Executed Successfully!"
        
        return 0
    else
        log_error "Deployment failed"
        send_discord_notification "error" "❌ OINIO Flash Launch Failed"
        return 1
    fi
}

# Send Discord notification
send_discord_notification() {
    local type=$1
    local message=$2
    
    if [ -z "$DISCORD_WEBHOOK_URL" ] || [ "$DISCORD_ALERTS_ENABLED" != "true" ]; then
        return 0
    fi
    
    local color
    case "$type" in
        success) color="3066993" ;;  # Green
        error) color="15158332" ;;    # Red
        warning) color="16776960" ;;  # Yellow
        *) color="9807270" ;;         # Blue
    esac
    
    local payload=$(cat <<EOF
{
    "embeds": [{
        "title": "OINIO Grant Monitoring",
        "description": "$message",
        "color": $color,
        "timestamp": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')",
        "footer": {"text": "0G Grant Monitor"}
    }]
}
EOF
)
    
    curl -s -X POST "$DISCORD_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "$payload" > /dev/null
}

# Main monitoring loop
monitor_grant() {
    local check_interval="${GRANT_CHECK_INTERVAL:-3600}"  # 1 hour default
    local last_status=""
    local consecutive_approved=0
    
    log_info "Starting grant monitoring (check interval: ${check_interval}s)"
    log_info "Press Ctrl+C to stop monitoring"
    
    while true; do
        local status
        status=$(check_grant_status) || {
            log_warning "Failed to check status, retrying..."
            sleep 60
            continue
        }
        
        # Check for approval
        if [ "$status" = "approved" ]; then
            if [ "$status" != "$last_status" ]; then
                log_success "✅ Grant approved!"
                send_discord_notification "success" "Grant approved on 0G Guild"
                consecutive_approved=$((consecutive_approved + 1))
                
                # Require 2 consecutive approvals to prevent false positives
                if [ $consecutive_approved -ge 2 ]; then
                    execute_flash_launch
                    exit 0
                fi
            else
                consecutive_approved=$((consecutive_approved + 1))
            fi
        else
            consecutive_approved=0
            if [ "$status" != "$last_status" ]; then
                log_info "Grant status: $status (waiting for approval)"
            fi
        fi
        
        last_status="$status"
        
        # Wait before next check
        sleep "$check_interval"
    done
}

# Cleanup on exit
cleanup() {
    log_info "Monitoring stopped"
}

trap cleanup EXIT

# Main execution
main() {
    log_info "======================================"
    log_info "OINIO Grant Monitoring Script"
    log_info "======================================"
    log_info "Start time: $(date)"
    log_info "Grant ID: $0G_GRANT_ID"
    log_info ""
    
    check_prerequisites
    monitor_grant
}

main "$@"
