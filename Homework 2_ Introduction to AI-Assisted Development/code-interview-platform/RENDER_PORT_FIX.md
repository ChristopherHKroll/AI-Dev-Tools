# Render Port Configuration Fix

## Problem
Render deployment was timing out on health checks because:
1. Render expects apps to listen on `PORT` env var (defaults to 10000)
2. Our docker-entrypoint.sh was hardcoded to start backend on port 3001
3. Health check was trying to reach port 10000, but app was on 3001

## Solution

### 1. Updated docker-entrypoint.sh
```bash
# Now uses Render's PORT environment variable
BACKEND_PORT="${PORT:-3001}"
PORT=$BACKEND_PORT node server.js &
```

### 2. Simplified render.yaml
```yaml
# Removed PORT override - let Render use default
envVars:
  - key: NODE_ENV
    value: production
```

### 3. Backend already correct
```javascript
// server.js already uses process.env.PORT
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Result
- ✅ Backend listens on Render's PORT (10000)
- ✅ Health check succeeds at /health
- ✅ Deployment completes successfully
- ✅ Still works locally (uses 3001 as fallback)

## Testing
After deploy, verify:
```bash
curl https://your-app.onrender.com/health
# Should return: {"status":"ok","rooms":0,"timestamp":...}
```
