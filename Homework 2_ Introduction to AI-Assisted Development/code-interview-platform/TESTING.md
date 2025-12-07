# Testing Guide

## Overview

This document provides comprehensive information about the test suite for the Code Interview Platform.

## Test Structure

```
code-interview-platform/
├── backend/
│   ├── __tests__/
│   │   ├── RoomManager.test.js           # Unit tests for room management
│   │   └── websocket.integration.test.js # WebSocket integration tests
│   └── jest.config.js
└── __tests__/
    ├── CodeEditor.test.jsx               # CodeEditor component tests
    ├── WebSocketProvider.test.jsx        # WebSocket provider tests
    └── codeRunner.test.js                # Code execution tests
```

## Running Tests

### Backend Tests

```bash
# Run all backend tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Tests

```bash
# Run all frontend tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npx vitest --ui
```

### Run All Tests

```bash
# From project root, run both frontend and backend tests
npm test && cd backend && npm test
```

## Test Coverage

### Backend Coverage
- **RoomManager**: 100% coverage
  - Room creation and deletion
  - User management
  - Message broadcasting
  - State persistence
  - Cleanup operations

- **WebSocket Integration**: Full flow coverage
  - Connection handling
  - Message broadcasting
  - State synchronization
  - Error handling

### Frontend Coverage
- **Components**: CodeEditor, WebSocketProvider
- **Code Execution**: JavaScript and Python sandboxes
- **Integration**: Full WebSocket communication flow

## Coverage Thresholds

Both backend and frontend maintain minimum coverage thresholds:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Writing New Tests

### Backend Test Example

```javascript
import { RoomManager } from '../RoomManager.js';

describe('Feature Name', () => {
  let roomManager;

  beforeEach(() => {
    roomManager = new RoomManager();
  });

  test('should do something', () => {
    // Arrange
    const roomId = 'test-room';
    
    // Act
    const room = roomManager.createRoom(roomId);
    
    // Assert
    expect(room.id).toBe(roomId);
  });
});
```

### Frontend Test Example

```javascript
import { render, waitFor } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', async () => {
    const { getByText } = render(<MyComponent />);
    
    await waitFor(() => {
      expect(getByText('Hello')).toBeDefined();
    });
  });
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          cd backend && npm install
      
      - name: Run frontend tests
        run: npm test
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Utilities

### Mock WebSocket

```javascript
// Available in vitest.setup.js
global.WebSocket = class WebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 1; // OPEN
  }
  
  send(data) {
    // Mock implementation
  }
  
  close() {
    this.readyState = 3; // CLOSED
  }
};
```

### Testing Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Isolated Tests**: Each test should be independent
3. **Descriptive Names**: Test names should describe what they verify
4. **Clean Up**: Use `afterEach` to clean up resources
5. **Async Handling**: Use `async/await` and `waitFor` for async operations

## Debugging Tests

### Run Specific Test

```bash
# Backend
npm test -- RoomManager.test.js

# Frontend
npm test -- CodeEditor.test
```

### Debug Mode

```bash
# Frontend with UI
npx vitest --ui

# Backend with debugging
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Common Issues

1. **Timeout Errors**: Increase timeout for slow operations
   ```javascript
   test('slow test', async () => {
     // test code
   }, 10000); // 10 second timeout
   ```

2. **WebSocket Mocking**: Ensure WebSocket is properly mocked
3. **Cleanup**: Always clean up resources in `afterEach`

## Continuous Improvement

- Aim for 80%+ coverage
- Add tests for bug fixes
- Update tests when features change
- Review test failures immediately
