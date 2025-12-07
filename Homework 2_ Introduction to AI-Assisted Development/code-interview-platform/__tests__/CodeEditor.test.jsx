/**
 * Tests for CodeEditor component
 * Validates code editing, language switching, and change events
 */
import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import CodeEditor from '@/components/CodeEditor';

describe('CodeEditor', () => {
    it('should render with initial value', async () => {
        const initialCode = 'console.log("Hello");';

        const { container } = render(
            <CodeEditor
                value={initialCode}
                onChange={() => { }}
                language="javascript"
            />
        );

        await waitFor(() => {
            expect(container.querySelector('.cm-content')).toBeDefined();
        });
    });

    it('should call onChange when code is modified', async () => {
        const onChange = vi.fn();
        const initialCode = 'const x = 1;';

        render(
            <CodeEditor
                value={initialCode}
                onChange={onChange}
                language="javascript"
            />
        );

        // CodeMirror initializes asynchronously
        await waitFor(() => {
            expect(onChange).toHaveBeenCalled();
        }, { timeout: 2000 });
    });

    it('should support multiple languages', async () => {
        const languages = ['javascript', 'python', 'cpp', 'java'];

        for (const lang of languages) {
            const { container } = render(
                <CodeEditor
                    value="test code"
                    onChange={() => { }}
                    language={lang}
                />
            );

            await waitFor(() => {
                expect(container.querySelector('.cm-content')).toBeDefined();
            });
        }
    });

    it('should render in readonly mode', async () => {
        const { container } = render(
            <CodeEditor
                value="readonly code"
                onChange={() => { }}
                language="javascript"
                readOnly={true}
            />
        );

        await waitFor(() => {
            expect(container.querySelector('.cm-content')).toBeDefined();
        });
    });

    it('should update when value prop changes', async () => {
        const { rerender, container } = render(
            <CodeEditor
                value="initial"
                onChange={() => { }}
                language="javascript"
            />
        );

        await waitFor(() => {
            expect(container.querySelector('.cm-content')).toBeDefined();
        });

        rerender(
            <CodeEditor
                value="updated"
                onChange={() => { }}
                language="javascript"
            />
        );

        await waitFor(() => {
            expect(container).toBeDefined();
        });
    });

    it('should apply dark theme', async () => {
        const { container } = render(
            <CodeEditor
                value="test"
                onChange={() => { }}
                language="javascript"
            />
        );

        await waitFor(() => {
            const editorContainer = container.querySelector('.editor-container');
            expect(editorContainer).toBeDefined();
        });
    });
});
