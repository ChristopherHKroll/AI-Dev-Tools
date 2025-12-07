#!/bin/sh
# Post-deploy script for Render
# This runs after the container starts

set -e

echo "🔧 Running post-deploy tasks..."

# Update environment variables if needed
if [ -z "$NEXT_PUBLIC_WS_URL" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_WS_URL not set"
    echo "   Set it to: wss://your-app.onrender.com"
fi

if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_API_URL not set"
    echo "   Set it to: https://your-app.onrender.com"
fi

# Log startup info
echo "✅ Post-deploy tasks complete"
echo "   Environment: $NODE_ENV"
echo "   Port: $PORT"
echo "   Health check: /health"
