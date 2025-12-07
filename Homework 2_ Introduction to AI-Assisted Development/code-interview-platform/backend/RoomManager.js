/**
 * RoomManager - Manages interview rooms, users, and room state
 * Provides a clean abstraction for room operations
 */
export class RoomManager {
    constructor() {
        // Map of roomId -> room data
        this.rooms = new Map();
    }

    /**
     * Create a new room with unique ID
     * @param {string} roomId - Unique room identifier
     * @returns {Object} Room data
     */
    createRoom(roomId) {
        if (this.rooms.has(roomId)) {
            throw new Error('Room already exists');
        }

        const room = {
            id: roomId,
            code: '// Welcome to the coding interview!\n// Start typing...\n',
            language: 'javascript',
            users: new Map(), // userId -> user data
            createdAt: Date.now(),
            lastActivity: Date.now()
        };

        this.rooms.set(roomId, room);
        console.log(`✓ Created room ${roomId}`);
        return room;
    }

    /**
     * Get room by ID
     * @param {string} roomId
     * @returns {Object|null} Room data or null
     */
    getRoom(roomId) {
        return this.rooms.get(roomId) || null;
    }

    /**
     * Update room code
     * @param {string} roomId
     * @param {string} code
     */
    updateCode(roomId, code) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.code = code;
            room.lastActivity = Date.now();
        }
    }

    /**
     * Update room language
     * @param {string} roomId
     * @param {string} language
     */
    updateLanguage(roomId, language) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.language = language;
            room.lastActivity = Date.now();
        }
    }

    /**
     * Add user to room
     * @param {string} roomId
     * @param {string} userId
     * @param {WebSocket} ws
     * @param {string} username
     */
    addUser(roomId, userId, ws, username = 'Anonymous') {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error('Room not found');
        }

        room.users.set(userId, {
            id: userId,
            username,
            ws,
            joinedAt: Date.now()
        });

        room.lastActivity = Date.now();
        console.log(`✓ User ${username} (${userId}) joined room ${roomId}`);
    }

    /**
     * Remove user from room
     * @param {string} roomId
     * @param {string} userId
     */
    removeUser(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (room) {
            const user = room.users.get(userId);
            room.users.delete(userId);

            console.log(`✓ User ${userId} left room ${roomId}`);

            // Clean up empty rooms after 5 minutes
            if (room.users.size === 0) {
                setTimeout(() => {
                    const currentRoom = this.rooms.get(roomId);
                    if (currentRoom && currentRoom.users.size === 0) {
                        this.deleteRoom(roomId);
                    }
                }, 5 * 60 * 1000);
            }
        }
    }

    /**
     * Get all users in a room
     * @param {string} roomId
     * @returns {Array} Array of user objects
     */
    getRoomUsers(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return [];

        return Array.from(room.users.values()).map(user => ({
            id: user.id,
            username: user.username,
            joinedAt: user.joinedAt
        }));
    }

    /**
     * Broadcast message to all users in a room except sender
     * @param {string} roomId
     * @param {Object} message
     * @param {string} senderId - ID of sender to exclude
     */
    broadcast(roomId, message, senderId = null) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const messageStr = JSON.stringify(message);

        room.users.forEach((user, userId) => {
            if (userId !== senderId && user.ws.readyState === 1) { // 1 = OPEN
                try {
                    user.ws.send(messageStr);
                } catch (error) {
                    console.error(`Error sending to user ${userId}:`, error.message);
                }
            }
        });
    }

    /**
     * Delete a room
     * @param {string} roomId
     */
    deleteRoom(roomId) {
        this.rooms.delete(roomId);
        console.log(`✓ Deleted room ${roomId}`);
    }

    /**
     * Get total number of rooms
     * @returns {number}
     */
    getRoomCount() {
        return this.rooms.size;
    }

    /**
     * Clean up inactive rooms (older than 24 hours with no activity)
     */
    cleanupInactiveRooms() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        this.rooms.forEach((room, roomId) => {
            if (now - room.lastActivity > maxAge) {
                this.deleteRoom(roomId);
            }
        });
    }
}
