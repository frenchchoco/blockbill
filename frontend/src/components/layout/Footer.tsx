export function Footer(): React.JSX.Element {
    return (
        <footer className="border-t border-[var(--border-paper)] py-6 mt-auto">
            <div className="max-w-6xl mx-auto px-4 text-center text-sm text-[var(--ink-light)]">
                <p>
                    Powered by{' '}
                    <a href="https://opnet.org" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-gold)] hover:underline">
                        OPNet
                    </a>
                    {' '}&mdash; Trustless invoicing on Bitcoin L1
                </p>
            </div>
        </footer>
    );
}
