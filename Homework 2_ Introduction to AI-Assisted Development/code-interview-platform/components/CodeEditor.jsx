'use client';

import { useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';

const languageExtensions = {
    javascript: [javascript()],
    python: [python()],
    cpp: [cpp()],
    java: [java()],
};

const theme = EditorView.theme({
    '&': {
        fontSize: '14px',
        backgroundColor: '#151b3d',
        height: '100%',
    },
    '.cm-content': {
        caretColor: '#6366f1',
        fontFamily: 'Monaco, Courier New, monospace',
        padding: '16px 0',
    },
    '.cm-cursor': {
        borderLeftColor: '#6366f1',
        borderLeftWidth: '2px',
    },
    '.cm-selectionBackground, ::selection': {
        backgroundColor: 'rgba(99, 102, 241, 0.3) !important',
    },
    '&.cm-focused .cm-selectionBackground, &.cm-focused ::selection': {
        backgroundColor: 'rgba(99, 102, 241, 0.3) !important',
    },
    '.cm-gutters': {
        backgroundColor: '#0a0e27',
        color: '#64748b',
        border: 'none',
        paddingRight: '8px',
    },
    '.cm-activeLineGutter': {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        color: '#818cf8',
    },
    '.cm-activeLine': {
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
    },
    '.cm-line': {
        padding: '0 16px',
    },
}, { dark: true });

export default function CodeEditor({ value, onChange, language = 'javascript', readOnly = false }) {
    const editorRef = useRef(null);

    const extensions = [
        ...(languageExtensions[language] || [javascript()]),
        theme,
        EditorView.lineWrapping,
        EditorState.tabSize.of(2),
    ];

    return (
        <div style={styles.container} className="editor-container">
            <CodeMirror
                value={value}
                height="500px"
                theme="dark"
                extensions={extensions}
                onChange={onChange}
                readOnly={readOnly}
                basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    highlightActiveLine: true,
                    foldGutter: true,
                    dropCursor: true,
                    allowMultipleSelections: true,
                    indentOnInput: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    highlightSelectionMatches: true,
                }}
            />
        </div>
    );
}

const styles = {
    container: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
};
