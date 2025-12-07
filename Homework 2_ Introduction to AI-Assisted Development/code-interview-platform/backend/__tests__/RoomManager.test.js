/**
 * Unit tests for RoomManager
 * Tests room creation, user management, broadcasting, and cleanup
 */
import { RoomManager } from '../RoomManager.js';
import { jest } from '@jest/globals';

describe('RoomManager', () => {
    let roomManager;

    beforeEach(() => {
        roomManager = new RoomManager();
    });

    afterEach(() => {
        // Clean up all rooms
        roomManager.rooms.clear();
    });

    describe('Room Creation', () => {
        test('should create a new room with unique ID', () => {
            const roomId = 'test-room-123';
            const room = roomManager.createRoom(roomId);

            expect(room).toBeDefined();
            expect(room.id).toBe(roomId);
            expect(room.code).toContain('Welcome');
            expect(room.language).toBe('javascript');
            expect(room.users.size).toBe(0);
            expect(room.createdAt).toBeDefined();
        });

        test('should throw error when creating duplicate room', () => {
            const roomId = 'duplicate-room';
            roomManager.createRoom(roomId);

            expect(() => {
                roomManager.createRoom(roomId);
            }).toThrow('Room already exists');
        });

        test('should initialize room with default values', () => {
            const room = roomManager.createRoom('room-1');

            expect(room.code).toBe('// Welcome to the coding interview!\n// Start typing...\n');
            expect(room.language).toBe('javascript');
            expect(room.users).toBeInstanceOf(Map);
        });
    });

    describe('Room Retrieval', () => {
        test('should get existing room by ID', () => {
            const roomId = 'get-room-test';
            roomManager.createRoom(roomId);

            const room = roomManager.getRoom(roomId);

            expect(room).toBeDefined();
            expect(room.id).toBe(roomId);
        });

        test('should return null for non-existent room', () => {
            const room = roomManager.getRoom('non-existent');

            expect(room).toBeNull();
        });
    });

    describe('Code and Language Updates', () => {
        test('should update room code', () => {
            const roomId = 'code-update-test';
            roomManager.createRoom(roomId);

            const newCode = 'console.log("Hello World");';
            roomManager.updateCode(roomId, newCode);

            const room = roomManager.getRoom(roomId);
            expect(room.code).toBe(newCode);
        });

        test('should update lastActivity when code is updated', () => {
            const roomId = 'activity-test';
            const room = roomManager.createRoom(roomId);
            const initialActivity = room.lastActivity;

            // Wait a bit to ensure timestamp changes
            setTimeout(() => {
                roomManager.updateCode(roomId, 'new code');
                expect(room.lastActivity).toBeGreaterThan(initialActivity);
            }, 10);
        });

        test('should update room language', () => {
            const roomId = 'lang-test';
            roomManager.createRoom(roomId);

            roomManager.updateLanguage(roomId, 'python');

            const room = roomManager.getRoom(roomId);
            expect(room.language).toBe('python');
        });

        test('should handle updates to non-existent room gracefully', () => {
            expect(() => {
                roomManager.updateCode('non-existent', 'code');
            }).not.toThrow();

            expect(() => {
                roomManager.updateLanguage('non-existent', 'python');
            }).not.toThrow();
        });
    });

    describe('User Management', () => {
        test('should add user to room', () => {
            const roomId = 'user-test';
            roomManager.createRoom(roomId);

            const mockWs = { readyState: 1, send: jest.fn() };
            const userId = 'user-123';
            const username = 'TestUser';

            roomManager.addUser(roomId, userId, mockWs, username);

            const room = roomManager.getRoom(roomId);
            expect(room.users.size).toBe(1);
            expect(room.users.has(userId)).toBe(true);

            const user = room.users.get(userId);
            expect(user.username).toBe(username);
            expect(user.ws).toBe(mockWs);
        });

        test('should throw error when adding user to non-existent room', () => {
            const mockWs = { readyState: 1, send: jest.fn() };

            expect(() => {
                roomManager.addUser('non-existent', 'user-1', mockWs);
            }).toThrow('Room not found');
        });

        test('should remove user from room', () => {
            const roomId = 'remove-user-test';
            roomManager.createRoom(roomId);

            const mockWs = { readyState: 1, send: jest.fn() };
            const userId = 'user-to-remove';

            roomManager.addUser(roomId, userId, mockWs, 'TestUser');
            expect(roomManager.getRoom(roomId).users.size).toBe(1);

            roomManager.removeUser(roomId, userId);
            expect(roomManager.getRoom(roomId).users.size).toBe(0);
        });

        test('should get all users in room', () => {
            const roomId = 'get-users-test';
            roomManager.createRoom(roomId);

            const mockWs1 = { readyState: 1, send: jest.fn() };
            const mockWs2 = { readyState: 1, send: jest.fn() };

            roomManager.addUser(roomId, 'user-1', mockWs1, 'Alice');
            roomManager.addUser(roomId, 'user-2', mockWs2, 'Bob');

            const users = roomManager.getRoomUsers(roomId);

            expect(users).toHaveLength(2);
            expect(users[0].username).toBe('Alice');
            expect(users[1].username).toBe('Bob');
            expect(users[0]).not.toHaveProperty('ws'); // ws should not be exposed
        });

        test('should return empty array for non-existent room users', () => {
            const users = roomManager.getRoomUsers('non-existent');
            expect(users).toEqual([]);
        });
    });

    describe('Broadcasting', () => {
        test('should broadcast message to all users except sender', () => {
            const roomId = 'broadcast-test';
            roomManager.createRoom(roomId);

            const mockWs1 = { readyState: 1, send: jest.fn() };
            const mockWs2 = { readyState: 1, send: jest.fn() };
            const mockWs3 = { readyState: 1, send: jest.fn() };

            roomManager.addUser(roomId, 'user-1', mockWs1, 'Alice');
            roomManager.addUser(roomId, 'user-2', mockWs2, 'Bob');
            roomManager.addUser(roomId, 'user-3', mockWs3, 'Charlie');

            const message = { type: 'test', data: 'hello' };
            roomManager.broadcast(roomId, message, 'user-1');

            expect(mockWs1.send).not.toHaveBeenCalled();
            expect(mockWs2.send).toHaveBeenCalledWith(JSON.stringify(message));
            expect(mockWs3.send).toHaveBeenCalledWith(JSON.stringify(message));
        });

        test('should broadcast to all users when no sender specified', () => {
            const roomId = 'broadcast-all-test';
            roomManager.createRoom(roomId);

            const mockWs1 = { readyState: 1, send: jest.fn() };
            const mockWs2 = { readyState: 1, send: jest.fn() };

            roomManager.addUser(roomId, 'user-1', mockWs1, 'Alice');
            roomManager.addUser(roomId, 'user-2', mockWs2, 'Bob');

            const message = { type: 'test', data: 'hello' };
            roomManager.broadcast(roomId, message, null);

            expect(mockWs1.send).toHaveBeenCalledWith(JSON.stringify(message));
            expect(mockWs2.send).toHaveBeenCalledWith(JSON.stringify(message));
        });

        test('should not send to closed WebSocket connections', () => {
            const roomId = 'closed-ws-test';
            roomManager.createRoom(roomId);

            const mockWs1 = { readyState: 1, send: jest.fn() };
            const mockWs2 = { readyState: 3, send: jest.fn() }; // CLOSED

            roomManager.addUser(roomId, 'user-1', mockWs1, 'Alice');
            roomManager.addUser(roomId, 'user-2', mockWs2, 'Bob');

            const message = { type: 'test', data: 'hello' };
            roomManager.broadcast(roomId, message);

            expect(mockWs1.send).toHaveBeenCalled();
            expect(mockWs2.send).not.toHaveBeenCalled();
        });

        test('should handle broadcast errors gracefully', () => {
            const roomId = 'error-test';
            roomManager.createRoom(roomId);

            const mockWs = {
                readyState: 1,
                send: jest.fn(() => {
                    throw new Error('Send failed');
                })
            };

            roomManager.addUser(roomId, 'user-1', mockWs, 'Alice');

            // Should not throw
            expect(() => {
                roomManager.broadcast(roomId, { type: 'test' });
            }).not.toThrow();
        });
    });

    describe('Room Deletion and Cleanup', () => {
        test('should delete room', () => {
            const roomId = 'delete-test';
            roomManager.createRoom(roomId);

            expect(roomManager.getRoom(roomId)).toBeDefined();

            roomManager.deleteRoom(roomId);

            expect(roomManager.getRoom(roomId)).toBeNull();
        });

        test('should get correct room count', () => {
            expect(roomManager.getRoomCount()).toBe(0);

            roomManager.createRoom('room-1');
            roomManager.createRoom('room-2');

            expect(roomManager.getRoomCount()).toBe(2);

            roomManager.deleteRoom('room-1');

            expect(roomManager.getRoomCount()).toBe(1);
        });

        test('should clean up inactive rooms', () => {
            jest.useFakeTimers();

            const roomId = 'inactive-room';
            const room = roomManager.createRoom(roomId);

            // Set lastActivity to 25 hours ago
            room.lastActivity = Date.now() - (25 * 60 * 60 * 1000);

            roomManager.cleanupInactiveRooms();

            expect(roomManager.getRoom(roomId)).toBeNull();

            jest.useRealTimers();
        });

        test('should not delete active rooms during cleanup', () => {
            const roomId = 'active-room';
            roomManager.createRoom(roomId);

            roomManager.cleanupInactiveRooms();

            expect(roomManager.getRoom(roomId)).toBeDefined();
        });
    });
});
