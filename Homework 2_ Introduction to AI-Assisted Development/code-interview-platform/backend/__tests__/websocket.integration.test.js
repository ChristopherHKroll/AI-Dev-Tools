/**
 * Integration tests for WebSocket Server
 * Tests full client-server communication flow
 */
import { WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';
import { jest } from '@jest/globals';

// Mock server setup
let wss;
let testPort = 3002;

describe('WebSocket Integration Tests', () => {
    beforeAll(() => {
        // We'll test against the actual RoomManager logic
        // without starting the full Express server
    });

    afterAll(() => {
        if (wss) {
            wss.close();
        }
    });

    describe('Client Connection', () => {
        test('should accept WebSocket connections', async (done) => {
            wss = new WebSocketServer({ port: testPort });

            wss.on('connection', (ws) => {
                expect(ws).toBeDefined();
                expect(ws.readyState).toBe(1); // OPEN
                ws.close();
                wss.close();
                done();
            });

            const WebSocket = (await import('ws')).WebSocket;
            const client = new WebSocket(`ws://localhost:${testPort}`);
            client.on('error', (err) => {
                done(err);
            });
        });

        test('should handle multiple simultaneous connections', async (done) => {
            wss = new WebSocketServer({ port: testPort + 1 });

            let connectionCount = 0;
            const expectedConnections = 3;

            wss.on('connection', (ws) => {
                connectionCount++;
                if (connectionCount === expectedConnections) {
                    expect(connectionCount).toBe(expectedConnections);
                    wss.close();
                    done();
                }
            });

            const WebSocket = (await import('ws')).WebSocket;
            // Create multiple clients
            for (let i = 0; i < expectedConnections; i++) {
                new WebSocket(`ws://localhost:${testPort + 1}`);
            }
        }, 10000);
    });

    describe('Message Handling', () => {
        test('should receive and parse JSON messages', async (done) => {
            wss = new WebSocketServer({ port: testPort + 2 });

            wss.on('connection', (ws) => {
                ws.on('message', (rawMessage) => {
                    const message = JSON.parse(rawMessage.toString());
                    expect(message.type).toBe('test');
                    expect(message.data).toEqual({ hello: 'world' });
                    ws.close();
                    wss.close();
                    done();
                });
            });

            const WebSocket = (await import('ws')).WebSocket;
            const client = new WebSocket(`ws://localhost:${testPort + 2}`);
            client.on('open', () => {
                client.send(JSON.stringify({
                    type: 'test',
                    data: { hello: 'world' }
                }));
            });
        });

        test('should handle invalid JSON gracefully', async (done) => {
            wss = new WebSocketServer({ port: testPort + 3 });

            wss.on('connection', (ws) => {
                ws.on('message', (rawMessage) => {
                    try {
                        JSON.parse(rawMessage.toString());
                    } catch (error) {
                        expect(error).toBeDefined();
                        ws.close();
                        wss.close();
                        done();
                    }
                });
            });

            const WebSocket = (await import('ws')).WebSocket;
            const client = new WebSocket(`ws://localhost:${testPort + 3}`);
            client.on('open', () => {
                client.send('invalid json {{{');
            });
        });
    });

    describe('Room Communication', () => {
        test('should broadcast messages to all clients in room', async (done) => {
            wss = new WebSocketServer({ port: testPort + 4 });

            const roomId = 'test-room';
            const clients = [];
            let receivedCount = 0;

            wss.on('connection', (ws) => {
                clients.push(ws);

                // Simulate joining room
                ws.on('message', (rawMessage) => {
                    const message = JSON.parse(rawMessage.toString());

                    if (message.type === 'code-change') {
                        // Broadcast to all other clients
                        clients.forEach(client => {
                            if (client !== ws && client.readyState === 1) {
                                client.send(JSON.stringify({
                                    type: 'code-change',
                                    data: message.data
                                }));
                            }
                        });
                    }
                });

                // When we have 3 clients, send a message from one
                if (clients.length === 3) {
                    clients[0].send(JSON.stringify({
                        type: 'code-change',
                        data: { code: 'test code' }
                    }));
                }
            });

            const WebSocket = (await import('ws')).WebSocket;
            // Create 3 clients
            for (let i = 0; i < 3; i++) {
                const client = new WebSocket(`ws://localhost:${testPort + 4}`);

                client.on('message', (rawMessage) => {
                    const message = JSON.parse(rawMessage.toString());
                    if (message.type === 'code-change') {
                        receivedCount++;
                        expect(message.data.code).toBe('test code');

                        // We expect 2 clients to receive (not the sender)
                        if (receivedCount === 2) {
                            wss.close();
                            done();
                        }
                    }
                });
            }
        }, 10000);
    });

    describe('Connection Cleanup', () => {
        test('should handle client disconnection', async (done) => {
            wss = new WebSocketServer({ port: testPort + 5 });

            wss.on('connection', (ws) => {
                ws.on('close', () => {
                    expect(ws.readyState).toBe(3); // CLOSED
                    wss.close();
                    done();
                });

                // Close connection immediately
                ws.close();
            });

            const WebSocket = (await import('ws')).WebSocket;
            new WebSocket(`ws://localhost:${testPort + 5}`);
        });
    });
});

/**
 * Room State Synchronization Tests
 */
describe('Room State Sync', () => {
    test('should maintain consistent state across clients', async () => {
        const { RoomManager } = await import('../RoomManager.js');
        const roomManager = new RoomManager();

        const roomId = 'sync-test';
        roomManager.createRoom(roomId);

        // Simulate multiple clients updating code
        const updates = [
            'const x = 1;',
            'const x = 1;\nconst y = 2;',
            'const x = 1;\nconst y = 2;\nconsole.log(x + y);'
        ];

        updates.forEach(code => {
            roomManager.updateCode(roomId, code);
        });

        const room = roomManager.getRoom(roomId);
        expect(room.code).toBe(updates[updates.length - 1]);
    });

    test('should handle rapid successive updates', async () => {
        const { RoomManager } = await import('../RoomManager.js');
        const roomManager = new RoomManager();

        const roomId = 'rapid-test';
        roomManager.createRoom(roomId);

        // Simulate 100 rapid updates
        for (let i = 0; i < 100; i++) {
            roomManager.updateCode(roomId, `// Update ${i}`);
        }

        const room = roomManager.getRoom(roomId);
        expect(room.code).toBe('// Update 99');
    });
});
