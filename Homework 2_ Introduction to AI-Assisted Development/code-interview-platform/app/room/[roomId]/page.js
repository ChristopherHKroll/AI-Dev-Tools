'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { WebSocketProvider, useWebSocket } from '../../../components/WebSocketProvider';
import CodeEditor from '../../../components/CodeEditor';
import { executeCode, warmupExecutionEngines } from '../../../lib/codeRunner';

function RoomContent() {
    const { roomId } = useParams();
    const { isConnected, users, sendMessage, onMessage } = useWebSocket();

    const [code, setCode] = useState('// Welcome to the coding interview!\n// Start typing...\n');
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [showCopied, setShowCopied] = useState(false);
    const isLocalChangeRef = useRef(false);

    // Warmup execution engines on mount
    useEffect(() => {
        warmupExecutionEngines();
    }, []);

    // Subscribe to WebSocket messages
    useEffect(() => {
        const unsubscribe = onMessage((message) => {
            const { type, data } = message;

            switch (type) {
                case 'joined':
                    // Initial room state
                    setCode(data.code || code);
                    setLanguage(data.language || language);
                    break;

                case 'code-change':
                    // Another user changed the code
                    if (data.userId !== data.userId) {
                        isLocalChangeRef.current = false;
                        setCode(data.code);
                    }
                    break;

                case 'language-change':
                    setLanguage(data.language);
                    break;

                case 'user-joined':
                case 'user-left':
                    // Users are updated via context
                    break;

                default:
                    break;
            }
        });

        return unsubscribe;
    }, [onMessage]);

    // Handle code changes
    const handleCodeChange = (newCode) => {
        isLocalChangeRef.current = true;
        setCode(newCode);

        // Send to other users
        sendMessage('code-change', { code: newCode });
    };

    // Handle language change
    const handleLanguageChange = (newLanguage) => {
        setLanguage(newLanguage);
        sendMessage('language-change', { language: newLanguage });

        // Update code template
        const templates = {
            javascript: '// JavaScript code\nconsole.log("Hello, World!");\n',
            python: '# Python code\nprint("Hello, World!")\n',
            cpp: '// C++ code\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n',
            java: '// Java code\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
        };

        const newCode = templates[newLanguage] || templates.javascript;
        setCode(newCode);
        sendMessage('code-change', { code: newCode });
    };

    // Run code
    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('Running...\n');

        try {
            const result = await executeCode(code, language);
            setOutput(result.output);
        } catch (error) {
            setOutput(`Execution error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    // Copy share link
    const handleCopyLink = async () => {
        const shareUrl = `${window.location.origin}/room/${roomId}`;
        await navigator.clipboard.writeText(shareUrl);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <h1 style={styles.title}>Code Interview</h1>
                    <span style={styles.roomId}>Room: {roomId}</span>
                </div>

                <div style={styles.headerRight}>
                    {/* Connection Status */}
                    <div style={styles.statusContainer}>
                        <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                        <span style={styles.statusText}>
                            {isConnected ? 'Connected' : 'Connecting...'}
                        </span>
                    </div>

                    {/* User Count */}
                    <div style={styles.userCount}>
                        <span style={styles.userIcon}>👥</span>
                        <span>{users.length} online</span>
                    </div>

                    {/* Share Button */}
                    <button className="btn btn-secondary" onClick={handleCopyLink} style={styles.shareBtn}>
                        {showCopied ? '✓ Copied!' : '🔗 Share Link'}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* Left Panel - Editor */}
                <div style={styles.leftPanel}>
                    <div style={styles.editorHeader}>
                        <select
                            className="input"
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            style={styles.languageSelect}
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                        </select>

                        <button
                            className="btn btn-success"
                            onClick={handleRunCode}
                            disabled={isRunning}
                            style={styles.runBtn}
                        >
                            {isRunning ? '⏳ Running...' : '▶ Run Code'}
                        </button>
                    </div>

                    <CodeEditor
                        value={code}
                        onChange={handleCodeChange}
                        language={language}
                    />
                </div>

                {/* Right Panel - Output & Users */}
                <div style={styles.rightPanel}>
                    {/* Output Console */}
                    <div style={styles.outputSection}>
                        <h3 style={styles.sectionTitle}>Output</h3>
                        <div style={styles.outputConsole} className="card">
                            <pre className="console-output" style={styles.outputText}>
                                {output || 'Click "Run Code" to see output here...'}
                            </pre>
                        </div>
                    </div>

                    {/* Connected Users */}
                    <div style={styles.usersSection}>
                        <h3 style={styles.sectionTitle}>Connected Users</h3>
                        <div className="card" style={styles.usersList}>
                            {users.length === 0 ? (
                                <p className="text-muted">No users connected</p>
                            ) : (
                                users.map((user) => (
                                    <div key={user.id} style={styles.userItem}>
                                        <span style={styles.userAvatar}>👤</span>
                                        <span style={styles.userName}>{user.username}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RoomPage() {
    const { roomId } = useParams();

    return (
        <WebSocketProvider roomId={roomId}>
            <RoomContent />
        </WebSocketProvider>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        position: 'relative',
        zIndex: 1,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 700,
        background: 'var(--accent-gradient)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: 0,
    },
    roomId: {
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        padding: '0.25rem 0.75rem',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-sm)',
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
    },
    statusContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    statusText: {
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
    },
    userCount: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        padding: '0.5rem 1rem',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
    },
    userIcon: {
        fontSize: '1rem',
    },
    shareBtn: {
        fontSize: '0.875rem',
    },
    mainContent: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '1.5rem',
        padding: '1.5rem',
        overflow: 'hidden',
    },
    leftPanel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        minWidth: 0,
    },
    editorHeader: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
    },
    languageSelect: {
        flex: 1,
        maxWidth: '200px',
    },
    runBtn: {
        whiteSpace: 'nowrap',
    },
    rightPanel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        overflow: 'auto',
    },
    outputSection: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '300px',
    },
    sectionTitle: {
        fontSize: '1rem',
        fontWeight: 600,
        marginBottom: '0.75rem',
        color: 'var(--text-primary)',
    },
    outputConsole: {
        flex: 1,
        padding: '1rem',
        overflow: 'auto',
        minHeight: '200px',
    },
    outputText: {
        margin: 0,
        fontSize: '0.875rem',
        lineHeight: 1.6,
    },
    usersSection: {
        flex: '0 0 auto',
    },
    usersList: {
        padding: '1rem',
        maxHeight: '200px',
        overflow: 'auto',
    },
    userItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '0.5rem',
    },
    userAvatar: {
        fontSize: '1.25rem',
    },
    userName: {
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
    },
};
