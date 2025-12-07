'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { nanoid } from 'nanoid';

export default function HomePage() {
    const router = useRouter();
    const [joinRoomId, setJoinRoomId] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const createRoom = async () => {
        setIsCreating(true);
        try {
            const roomId = nanoid(10);
            router.push(`/room/${roomId}`);
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Failed to create room. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const joinRoom = () => {
        if (joinRoomId.trim()) {
            router.push(`/room/${joinRoomId.trim()}`);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                {/* Hero Section */}
                <div style={styles.hero} className="fade-in">
                    <h1 style={styles.title}>
                        <span style={styles.titleGradient}>Code Interview</span>
                        <br />
                        Platform
                    </h1>
                    <p style={styles.subtitle}>
                        Real-time collaborative coding interviews with instant code execution
                    </p>
                    <div style={styles.features}>
                        <div style={styles.feature}>
                            <span style={styles.featureIcon}>⚡</span>
                            <span>Real-time Collaboration</span>
                        </div>
                        <div style={styles.feature}>
                            <span style={styles.featureIcon}>🔒</span>
                            <span>Safe Sandboxed Execution</span>
                        </div>
                        <div style={styles.feature}>
                            <span style={styles.featureIcon}>🌐</span>
                            <span>Multi-Language Support</span>
                        </div>
                    </div>
                </div>

                {/* Action Cards */}
                <div style={styles.actionsContainer}>
                    <div style={styles.actionCard} className="card fade-in">
                        <h2 style={styles.cardTitle}>Start New Interview</h2>
                        <p style={styles.cardDescription}>
                            Create a new collaborative coding session and share the link with candidates
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={createRoom}
                            disabled={isCreating}
                            style={styles.actionButton}
                        >
                            {isCreating ? '🔄 Creating...' : '✨ Create Interview Room'}
                        </button>
                    </div>

                    <div style={styles.divider}>
                        <span style={styles.dividerText}>OR</span>
                    </div>

                    <div style={styles.actionCard} className="card fade-in">
                        <h2 style={styles.cardTitle}>Join Interview</h2>
                        <p style={styles.cardDescription}>
                            Enter the room ID shared with you to join an existing session
                        </p>
                        <div style={styles.joinForm}>
                            <input
                                type="text"
                                className="input"
                                placeholder="Enter room ID"
                                value={joinRoomId}
                                onChange={(e) => setJoinRoomId(e.target.value)}
                                onKeyPress={handleKeyPress}
                                style={styles.joinInput}
                            />
                            <button
                                className="btn btn-secondary"
                                onClick={joinRoom}
                                disabled={!joinRoomId.trim()}
                            >
                                Join Room →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer style={styles.footer}>
                    <p className="text-muted">
                        Built with Next.js, CodeMirror, and WebSocket for seamless real-time collaboration
                    </p>
                </footer>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        zIndex: 1,
    },
    content: {
        maxWidth: '800px',
        width: '100%',
    },
    hero: {
        textAlign: 'center',
        marginBottom: '3rem',
    },
    title: {
        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
        fontWeight: 800,
        marginBottom: '1rem',
        lineHeight: 1.2,
    },
    titleGradient: {
        background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    subtitle: {
        fontSize: '1.25rem',
        color: 'var(--text-secondary)',
        marginBottom: '2rem',
    },
    features: {
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        flexWrap: 'wrap',
        marginTop: '2rem',
    },
    feature: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-secondary)',
        fontSize: '0.95rem',
    },
    featureIcon: {
        fontSize: '1.25rem',
    },
    actionsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    actionCard: {
        animationDelay: '0.1s',
    },
    cardTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
        color: 'var(--text-primary)',
    },
    cardDescription: {
        color: 'var(--text-secondary)',
        marginBottom: '1.5rem',
        lineHeight: 1.6,
    },
    actionButton: {
        width: '100%',
        justifyContent: 'center',
    },
    divider: {
        position: 'relative',
        textAlign: 'center',
        margin: '0.5rem 0',
    },
    dividerText: {
        background: 'var(--bg-primary)',
        padding: '0 1rem',
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
        fontWeight: 600,
        position: 'relative',
        zIndex: 1,
    },
    joinForm: {
        display: 'flex',
        gap: '1rem',
    },
    joinInput: {
        flex: 1,
    },
    footer: {
        marginTop: '3rem',
        textAlign: 'center',
    },
};
