#!/bin/sh
# Quantum Pi Forge Production Startup Script

set -e

echo "🚀 Starting Quantum Pi Forge Production Environment"

# Load environment variables
if [ -f .env.production ]; then
    echo "📄 Loading production environment variables"
    export $(cat .env.production | xargs)
fi

# Function to handle shutdown gracefully
shutdown() {
    echo "🛑 Received shutdown signal, stopping services..."
    kill $API_PID $FRONTEND_PID 2>/dev/null || true
    wait $API_PID $FRONTEND_PID 2>/dev/null || true
    echo "✅ Services stopped"
    exit 0
}

# Trap shutdown signals
trap shutdown SIGTERM SIGINT

# Start API server (Express.js)
echo "🔧 Starting API server on port 8000"
cd api && node index.js &
API_PID=$!

# Wait a moment for API to start
sleep 5

# Check if API is healthy
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ API server started successfully"
else
    echo "❌ API server failed to start"
    kill $API_PID 2>/dev/null || true
    exit 1
fi

# Start frontend server (Next.js)
echo "🌐 Starting frontend server on port 3000"
npm start &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 10

# Check if frontend is healthy
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Frontend server started successfully"
else
    echo "❌ Frontend server failed to start"
    kill $API_PID $FRONTEND_PID 2>/dev/null || true
    exit 1
fi

echo "🎉 Quantum Pi Forge is running!"
echo "📊 API Health: http://localhost:8000/health"
echo "🌐 Frontend: http://localhost:3000"
echo "📈 Monitoring: http://localhost:8000/metrics (if enabled)"

# Wait for any process to exit
wait $API_PID $FRONTEND_PID