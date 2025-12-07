/**
 * Code Execution Library
 * Safely runs JavaScript and Python code in the browser using sandboxed environments
 */

let quickJSInstance = null;
let pyodideInstance = null;

/**
 * Initialize QuickJS for JavaScript execution
 */
async function initQuickJS() {
    if (quickJSInstance) return quickJSInstance;

    try {
        const { getQuickJS } = await import('quickjs-emscripten');
        quickJSInstance = await getQuickJS();
        console.log('✓ QuickJS initialized');
        return quickJSInstance;
    } catch (error) {
        console.error('Failed to initialize QuickJS:', error);
        throw new Error('JavaScript execution not available');
    }
}

/**
 * Initialize Pyodide for Python execution (fallback to message if not available)
 */
async function initPyodide() {
    if (pyodideInstance) return pyodideInstance;

    try {
        // Note: Pyodide needs to be loaded from CDN
        if (typeof window !== 'undefined' && !window.loadPyodide) {
            // Load Pyodide script dynamically
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        pyodideInstance = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
        });
        console.log('✓ Pyodide initialized');
        return pyodideInstance;
    } catch (error) {
        console.error('Failed to initialize Pyodide:', error);
        return null;
    }
}

/**
 * Execute JavaScript code using QuickJS sandbox
 */
async function runJavaScript(code) {
    const quickJS = await initQuickJS();
    const vm = quickJS.newContext();

    let output = [];

    try {
        // Create a console.log implementation
        const logHandle = vm.newFunction('log', (...args) => {
            const nativeArgs = args.map(arg => vm.dump(arg));
            output.push(nativeArgs.join(' '));
        });

        const consoleHandle = vm.newObject();
        vm.setProp(consoleHandle, 'log', logHandle);
        vm.setProp(vm.global, 'console', consoleHandle);

        logHandle.dispose();
        consoleHandle.dispose();

        // Execute the code
        const result = vm.evalCode(code);

        if (result.error) {
            const error = vm.dump(result.error);
            result.error.dispose();
            throw new Error(error);
        }

        const value = vm.dump(result.value);
        result.value.dispose();

        // Add return value if it's not undefined
        if (value !== undefined && value !== null) {
            output.push(`→ ${JSON.stringify(value)}`);
        }

        return {
            success: true,
            output: output.join('\n') || '(no output)',
        };
    } catch (error) {
        return {
            success: false,
            output: `Error: ${error.message}`,
        };
    } finally {
        vm.dispose();
    }
}

/**
 * Execute Python code using Pyodide
 */
async function runPython(code) {
    try {
        const pyodide = await initPyodide();

        if (!pyodide) {
            return {
                success: false,
                output: 'Python execution is not available. Pyodide failed to load.',
            };
        }

        // Capture stdout
        let output = [];

        pyodide.setStdout({
            batched: (text) => {
                output.push(text);
            },
        });

        // Run the code
        await pyodide.runPythonAsync(code);

        return {
            success: true,
            output: output.join('') || '(no output)',
        };
    } catch (error) {
        return {
            success: false,
            output: `Error: ${error.message}`,
        };
    }
}

/**
 * Simulated execution for C++ and Java (client-side compilation not practical)
 */
function runSimulated(language, code) {
    return {
        success: false,
        output: `${language} execution requires a server-side compiler.\n\nFor this demo, only JavaScript and Python can run in the browser.\n\nYour code:\n${code}`,
    };
}

/**
 * Main execution function - routes to appropriate runner
 */
export async function executeCode(code, language) {
    if (!code.trim()) {
        return {
            success: false,
            output: 'No code to execute',
        };
    }

    try {
        switch (language.toLowerCase()) {
            case 'javascript':
                return await runJavaScript(code);

            case 'python':
                return await runPython(code);

            case 'cpp':
            case 'c++':
                return runSimulated('C++', code);

            case 'java':
                return runSimulated('Java', code);

            default:
                return {
                    success: false,
                    output: `Unsupported language: ${language}`,
                };
        }
    } catch (error) {
        return {
            success: false,
            output: `Execution error: ${error.message}`,
        };
    }
}

/**
 * Pre-initialize execution engines on page load
 */
export async function warmupExecutionEngines() {
    try {
        // Initialize QuickJS immediately
        await initQuickJS();

        // Initialize Pyodide in background (it's large)
        initPyodide().catch(err => {
            console.warn('Pyodide initialization failed:', err);
        });
    } catch (error) {
        console.error('Failed to warmup execution engines:', error);
    }
}
