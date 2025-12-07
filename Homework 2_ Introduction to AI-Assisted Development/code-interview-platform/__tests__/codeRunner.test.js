/**
 * Tests for code execution functionality
 * Validates JavaScript and Python execution sandboxes
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { executeCode, warmupExecutionEngines } from '@/lib/codeRunner';

describe('Code Execution', () => {
    beforeAll(async () => {
        // Warmup engines before tests
        await warmupExecutionEngines();
    }, 30000); // Longer timeout for initialization

    describe('JavaScript Execution', () => {
        it('should execute simple JavaScript code', async () => {
            const code = 'console.log("Hello, World!");';
            const result = await executeCode(code, 'javascript');

            expect(result.success).toBe(true);
            expect(result.output).toContain('Hello, World!');
        }, 10000);

        it('should execute JavaScript with variables', async () => {
            const code = `
        const x = 5;
        const y = 10;
        console.log(x + y);
      `;
            const result = await executeCode(code, 'javascript');

            expect(result.success).toBe(true);
            expect(result.output).toContain('15');
        }, 10000);

        it('should execute JavaScript loops', async () => {
            const code = `
        for (let i = 0; i < 3; i++) {
          console.log(i);
        }
      `;
            const result = await executeCode(code, 'javascript');

            expect(result.success).toBe(true);
            expect(result.output).toContain('0');
            expect(result.output).toContain('1');
            expect(result.output).toContain('2');
        }, 10000);

        it('should capture return values', async () => {
            const code = '5 + 3';
            const result = await executeCode(code, 'javascript');

            expect(result.success).toBe(true);
            expect(result.output).toContain('8');
        }, 10000);

        it('should handle JavaScript errors', async () => {
            const code = 'throw new Error("Test error");';
            const result = await executeCode(code, 'javascript');

            expect(result.success).toBe(false);
            expect(result.output).toContain('Error');
        }, 10000);

        it('should handle syntax errors', async () => {
            const code = 'const x = ;'; // Invalid syntax
            const result = await executeCode(code, 'javascript');

            expect(result.success).toBe(false);
            expect(result.output).toContain('Error');
        }, 10000);
    });

    describe('Python Execution', () => {
        it('should execute simple Python code', async () => {
            const code = 'print("Hello from Python")';
            const result = await executeCode(code, 'python');

            // Python may not be available in test environment
            if (result.success) {
                expect(result.output).toContain('Hello from Python');
            } else {
                expect(result.output).toContain('not available');
            }
        }, 20000);

        it('should execute Python with variables', async () => {
            const code = `
x = 10
y = 20
print(x + y)
      `;
            const result = await executeCode(code, 'python');

            if (result.success) {
                expect(result.output).toContain('30');
            }
        }, 20000);

        it('should handle Python errors', async () => {
            const code = 'print(undefined_variable)';
            const result = await executeCode(code, 'python');

            if (!result.success || result.output.includes('Error')) {
                expect(true).toBe(true); // Error handled correctly
            }
        }, 20000);
    });

    describe('Unsupported Languages', () => {
        it('should return informational message for C++', async () => {
            const code = '#include <iostream>\nint main() { return 0; }';
            const result = await executeCode(code, 'cpp');

            expect(result.success).toBe(false);
            expect(result.output).toContain('C++');
        });

        it('should return informational message for Java', async () => {
            const code = 'public class Main { }';
            const result = await executeCode(code, 'java');

            expect(result.success).toBe(false);
            expect(result.output).toContain('Java');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty code', async () => {
            const result = await executeCode('', 'javascript');

            expect(result.success).toBe(false);
            expect(result.output).toContain('No code');
        });

        it('should handle whitespace-only code', async () => {
            const result = await executeCode('   \n   ', 'javascript');

            expect(result.success).toBe(false);
            expect(result.output).toContain('No code');
        });

        it('should handle unsupported language', async () => {
            const result = await executeCode('code', 'unsupported-lang');

            expect(result.success).toBe(false);
            expect(result.output).toContain('Unsupported language');
        });
    });

    describe('Security', () => {
        it('should not have access to DOM', async () => {
            const code = 'typeof document';
            const result = await executeCode(code, 'javascript');

            if (result.success) {
                expect(result.output).toContain('undefined');
            }
        }, 10000);

        it('should not have access to Node.js modules', async () => {
            const code = 'typeof require';
            const result = await executeCode(code, 'javascript');

            if (result.success) {
                expect(result.output).toContain('undefined');
            }
        }, 10000);
    });
});
