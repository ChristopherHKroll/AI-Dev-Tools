# Docker Deployment Guide

## 📦 Containerized Application

The Code Interview Platform is packaged as a **single unified Docker container** that includes both the Next.js frontend and Express backend.

## 🏗️ Architecture

### Multi-Stage Build

```
Stage 1: Frontend Builder
├── Install Next.js dependencies
├── Build Next.js app
└── Generate .next folder

Stage 2: Backend Builder
├── Install Express dependencies
└── Prepare production node_modules

Stage 3: Final Image
├── Copy built Next.js app
├── Copy backend code
├── Copy dependencies
├── Create non-root user
└── Setup entrypoint script
```

### Container Structure

```
/app
├── server.js                # Express backend
├── RoomManager.js           # Room management
├── .next/                   # Next.js build
├── public/                  # Static assets
├── node_modules/            # Backend dependencies
├── frontend_node_modules/   # Frontend dependencies
├── package.json             # Backend package.json (ES modules)
├── frontend_package.json    # Frontend package.json
├── next.config.js           # Next.js config with API proxy
└── docker-entrypoint.sh     # Startup script
```

## 🚀 Quick Start

### Build the Image

```bash
docker build -t code-interview-platform .
```

**Build time:** ~3-5 minutes (first build)

### Run the Container

```bash
# Run with default PORT (3000)
docker run -p 3000:3000 -e PORT=3000 code-interview-platform
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API (proxied): http://localhost:3000/health

> **Architecture:** Next.js runs on PORT (3000) and proxies API requests to the internal backend server on port 3002.

### Using Docker Compose (Recommended)

```bash
# Start the application
docker-compose up

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

## 🔧 Build Options

### Production Build

```bash
docker build -t code-interview-platform:latest .
```

### Tagged Build

```bash
docker build -t code-interview-platform:v1.0.0 .
```

### Build with Custom Cache

```bash
docker build --no-cache -t code-interview-platform .
```

### Build for Specific Platform

```bash
# For ARM64 (Apple Silicon)
docker build --platform linux/arm64 -t code-interview-platform .

# For AMD64 (Intel/AMD)
docker build --platform linux/amd64 -t code-interview-platform .

# Multi-platform
docker buildx build --platform linux/amd64,linux/arm64 -t code-interview-platform .
```

## 🏃 Running the Container

### Basic Run

```bash
docker run -p 3000:3000 -e PORT=3000 code-interview-platform
```

### Run in Background (Detached)

```bash
docker run -d \
  --name interview-platform \
  -p 3000:3000 \
  -e PORT=3000 \
  code-interview-platform
```

### Run with Environment Variables

```bash
docker run -d \
  --name interview-platform \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  code-interview-platform
```

### Run with Restart Policy

```bash
docker run -d \
  --name interview-platform \
  --restart unless-stopped \
  -p 3000:3000 \
  -e PORT=3000 \
  code-interview-platform
```

## 📊 Container Management

### View Logs

```bash
# All logs
docker logs interview-platform

# Follow logs (live)
docker logs -f interview-platform

# Last 100 lines
docker logs --tail 100 interview-platform
```

### Stop Container

```bash
docker stop interview-platform
```

### Start Container

```bash
docker start interview-platform
```

### Restart Container

```bash
docker restart interview-platform
```

### Remove Container

```bash
docker rm -f interview-platform
```

## 🧪 Testing

### Health Check

```bash
# Check if backend is healthy (proxied through Next.js)
curl http://localhost:3000/health

# Expected response:
{"status":"ok","rooms":0,"timestamp":1234567890}
```

### Test Frontend

```bash
# Open in browser
open http://localhost:3000

# Or with curl
curl http://localhost:3000
```

### Test WebSocket

```bash
# Install wscat if not already
npm install -g wscat

# Connect to WebSocket (proxied through Next.js)
wscat -c ws://localhost:3000
```

## 🚢 Deployment

### Push to Docker Hub

```bash
# Login
docker login

# Tag image
docker tag code-interview-platform username/code-interview-platform:latest

# Push
docker push username/code-interview-platform:latest
```

### Deploy to Cloud Platforms

#### **Fly.io**

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Create fly app
fly launch

# Deploy
fly deploy
```

#### **Render**

1. Create new **Web Service**
2. Select **Docker**
3. Point to repository
4. Render auto-detects Dockerfile
5. Set ports: 3000, 3001

#### **Railway**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

#### **AWS ECS/Fargate**

```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag code-interview-platform:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/interview-platform:latest

docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/interview-platform:latest
```

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs interview-platform

# Inspect container
docker inspect interview-platform

# Check if ports are available
lsof -i :3000
lsof -i :3001
```

### Port Conflicts

```bash
# Use different port
docker run -p 8000:3000 -e PORT=3000 code-interview-platform
```

### Memory Issues

```bash
# Increase memory limit
docker run --memory="2g" -p 3000:3000 -e PORT=3000 code-interview-platform
```

### Build Failures

```bash
# Clean build with no cache
docker build --no-cache -t code-interview-platform .

# Check Docker disk space
docker system df

# Clean up unused images
docker system prune -a
```

## 📈 Production Optimizations

### Image Size

Current image size: ~350MB (Alpine-based)

**Optimization techniques used:**
- ✅ Multi-stage builds
- ✅ Alpine Linux base
- ✅ Production-only dependencies
- ✅ .dockerignore exclusions
- ✅ Layer caching

### Security

**Security features implemented:**
- ✅ Non-root user (nodejs:1001)
- ✅ Minimal base image (Alpine)
- ✅ No unnecessary packages
- ✅ Health checks
- ✅ Proper signal handling (dumb-init)

### Performance

```bash
# Run with resource limits
docker run -d \
  --name interview-platform \
  --cpus="1.5" \
  --memory="1g" \
  --memory-swap="2g" \
  -p 3000:3000 \
  -e PORT=3000 \
  code-interview-platform
```

## 🔐 Environment Variables

```bash
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e CORS_ORIGIN=https://yourdomain.com \
  code-interview-platform
```

## 📝 Notes

### Dual-Server Architecture

This Docker container runs **two servers in one container**:
- **Next.js Frontend** on PORT (default: 3000) - Public facing
- **Express Backend** on internal port 3002 - Internal only

Next.js acts as a reverse proxy, forwarding `/api/*` and `/health` requests to the internal backend via rewrites configured in `next.config.js`.

**Why This Design?**
- ✅ Single port exposure (simpler deployment)
- ✅ Next.js handles SSL termination
- ✅ Built-in API proxying
- ✅ Unified frontend/backend deployment

### Container Best Practices

This Dockerfile follows:
- ✅ Multi-stage builds
- ✅ Layer caching optimization
- ✅ Minimal base images (Alpine Linux)
- ✅ Node 20 for modern JavaScript support
- ✅ Non-root user
- ✅ Health checks
- ✅ Proper signal handling
- ✅ .dockerignore usage
- ✅ Explicit version pinning

---

**For detailed deployment guides, see the main README.md**
