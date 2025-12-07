'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';

const WebSocketContext = createContext(null);

export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within WebSocketProvider');
    }
    return context;
}

export function WebSocketProvider({ children, roomId }) {
    const [isConnected, setIsConnected] = useState(false);
    const [users, setUsers] = useState([]);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const messageHandlersRef = useRef(new Set());

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

    /**
     * Connect to WebSocket server
     */
    const connect = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        try {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('✓ WebSocket connected');
                setIsConnected(true);

                // Join the room
                ws.send(JSON.stringify({
                    type: 'join',
                    data: {
                        roomId,
                        username: `User-${Math.random().toString(36).substr(2, 4)}`,
                    },
                }));
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);

                    // Handle user list updates
                    if (message.data?.users) {
                        setUsers(message.data.users);
                    }

                    // Notify all message handlers
                    messageHandlersRef.current.forEach(handler => {
                        handler(message);
                    });
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
                wsRef.current = null;

                // Attempt to reconnect after 2 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('Attempting to reconnect...');
                    connect();
                }, 2000);
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

        } catch (error) {
            console.error('Failed to connect:', error);
        }
    };

    /**
     * Send message to server
     */
    const sendMessage = (type, data) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, data }));
        } else {
            console.warn('WebSocket not connected, cannot send message');
        }
    };

    /**
     * Subscribe to messages
     */
    const onMessage = (handler) => {
        messageHandlersRef.current.add(handler);

        // Return unsubscribe function
        return () => {
            messageHandlersRef.current.delete(handler);
        };
    };

    // Connect on mount
    useEffect(() => {
        connect();

        return () => {
            // Cleanup on unmount
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [roomId]);

    const value = {
        isConnected,
        users,
        sendMessage,
        onMessage,
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
}
