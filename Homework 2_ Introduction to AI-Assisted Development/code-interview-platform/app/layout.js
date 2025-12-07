import './globals.css';

export const metadata = {
    title: 'Code Interview Platform',
    description: 'Real-time collaborative coding interviews',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
