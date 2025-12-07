import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock WebSocket
global.WebSocket = class WebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = 0;
        this.CONNECTING = 0;
        this.OPEN = 1;
        this.CLOSING = 2;
        this.CLOSED = 3;

        setTimeout(() => {
            this.readyState = 1;
            if (this.onopen) this.onopen();
        }, 0);
    }

    send(data) {
        if (this.onmessage) {
            // Echo back for testing
            setTimeout(() => {
                this.onmessage({ data });
            }, 0);
        }
    }

    close() {
        this.readyState = 3;
        if (this.onclose) this.onclose();
    }
};

// Mock navigator.clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: (text) => Promise.resolve(text),
        readText: () => Promise.resolve(''),
    },
});

// Mock window.location
delete window.location;
window.location = {
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000',
    pathname: '/',
};
