/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Enable WebAssembly support for QuickJS
    webpack: (config, { isServer }) => {
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
            layers: true,
        };

        // Handle WASM files
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'webassembly/async',
        });

        // Fix for node modules in client
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }

        return config;
    },

    // Environment variables available to browser
    env: {
        NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    },

    // In production, proxy API requests to backend server
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:3002/api/:path*',
            },
            {
                source: '/health',
                destination: 'http://localhost:3002/health',
            },
        ];
    },
};

module.exports = nextConfig;
