# Homework 2: End-to-End Application Development

In this homework, we'll build an end-to-end application with AI.

You can use any tool you want: ChatGPT, Claude, GitHub Copilot, Codex, Cursor, Antigravity, etc.

With chat-based applications you will need to copy code back-and-forth, so we recommend that you use an AI assistant in your IDE with agent mode.

We will implement a platform for online coding interviews.

The app should be able to do the following:

- Create a link and share it with candidates
- Allow everyone who connects to edit code in the code panel
- Show real-time updates to all connected users
- Support syntax highlighting for multiple languages
- Execute code safely in the browser

You can choose any technologies you want. For example:

- Frontend: React + Vite
- Backend: Express.js

We recommend using JavaScript for frontend, because with other technologies, some of the homework requirements may be difficult to implement.

But you can experiment with alternatives, such as Streamlit.

You don't need to know these technologies for doing this homework.


## Question 1: Initial Implementation

Ask AI to implement both frontend and backend - in one prompt.

Note: you can also follow the same path as in the videos and make it in 3 steps:

1. Frontend
2. OpenAPI specs
3. Backend

What's the initial prompt you gave to AI to start the implementation?

Copy and paste it in the homework form.

### Answer 1:

```
SYSTEM / PRIMARY TASK

You are an expert senior full-stack engineer (15+ years experience), specialized in realtime collaboration apps, WebSockets, CRDT/OT, sandboxed code execution, and modern JavaScript frameworks.
Generate production-ready code, with clean architecture, modular structure, proper separation of concerns, and detailed explanations when necessary.
Your task: Implement a complete online coding-interview platform.

REQUIREMENTS
1. Functionality

Implement a platform for online coding interviews with the following capabilities:

Core Features

Create a sharable interview session (unique URL / room ID).

Host shares the link with the candidate.

Anyone who joins can edit the code collaboratively.

All connected clients see updates in real time.

Built-in code editor with syntax highlighting, supporting multiple languages.

Code execution in the browser using a safe sandbox (e.g. WebContainers, Pyodide fallback, or isolated iframe).

Track connected users and show presence (optional but nice to have).

2. Frontend

Use JavaScript (no TypeScript unless needed), built with one of the following frameworks (choose the best one for minimal friction):

React + Vite or

Next.js App Router or

Vanilla JS + CodeMirror 6 editor

Frontend must include:

Real-Time Collaborative Editor

Implement using CodeMirror 6 or Monaco Editor.

Support syntax highlighting for JavaScript, Python, C++, Java.

Live updates synchronized via WebSocket / WebRTC.

UI Requirements

Clean, minimal, interview-style interface.

Share-link button that generates room URL.

Run Code button → displays output in console panel.

3. Backend

Use Node.js with Express (or Fastify).
Backend responsibilities:

Realtime Sync

Implement WebSocket server.

Broadcast all code changes to connected room members.

Room Management

Create rooms.

Manage user connections.

Persist code state in memory.

Safe Code Execution

Implement sandboxed execution (pick the most secure option):

Run JavaScript inside isolated VM2 sandbox or

Use WebContainers for in-browser execution or

Evaluate Python via Pyodide in browser
(Claude should pick the safest cross-platform solution.)

Backend must never execute arbitrary code on the server.

4. Deliverables

Your response must include:

(A) Directory structure (full project layout)
(B) Complete backend code
(C) Complete frontend code
(D) Instructions for:

Installing

Running locally

Deploying (Render / Vercel / Railway)

Environment variables

WebSocket handling

(E) Explanations where needed:

How collaborative sync works

How the sandbox works

How to extend languages

Your output MUST be complete and runnable as-is.

5. Coding Style

Production-grade

Modular

Clean, commented code

Small, testable components

Error handling everywhere

No pseudocode — only real implementation

BEGIN NOW

Create the full project implementation exactly as specified.
```

## Question 2: Integration Tests

Maybe at this point your application will already function. Maybe not. But it's always a good idea to cover it with tests.

We usually do it even before trying to run the application because it helps to resurface all the problems with implementation.

Ask AI to write integration tests that check that the interaction between client and server works.

Also it's a good idea to ask it to start creating a `README.md` file with all the commands for running and testing your application.

What's the terminal command you use for executing tests?

### Answer 2:

```
npm test
```

## Question 3: Running Both Client and Server

Now let's make it possible to run both client and server at the same time. Use `concurrently` for that.

What's the command you have in `package.json` for `npm dev` for running both?

### Answer 3:

```
npm run dev
```

## Question 4: Syntax Highlighting

Let's now add support for syntax highlighting for JavaScript and Python.

Which library did AI use for it?

### Answer 4:

```
CodeMirror 6
```

## Question 5: Code Execution

Now let's add code execution.

For security reasons, we don't want to execute code directly on the server. Instead, let's use WASM to execute the code only in the browser.

Which library did AI use for compiling Python to WASM?

### Answer 5:

```
Pyodide
```
