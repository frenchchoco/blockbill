import { Link } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';

export function Header(): React.JSX.Element {
    const { walletAddress, openConnectModal, disconnect } = useWalletConnect();

    const formatAddress = (addr: string): string => {
        if (addr.length <= 12) return addr;
        return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
    };

    return (
        <header className="border-b border-[var(--border-paper)] bg-[var(--paper-card)]">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-2xl font-bold font-serif text-[var(--accent-gold)]">
                        BlockBill
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--ink-medium)]">
                    <Link to="/create" className="hover:text-[var(--accent-gold)] transition-colors">
                        Create Invoice
                    </Link>
                    <Link to="/dashboard" className="hover:text-[var(--accent-gold)] transition-colors">
                        Dashboard
                    </Link>
                </nav>

                <div>
                    {walletAddress ? (
                        <div className="flex items-center gap-3">
                            <span className="text-xs bg-[var(--accent-gold)] text-white px-2 py-1 rounded">
                                Testnet
                            </span>
                            <span className="text-sm text-[var(--ink-medium)] font-mono">
                                {formatAddress(walletAddress)}
                            </span>
                            <button
                                onClick={disconnect}
                                className="text-sm text-[var(--stamp-red)] hover:underline"
                            >
                                Disconnect
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={openConnectModal}
                            className="bg-[var(--accent-gold)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--accent-gold-light)] transition-colors"
                        >
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
