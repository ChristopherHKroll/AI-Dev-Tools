# Render Deployment Guide

## 🚀 Complete Deployment Guide for Render

This guide walks you through deploying the Code Interview Platform to Render using Docker.

---

## 📋 Prerequisites

- GitHub account
- Code pushed to GitHub repository
- Render account (sign up at https://render.com - **no credit card required for free tier**)

---

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Repository

**1.1 Ensure all files are committed:**
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

**1.2 Verify required files exist:**
- ✅ `Dockerfile`
- ✅ `render.yaml`
- ✅ `docker-entrypoint.sh`
- ✅ `.dockerignore`

---

### Step 2: Create Render Account

**2.1 Sign up:**
- Go to https://render.com
- Click "Get Started"
- Sign up with GitHub (recommended) or email
- **No credit card required for free tier**

**2.2 Connect GitHub:**
- Authorize Render to access your GitHub repositories
- Select "All repositories" or specific repository

---

### Step 3: Create New Web Service

**3.1 From Render Dashboard:**
- Click "New +" button (top right)
- Select "Web Service"

**3.2 Connect Repository:**
- Find your repository: `your-username/code-interview-platform`
- Click "Connect"

**3.3 Initial Configuration:**
```
Name: code-interview-platform
Region: Oregon (or closest to your users)
Branch: main
Environment: Docker
Plan: Free (or Starter for production)
```

---

### Step 4: Configure Environment Variables

Render will detect `render.yaml` automatically, but you need to set these variables in the dashboard:

**4.1 Click "Advanced" → "Add Environment Variable"**

**Required Variables:**

| Key | Value | Example | Description |
|-----|-------|---------|-------------|
| `PORT` | Auto-set by Render | `3001` | Main port (Render provides automatically) |
| `NODE_ENV` | `production` | `production` | Environment |
| `CORS_ORIGIN` | Your Render URL | `https://your-app.onrender.com` | Allowed origin |
| `NEXT_PUBLIC_WS_URL` | Your WebSocket URL | `wss://your-app.onrender.com` | WebSocket URL (same as main URL) |
| `NEXT_PUBLIC_API_URL` | Your API URL | `https://your-app.onrender.com` | API URL (same as main URL) |

> **Note:** Render automatically sets `PORT`. Next.js runs on this PORT and proxies API/WebSocket requests to the internal backend (port 3002).

**4.2 Save Environment Variables**

---

### Step 5: Deploy!

**5.1 Click "Create Web Service"**

Render will:
1. ✅ Clone your repository
2. ✅ Detect `render.yaml` configuration
3. ✅ Build Docker image using `Dockerfile`
4. ✅ Start the container
5. ✅ Assign a URL: `https://your-app.onrender.com`

**5.2 Monitor Build Progress:**
- Watch the "Logs" tab in real-time
- Build typically takes 5-10 minutes (first deployment)
- Look for: `✅ Both services started successfully!`

---

### Step 6: Verify Deployment

**6.1 Check Service Health:**
```bash
# Test health endpoint
curl https://your-app.onrender.com/health

# Expected response:
{"status":"ok","rooms":0,"timestamp":1234567890}
```

**6.2 Test Frontend:**
- Open: `https://your-app.onrender.com`
- You should see the Code Interview Platform homepage
- Try creating a room

**6.3 Test WebSocket Connection:**
- Create a room
- Open the same room in another tab
- Type in the editor
- Both tabs should sync in real-time ✨

---

## 🔄 Auto-Deploy Updates

**Configured in `render.yaml`:**
```yaml
autoDeploy: true
branch: main
```

**How it works:**
1. Push changes to `main` branch:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. Render automatically:
   - ✅ Detects the push
   - ✅ Rebuilds Docker image
   - ✅ Deploys new version
   - ✅ Zero-downtime rollout

**Monitor deployments:**
- Dashboard → "Events" tab
- See all past deployments
- Rollback if needed (one-click)

---

## 📊 Scaling & Performance

### Free Tier Limitations

**Free Plan:**
- ✅ 750 hours/month free
- ✅ Sleeps after 15 minutes of inactivity
- ✅ 512MB RAM
- ✅ Shared CPU
- ⚠️ Cold starts (~30 seconds on first request)

**Upgrade for Production:**

**Starter Plan ($7/month):**
- ✅ Always on (no sleep)
- ✅ 512MB RAM
- ✅ SSL included
- ✅ Custom domains

**Standard Plan ($25/month):**
- ✅ 2GB RAM
- ✅ Shared CPU
- ✅ Faster builds
- ✅ Priority support

### Scaling Configuration

**In `render.yaml`:**
```yaml
numInstances: 1  # Change to 2+ for load balancing
```

**Or in Dashboard:**
- Settings → "Scaling"
- Increase instance count
- Render automatically load balances

---

## 🔐 Custom Domain Setup

### Add Your Domain

**1. In Render Dashboard:**
- Settings → "Custom Domains"
- Click "Add Custom Domain"
- Enter: `interview.yourdomain.com`

**2. Configure DNS:**
Add CNAME record in your DNS provider:
```
Type: CNAME
Name: interview
Value: your-app.onrender.com
```

**3. SSL Certificate:**
- Render automatically provisions SSL
- Takes ~5 minutes
- Free Let's Encrypt certificate

**4. Update Environment Variables:**
Update CORS and WebSocket URLs:
```
CORS_ORIGIN: https://interview.yourdomain.com
NEXT_PUBLIC_WS_URL: wss://interview.yourdomain.com
NEXT_PUBLIC_API_URL: https://interview.yourdomain.com
```

---

## 📝 Logs & Debugging

### View Logs

**Real-time Logs:**
- Dashboard → "Logs" tab
- See all stdout/stderr output
- Filter by date/time

**Search Logs:**
```bash
# Install Render CLI (optional)
npm install -g render

# Login
render login

# Stream logs
render logs -f code-interview-platform
```

### Debug Common Issues

**Issue: "Port already in use"**
- ✅ Solution: Render sets `PORT` env var automatically
- Make sure backend uses `process.env.PORT || 3001`

**Issue: "Health check failing"**
- Check: `/health` endpoint is accessible
- Verify: Backend is listening on correct port
- Logs: Look for "Server running on port..."

**Issue: "WebSocket not connecting"**
- Verify: `NEXT_PUBLIC_WS_URL` uses `wss://` (not `ws://`)
- Check: CORS_ORIGIN matches your domain
- Test: Use browser DevTools → Network tab → WS

**Issue: "502 Bad Gateway"**
- Common on first deploy
- Wait: Container may still be starting
- Check: Logs for errors
- Timeout: Free tier has limited resources

---

## 🔄 Rollback Deployment

**If something breaks:**

**1. In Dashboard:**
- "Events" tab
- Find previous successful deploy
- Click "..." → "Redeploy"

**2. Or via Git:**
```bash
# Revert last commit
git revert HEAD

# Push
git push origin main

# Render auto-deploys previous version
```

---

## 📈 Monitoring

### Built-in Metrics

**Dashboard → "Metrics":**
- ✅ CPU usage
- ✅ Memory usage
- ✅ Request count
- ✅ Response times

### Health Checks

**Configured in `render.yaml`:**
```yaml
healthCheckPath: /health
```

**Render checks every 30 seconds:**
- If fails 3 times → restarts service
- Automatic recovery
- Email notifications (optional)

### Alerts (Paid Plans)

**Settings → "Notifications":**
- Deployment failures
- Service crashes
- Memory/CPU alerts

---

## 💰 Cost Breakdown

### Free Tier
```
Price: $0/month
✅ 750 hours/month
✅ Sleeps after 15 min inactivity
✅ Good for: Testing, demos, personal projects
```

### Starter ($7/month)
```
Price: $7/month per service
✅ Always on
✅ 512MB RAM
✅ Good for: Side projects, small teams
```

### Standard ($25/month)
```
Price: $25/month per service
✅ 2GB RAM
✅ Priority support
✅ Good for: Production apps, teams
```

---

## 🚨 Production Checklist

Before going live:

- [ ] Upgrade from Free to Starter plan (avoid cold starts)
- [ ] Set up custom domain
- [ ] Configure environment variables
- [ ] Enable auto-deploy from `main` branch
- [ ] Test all features (rooms, code execution, sync)
- [ ] Set up monitoring/alerts
- [ ] Document deployment process for team
- [ ] Test WebSocket connections under load
- [ ] Review logs for warnings/errors
- [ ] Set up database (if needed for persistence)

---

## 🎯 Quick Reference

### Useful Links

**Dashboard:**
- https://dashboard.render.com

**Your Service:**
- https://dashboard.render.com/web/[service-id]

**Logs:**
- Dashboard → Your Service → "Logs"

**Metrics:**
- Dashboard → Your Service → "Metrics"

### Command Cheat Sheet

```bash
# Deploy new version
git push origin main

# View live logs
render logs -f code-interview-platform

# Check deployment status
render status code-interview-platform

# SSH into container (debugging)
render shell code-interview-platform
```

---

## 🆘 Support

**Render Support:**
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

**Common Issues:**
- Check logs first
- Review environment variables
- Verify Dockerfile builds locally
- Test with `docker-compose up`

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ Health check passes: `https://your-app.onrender.com/health`
2. ✅ Frontend loads: Homepage appears
3. ✅ Can create rooms: Click "Create Interview Room"
4. ✅ Real-time sync works: Open room in two tabs, type in one, see in both
5. ✅ Code execution works: Run JavaScript/Python code
6. ✅ WebSocket stable: No disconnections during editing
7. ✅ No errors in logs

---

**🎉 Congratulations! Your Code Interview Platform is now live on Render!**

Share your room links and start conducting interviews! 🚀
