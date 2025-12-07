#!/bin/sh
# Docker entrypoint script to start both frontend and backend

set -e

echo "🚀 Starting Code Interview Platform..."

# Render sets PORT environment variable
# Next.js will run on this PORT (public)
# Backend will run on internal port 3002 (different from public)

FRONTEND_PORT="${PORT:-3000}"
BACKEND_PORT="3002"

echo "📊 Configuration:"
echo "   Frontend Port: $FRONTEND_PORT (public)"
echo "   Backend Port: $BACKEND_PORT (internal)"
echo "   Environment:${NODE_ENV:-production}"

# Start backend on internal port
echo "📡 Starting backend server on port $BACKEND_PORT..."
cd /app
PORT=$BACKEND_PORT node server.js &
BACKEND_PID=$!

# Wait for backend to initialize
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start!"
    exit 1
fi

echo "✅ Backend started (PID: $BACKEND_PID)"

# Start Next.js frontend server on main PORT
echo "🎨 Starting Next.js frontend on port $FRONTEND_PORT..."
cd /app

# Swap to frontend package.json (no "type": "module") for Next.js
mv package.json backend_package.json.tmp
mv frontend_package.json package.json

# Set environment variables for Next.js
export NEXT_PUBLIC_WS_URL="ws://localhost:${FRONTEND_PORT}"
export NEXT_PUBLIC_API_URL="http://localhost:${FRONTEND_PORT}"

NODE_ENV=production PORT=$FRONTEND_PORT NODE_PATH=./frontend_node_modules node frontend_node_modules/next/dist/bin/next start &
FRONTEND_PID=$!

# Wait for frontend to initialize
echo "⏳ Waiting for frontend to start..."
sleep 3

# Check if frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend failed to start!"
    kill -TERM $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Frontend started (PID: $FRONTEND_PID)"

# Function to handle shutdown
shutdown() {
    echo "🛑 Shutting down gracefully..."
    kill -TERM $FRONTEND_PID 2>/dev/null || true
    kill -TERM $BACKEND_PID 2>/dev/null || true
    wait $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
    exit 0
}

# Trap termination signals
trap shutdown SIGTERM SIGINT

echo "✅ Service started successfully!"
echo "   Public: http://localhost:$FRONTEND_PORT"
echo "   Backend (internal): http://localhost:$BACKEND_PORT"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
