#!/bin/bash
# Health check script for monitoring services
# Usage: ./health-check.sh [service_name] or ./health-check.sh all

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Service configurations
FASTAPI_URL="${FASTAPI_URL:-http://localhost:8000}"
FLASK_URL="${FLASK_URL:-http://localhost:5000}"
GRADIO_URL="${GRADIO_URL:-http://localhost:7860}"
TIMEOUT="${HEALTH_CHECK_TIMEOUT:-5}"

# Function to check service health
check_service() {
    local name="$1"
    local url="$2"
    local endpoint="${3:-/health}"
    
    echo -n "Checking $name at $url$endpoint... "
    
    if curl -sf -m "$TIMEOUT" "$url$endpoint" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ unavailable${NC}"
        return 1
    fi
}

# Check all services
check_all_services() {
    local exit_code=0
    check_service "FastAPI Quantum Conduit (Port 8000)" "$FASTAPI_URL" || exit_code=1
    check_service "Flask Glyph Weaver (Port 5000)" "$FLASK_URL" || exit_code=1
    check_service "Gradio Truth Mirror (Port 7860)" "$GRADIO_URL" "/" || exit_code=1
    return $exit_code
}

# Main health check logic
main() {
    local service="${1:-all}"
    local exit_code=0
    
    echo "🏥 Health Check Report"
    echo "====================="
    echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo ""
    
    case "$service" in
        fastapi)
            check_service "FastAPI Quantum Conduit (Port 8000)" "$FASTAPI_URL" || exit_code=1
            ;;
        flask)
            check_service "Flask Glyph Weaver (Port 5000)" "$FLASK_URL" || exit_code=1
            ;;
        gradio)
            check_service "Gradio Truth Mirror (Port 7860)" "$GRADIO_URL" "/" || exit_code=1
            ;;
        all|*)
            check_all_services || exit_code=1
            ;;
    esac
    
    echo ""
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}Overall Status: ✅ All services healthy${NC}"
    else
        echo -e "${YELLOW}Overall Status: ⚠️ Some services unavailable${NC}"
    fi
    
    exit $exit_code
}

main "$@"
