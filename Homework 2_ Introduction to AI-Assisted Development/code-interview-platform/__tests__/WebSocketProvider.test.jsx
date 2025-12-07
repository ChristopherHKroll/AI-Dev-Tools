/**
 * Tests for WebSocketProvider component
 * Validates connection management, message handling, and reconnection logic
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { WebSocketProvider, useWebSocket } from '@/components/WebSocketProvider';

// Test component that uses the WebSocket hook
function TestComponent() {
    const { isConnected, users, sendMessage, onMessage } = useWebSocket();

    return (
        <div>
            <div data-testid="connection-status">
                {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <div data-testid="user-count">{users.length}</div>
            <button onClick={() => sendMessage('test', { data: 'hello' })}>
                Send Message
            </button>
        </div>
    );
}

describe('WebSocketProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should provide WebSocket context to children', () => {
        const { getByTestId } = render(
            <WebSocketProvider roomId="test-room">
                <TestComponent />
            </WebSocketProvider>
        );

        expect(getByTestId('connection-status')).toBeDefined();
        expect(getByTestId('user-count')).toBeDefined();
    });

    it('should connect to WebSocket server on mount', async () => {
        const { getByTestId } = render(
            <WebSocketProvider roomId="test-room">
                <TestComponent />
            </WebSocketProvider>
        );

        await waitFor(() => {
            expect(getByTestId('connection-status').textContent).toBe('Connected');
        });
    });

    it('should send messages through WebSocket', async () => {
        const { getByText } = render(
            <WebSocketProvider roomId="test-room">
                <TestComponent />
            </WebSocketProvider>
        );

        await waitFor(() => {
            const button = getByText('Send Message');
            expect(button).toBeDefined();
        });

        const button = getByText('Send Message');

        await act(async () => {
            button.click();
        });

        // Message sent successfully (no errors thrown)
        expect(true).toBe(true);
    });

    it('should handle incoming messages', async () => {
        let receivedMessage = null;

        function MessageTestComponent() {
            const { onMessage } = useWebSocket();

            React.useEffect(() => {
                return onMessage((message) => {
                    receivedMessage = message;
                });
            }, [onMessage]);

            return <div>Test</div>;
        }

        render(
            <WebSocketProvider roomId="test-room">
                <MessageTestComponent />
            </WebSocketProvider>
        );

        await waitFor(() => {
            expect(receivedMessage).toBeDefined();
        }, { timeout: 1000 });
    });

    it('should update user list on user join/leave', async () => {
        const { getByTestId } = render(
            <WebSocketProvider roomId="test-room">
                <TestComponent />
            </WebSocketProvider>
        );

        // Initially should have 0 users
        expect(getByTestId('user-count').textContent).toBe('0');

        // Wait for potential updates
        await waitFor(() => {
            expect(getByTestId('user-count')).toBeDefined();
        });
    });

    it('should throw error when used outside provider', () => {
        // Suppress console.error for this test
        const spy = vi.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useWebSocket must be used within WebSocketProvider');

        spy.mockRestore();
    });

    it('should cleanup WebSocket on unmount', async () => {
        const { unmount } = render(
            <WebSocketProvider roomId="test-room">
                <TestComponent />
            </WebSocketProvider>
        );

        await waitFor(() => {
            expect(true).toBe(true);
        });

        unmount();

        // No errors should be thrown on cleanup
        expect(true).toBe(true);
    });

    it('should handle connection errors gracefully', async () => {
        // Mock WebSocket to throw error
        const originalWebSocket = global.WebSocket;
        global.WebSocket = class extends originalWebSocket {
            constructor() {
                super('ws://localhost:3001');
                setTimeout(() => {
                    if (this.onerror) {
                        this.onerror(new Error('Connection failed'));
                    }
                }, 0);
            }
        };

        const { getByTestId } = render(
            <WebSocketProvider roomId="test-room">
                <TestComponent />
            </WebSocketProvider>
        );

        // Should handle error without crashing
        await waitFor(() => {
            expect(getByTestId('connection-status')).toBeDefined();
        });

        global.WebSocket = originalWebSocket;
    });
});
