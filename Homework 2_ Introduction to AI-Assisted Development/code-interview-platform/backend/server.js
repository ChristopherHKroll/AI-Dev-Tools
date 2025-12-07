/**
 * Code Interview Platform - Backend Server
 * WebSocket server for real-time collaborative coding
 */
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';
import cors from 'cors';
import dotenv from 'dotenv';
import { RoomManager } from './RoomManager.js';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Initialize room manager
const roomManager = new RoomManager();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        rooms: roomManager.getRoomCount(),
        timestamp: Date.now()
    });
});

/**
 * Create a new interview room
 */
app.post('/api/rooms', (req, res) => {
    try {
        const roomId = nanoid(10); // Generate secure random ID
        const room = roomManager.createRoom(roomId);

        res.json({
            roomId: room.id,
            url: `/room/${room.id}`
        });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

/**
 * Get room info (code, language, users)
 */
app.get('/api/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    const room = roomManager.getRoom(roomId);

    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
        id: room.id,
        code: room.code,
        language: room.language,
        users: roomManager.getRoomUsers(roomId),
        createdAt: room.createdAt
    });
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    let userId = nanoid(8);
    let currentRoomId = null;
    let username = 'Anonymous';

    console.log(`New WebSocket connection: ${userId}`);

    /**
     * Send message to this client
     */
    const send = (type, data) => {
        if (ws.readyState === 1) { // OPEN
            ws.send(JSON.stringify({ type, data }));
        }
    };

    /**
     * Handle incoming messages
     */
    ws.on('message', (rawMessage) => {
        try {
            const message = JSON.parse(rawMessage.toString());
            const { type, data } = message;

            switch (type) {
                case 'join':
                    handleJoin(data);
                    break;

                case 'code-change':
                    handleCodeChange(data);
                    break;

                case 'language-change':
                    handleLanguageChange(data);
                    break;

                case 'cursor-position':
                    handleCursorPosition(data);
                    break;

                default:
                    console.warn(`Unknown message type: ${type}`);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            send('error', { message: 'Invalid message format' });
        }
    });

    /**
     * Handle user joining a room
     */
    function handleJoin({ roomId, username: uname }) {
        try {
            // Create room if it doesn't exist
            let room = roomManager.getRoom(roomId);
            if (!room) {
                room = roomManager.createRoom(roomId);
            }

            currentRoomId = roomId;
            username = uname || 'Anonymous';

            // Add user to room
            roomManager.addUser(roomId, userId, ws, username);

            // Send initial state to new user
            send('joined', {
                userId,
                roomId,
                code: room.code,
                language: room.language,
                users: roomManager.getRoomUsers(roomId)
            });

            // Notify other users
            roomManager.broadcast(roomId, {
                type: 'user-joined',
                data: {
                    userId,
                    username,
                    users: roomManager.getRoomUsers(roomId)
                }
            }, userId);

        } catch (error) {
            console.error('Error joining room:', error);
            send('error', { message: 'Failed to join room' });
        }
    }

    /**
     * Handle code change
     */
    function handleCodeChange({ code }) {
        if (!currentRoomId) return;

        // Update room code
        roomManager.updateCode(currentRoomId, code);

        // Broadcast to other users
        roomManager.broadcast(currentRoomId, {
            type: 'code-change',
            data: { code, userId }
        }, userId);
    }

    /**
     * Handle language change
     */
    function handleLanguageChange({ language }) {
        if (!currentRoomId) return;

        // Update room language
        roomManager.updateLanguage(currentRoomId, language);

        // Broadcast to all users including sender
        roomManager.broadcast(currentRoomId, {
            type: 'language-change',
            data: { language, userId }
        }, null); // null = broadcast to all
    }

    /**
     * Handle cursor position updates
     */
    function handleCursorPosition({ line, ch }) {
        if (!currentRoomId) return;

        // Broadcast cursor position to other users
        roomManager.broadcast(currentRoomId, {
            type: 'cursor-position',
            data: { userId, username, line, ch }
        }, userId);
    }

    /**
     * Handle connection close
     */
    ws.on('close', () => {
        console.log(`WebSocket closed: ${userId}`);

        if (currentRoomId) {
            roomManager.removeUser(currentRoomId, userId);

            // Notify other users
            roomManager.broadcast(currentRoomId, {
                type: 'user-left',
                data: {
                    userId,
                    username,
                    users: roomManager.getRoomUsers(currentRoomId)
                }
            });
        }
    });

    /**
     * Handle errors
     */
    ws.on('error', (error) => {
        console.error(`WebSocket error for ${userId}:`, error.message);
    });
});

// Cleanup inactive rooms every hour
setInterval(() => {
    roomManager.cleanupInactiveRooms();
}, 60 * 60 * 1000);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║  🚀 Code Interview Platform - Backend Server          ║
║                                                        ║
║  Server running on port ${PORT}                          ║
║  WebSocket: ws://localhost:${PORT}                       ║
║  HTTP: http://localhost:${PORT}                          ║
║                                                        ║
║  Endpoints:                                            ║
║  - GET  /health                                        ║
║  - POST /api/rooms                                     ║
║  - GET  /api/rooms/:roomId                             ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
