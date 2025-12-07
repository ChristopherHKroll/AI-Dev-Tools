# Code Interview Platform

A production-ready **real-time collaborative coding interview platform** with instant code execution, built with Next.js, Express, WebSocket, and sandboxed execution engines.

![Platform Features](https://img.shields.io/badge/Real--time-Collaboration-blue) ![Code Execution](https://img.shields.io/badge/Code-Execution-green) ![Multi--Language](https://img.shields.io/badge/Multi-Language-orange)

## ✨ Features

- 🤝 **Real-Time Collaboration** - Multiple users can edit code simultaneously with live synchronization
- 🔒 **Safe Code Execution** - Run JavaScript and Python code directly in the browser using sandboxed environments
- 🌐 **Multi-Language Support** - Syntax highlighting for JavaScript, Python, C++, and Java
- 👥 **User Presence** - See who's connected to your interview session in real-time
- 🔗 **Shareable Links** - One-click share functionality to invite candidates
- ⚡ **Instant Sync** - WebSocket-based architecture for sub-100ms latency
- 🎨 **Premium UI** - Modern, sleek interface optimized for coding interviews

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- CodeMirror 6 (collaborative code editor)
- QuickJS (JavaScript execution engine - WebAssembly)
- Pyodide (Python execution - WebAssembly, loaded from CDN)

**Backend:**
- Node.js with Express
- WebSocket (ws library)
- In-memory room management
- Nanoid for secure room ID generation

### How It Works

#### Real-Time Collaboration
The platform uses WebSocket for bidirectional real-time communication:

1. **Room Creation** - Users create a room with a unique ID
2. **WebSocket Connection** - Clients connect to the WebSocket server
3. **Join Room** - Client sends a `join` message with room ID
4. **Sync State** - Server sends current code and language to new user
5. **Broadcast Changes** - All code edits are broadcast to other room members
6. **Operational Transformation** - Changes are synchronized in real-time

#### Code Execution (Client-Side Only)

**JavaScript:**
- Uses QuickJS compiled to WebAssembly
- Runs in a completely isolated VM context
- Custom `console.log` implementation captures output
- No access to DOM or Node.js APIs
- Execution timeout protection

**Python:**
- Uses Pyodide (CPython compiled to WebAssembly)
- Loaded dynamically from CDN (first run may take a few seconds)
- Full Python standard library available
- Stdout is captured and displayed
- Runs entirely in the browser

**C++ and Java:**
- Syntax highlighting supported
- Compilation requires server-side tooling (not implemented for security)
- Displays informational message about language limitations

> **Security Note:** No code ever executes on the server. All execution happens client-side in isolated WebAssembly sandboxes, ensuring maximum security.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- Modern browser with WebAssembly support

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd code-interview-platform
```

2. **Install all dependencies**
```bash
# Install both frontend and backend dependencies
npm run install:all
```

Or manually:
```bash
# Frontend
npm install

# Backend
cd backend && npm install
```

3. **Configure environment variables** (optional for local dev)

Backend (`backend/.env`):
```bash
cp backend/.env.example backend/.env
# Defaults work for local development
```

### Running Locally

**🚀 Recommended: Start Everything at Once**

```bash
npm run dev
```

This single command starts both:
- ✅ Frontend (Next.js) on `http://localhost:3000`
- ✅ Backend (Express + WebSocket) on `http://localhost:3001`
- ✅ Color-coded logs for easy debugging

**Alternative: Run Separately** (for debugging)

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm run dev:client
```

**Access the platform:**
Open `http://localhost:3000` in your browser.

> 💡 **Tip:** See [DEVELOPMENT.md](file:///workspaces/code-interview-platform/DEVELOPMENT.md) for detailed workflow documentation.

## 🧪 Testing

### Test Structure

The platform includes comprehensive test coverage:

```
code-interview-platform/
├── backend/__tests__/           # Backend tests
│   ├── RoomManager.test.js      # Room management unit tests
│   └── websocket.integration.test.js  # WebSocket integration tests
└── __tests__/                   # Frontend tests
    ├── CodeEditor.test.jsx      # Editor component tests
    ├── WebSocketProvider.test.jsx  # WebSocket client tests
    └── codeRunner.test.js       # Code execution tests
```

### Running Tests

**Backend Tests** (Jest):
```bash
cd backend
npm test               # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report
```

**Frontend Tests** (Vitest):
```bash
npm test               # Run all tests
npm run test:watch     # Interactive watch mode
npm run test:coverage  # With coverage report
npx vitest --ui        # Visual test UI
```

### What's Tested

✅ **Backend Tests:**
- Room creation and management
- User join/leave operations
- Code synchronization
- WebSocket message broadcasting
- State consistency
- Error handling
- Room cleanup

✅ **Frontend Tests:**
- CodeEditor rendering and updates
- WebSocket connection management
- Real-time  code synchronization
- Language switching
- User presence updates
- Code execution (JavaScript/Python)

✅ **Integration Tests:**
- Client-server WebSocket communication
- Multi-client collaboration
- Message broadcasting
- Connection recovery

### Coverage Thresholds

Both frontend and backend maintain 70%+ coverage across:
- Branches
- Functions
- Lines
- Statements

See [TESTING.md](file:///workspaces/code-interview-platform/TESTING.md) for detailed testing documentation.



## 📖 Usage

### Creating an Interview Session

1. Navigate to the homepage
2. Click **"Create Interview Room"**
3. You'll be redirected to a unique room URL
4. Click **"Share Link"** to copy the URL
5. Share the link with your candidate

### Joining a Session

1. Paste the room URL in your browser, or
2. Enter the room ID on the homepage and click **"Join Room"**

### Conducting the Interview

1. **Select Language** - Choose from JavaScript, Python, C++, or Java
2. **Write Code** - Both interviewer and candidate can edit simultaneously
3. **Run Code** - Click "Run Code" to execute (JavaScript and Python only)
4. **View Output** - Results appear in the output console
5. **Monitor Presence** - See connected users in the sidebar

## 🚢 Deployment

### Recommended: Render (One-Click Deploy)

**Deploy to production in minutes with Docker:**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

**Quick Steps:**
1. Sign up at [Render.com](https://render.com) (free, no credit card)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render auto-detects `render.yaml` configuration
5. Click "Create Web Service"
6. Your app is live! 🚀

**Features:**
- ✅ Auto-deploy on git push
- ✅ Free SSL certificate
- ✅ WebSocket support
- ✅ Built-in health checks
- ✅ Free tier available

**Complete Guide:** See [RENDER_DEPLOYMENT.md](file:///workspaces/code-interview-platform/RENDER_DEPLOYMENT.md) for detailed instructions.

---

### Docker Deployment (Self-Hosted)

Deploy anywhere with Docker support:

**Quick Start:**
```bash
# Build the image
docker build -t code-interview-platform .

# Run the container (PORT is exposed for frontend/API access)
docker run -p 3000:3000 -e PORT=3000 code-interview-platform
```

> **Note:** The container runs both Next.js frontend (on PORT) and backend (on internal port 3002). Next.js proxies API requests to the backend automatically.

**Using Docker Compose:**
```bash
docker-compose up -d
```

**Supported Platforms:**
- Render (recommended)
- Fly.io
- Railway  
- AWS ECS/Fargate
- DigitalOcean App Platform
- Google Cloud Run
- Azure Container Instances

**Complete Guide:** See [DOCKER.md](file:///workspaces/code-interview-platform/DOCKER.md) for Docker documentation.

---

### Frontend Deployment (Vercel)

The frontend is optimized for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Environment Variables on Vercel:**
- `NEXT_PUBLIC_WS_URL` - Your WebSocket server URL (e.g., `wss://your-backend.com`)
- `NEXT_PUBLIC_API_URL` - Your API server URL (e.g., `https://your-backend.com`)

### Backend Deployment (Render / Railway)

**Render:**
1. Create a new Web Service
2. Connect your repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables:
   - `PORT` (Render provides this automatically)
   - `CORS_ORIGIN` (your frontend URL)

**Railway:**
1. Create a new project
2. Deploy from GitHub
3. Set root directory to `backend`
4. Railway auto-detects Node.js
5. Add environment variables as needed

**Heroku:**
```bash
# Create Procfile in backend directory
echo "web: node server.js" > backend/Procfile

# Deploy
heroku create your-app-name
git subtree push --prefix backend heroku main
```

### WebSocket Considerations

- Use `wss://` (secure WebSocket) in production
- Ensure your backend supports WebSocket upgrades
- Most platforms (Render, Railway, Heroku) support WebSocket by default
- Configure CORS to allow your frontend domain

## 🔧 Configuration

### Environment Variables

**Backend:**
- `PORT` - Server port (default: 3001)
- `CORS_ORIGIN` - Allowed frontend origin (default: http://localhost:3000)
- `NODE_ENV` - Environment (development/production)

**Frontend:**
- `NEXT_PUBLIC_WS_URL` - WebSocket server URL
- `NEXT_PUBLIC_API_URL` - HTTP API server URL

### Customization

**Add New Languages:**

Edit `/components/CodeEditor.jsx`:
```javascript
import { rust } from '@codemirror/lang-rust';

const languageExtensions = {
  // ... existing languages
  rust: [rust()],
};
```

**Modify Code Templates:**

Edit `/app/room/[roomId]/page.js` in the `handleLanguageChange` function.

**Adjust Execution Timeout:**

Edit `/lib/codeRunner.js` and add timeout logic in the execution functions.

## 🏛️ Project Structure

```
code-interview-platform/
├── backend/
│   ├── server.js              # Express + WebSocket server
│   ├── RoomManager.js         # Room management logic
│   ├── package.json
│   └── .env.example
├── app/
│   ├── layout.js              # Root layout
│   ├── page.js                # Homepage
│   ├── globals.css            # Global styles
│   └── room/
│       └── [roomId]/
│           └── page.js        # Interview room page
├── components/
│   ├── CodeEditor.jsx         # CodeMirror wrapper
│   └── WebSocketProvider.jsx # WebSocket context
├── lib/
│   └── codeRunner.js          # Code execution engine
├── package.json
├── next.config.js
└── README.md
```

## 🔐 Security

### Client-Side Execution Only

- **No server-side code execution** - All code runs in the browser
- **Sandboxed environments** - QuickJS and Pyodide provide isolation
- **No file system access** - Execution engines can't access user files
- **No network access** - Sandboxed code cannot make HTTP requests
- **Memory limits** - WebAssembly has built-in memory constraints

### WebSocket Security

- **Unique room IDs** - Cryptographically random (nanoid)
- **Input validation** - All messages are validated
- **Rate limiting** - Can be added via middleware (recommended for production)
- **CORS protection** - Restricts allowed origins

### Recommended Production Enhancements

1. Add authentication (JWT, OAuth)
2. Implement rate limiting
3. Add room passwords/access controls
4. Store session history (database integration)
5. Add execution time limits
6. Implement user banning/moderation

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

- [ ] Add TypeScript support
- [ ] Implement automated tests
- [ ] Add more language support
- [ ] Integrate database for persistence
- [ ] Add video/audio chat
- [ ] Implement replay/recording feature
- [ ] Add AI-powered code suggestions

## 📝 License

MIT License - feel free to use this for your own projects!

## 🙏 Acknowledgments

- **CodeMirror** - Excellent code editor
- **QuickJS** - Fast JavaScript engine
- **Pyodide** - Python in the browser
- **Next.js** - React framework
- **WebSocket** - Real-time communication

---

**Built with ❤️ for better technical interviews**

For questions or issues, please open a GitHub issue.