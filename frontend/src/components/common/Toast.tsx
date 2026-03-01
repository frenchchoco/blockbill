import { Toaster } from 'react-hot-toast';

export function ToastProvider(): React.JSX.Element {
    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'var(--paper-card)',
                    color: 'var(--ink-dark)',
                    border: '1px solid var(--border-paper)',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '0.875rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px var(--shadow-paper)',
                },
                success: {
                    iconTheme: {
                        primary: 'var(--stamp-green)',
                        secondary: 'white',
                    },
                },
                error: {
                    iconTheme: {
                        primary: 'var(--stamp-red)',
                        secondary: 'white',
                    },
                },
            }}
        />
    );
}
