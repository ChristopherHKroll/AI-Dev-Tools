# Development Workflow with Concurrently

This project uses `concurrently` to run both the frontend (Next.js) and backend (Express) simultaneously with a single command.

## 🚀 Quick Start

### Install All Dependencies

```bash
# Install root and backend dependencies
npm run install:all
```

Or manually:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install
```

### Start Everything

```bash
# Start both frontend and backend in development mode
npm run dev
```

This single command will:
- ✅ Start the Next.js dev server on `http://localhost:3000`
- ✅ Start the Express/WebSocket server on `http://localhost:3001`
- ✅ Show color-coded logs (CLIENT in cyan, SERVER in magenta)
- ✅ Auto-restart on file changes

## 📋 Available Scripts

### Development

```bash
npm run dev              # Start both client and server (recommended)
npm run dev:client       # Start only frontend (Next.js)
npm run dev:server       # Start only backend (Express)
```

### Production

```bash
npm run build            # Build Next.js frontend
npm run build:all        # Build frontend and install backend deps
npm run start            # Start both in production mode
npm run start:client     # Start only frontend production server
npm run start:server     # Start only backend production server
```

### Testing

```bash
npm test                 # Run all tests (frontend + backend)
npm run test:client      # Run only frontend tests
npm run test:server      # Run only backend tests

npm run test:watch       # Run all tests in watch mode
npm run test:watch:client    # Watch frontend tests only
npm run test:watch:server    # Watch backend tests only

npm run test:coverage    # Generate coverage for both
npm run test:coverage:client # Frontend coverage only
npm run test:coverage:server # Backend coverage only
```

## 🎨 Log Output

When running `npm run dev`, you'll see color-coded output:

```
[CLIENT] ▲ Next.js 14.0.4
[CLIENT] - Local: http://localhost:3000

[SERVER] 🚀 Code Interview Platform - Backend Server
[SERVER] Server running on port 3001
```

- **CLIENT** logs are in **cyan** 🔵
- **SERVER** logs are in **magenta** 🟣

## 🛠️ How It Works

### Concurrently Configuration

The `concurrently` package runs multiple npm scripts in parallel:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\" --names \"CLIENT,SERVER\" --prefix-colors \"cyan,magenta\""
  }
}
```

**Parameters:**
- `--names`: Prefixes for each process
- `--prefix-colors`: Colors for log differentiation
- Works on **Windows, Linux, and macOS**

### Process Management

- **Auto-restart**: Both dev servers support hot reload
- **Error handling**: If one process crashes, the other continues
- **Graceful shutdown**: `Ctrl+C` stops both processes cleanly

## 🔧 Troubleshooting

### Ports Already in Use

If you get "port already in use" errors:

```bash
# Kill processes on ports 3000 and 3001
# Linux/macOS:
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Dependencies Not Found

```bash
# Reinstall everything
npm run install:all
```

### One Server Won't Start

Run them individually to see detailed errors:

```bash
# Terminal 1
npm run dev:client

# Terminal 2  
npm run dev:server
```

## 📁 Project Structure

```
code-interview-platform/
├── package.json          # Root - runs both apps
├── app/                  # Next.js frontend
├── components/
├── lib/
├── backend/
│   ├── package.json     # Backend dependencies
│   ├── server.js
│   └── RoomManager.js
└── README.md
```

## 🌐 Default Ports

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Backend WebSocket**: ws://localhost:3001

## 💡 Tips

1. **Always use `npm run dev`** for development - it's the easiest way
2. **Use individual scripts** (`dev:client`, `dev:server`) only when debugging
3. **Check both logs** if something isn't working - the issue might be in either service
4. **Run tests before committing**: `npm test`

## 🚢 Deployment

For production deployment, see [README.md](README.md) for platform-specific instructions (Vercel, Render, Railway).

---

**Need help?** Check the main [README.md](README.md) or [TESTING.md](TESTING.md) for more details.
