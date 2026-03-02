import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { useNetwork } from '../../hooks/useNetwork';
import { getNetworkName } from '../../config/networks';
import { formatAddress } from '../../config/tokens';

export function Header(): React.JSX.Element {
    const { walletAddress, openConnectModal, disconnect } = useWalletConnect();
    const { network } = useNetwork();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);
    const closeMobile = useCallback(() => setMobileOpen(false), []);

    const isActive = (path: string): boolean => location.pathname === path;

    const navLinkClass = (path: string): string =>
        `transition-colors ${isActive(path) ? 'text-[var(--accent-gold)] font-semibold' : 'text-[var(--ink-medium)] hover:text-[var(--accent-gold)]'}`;

    return (
        <header className="border-b border-[var(--border-paper)] bg-[var(--paper-card)] sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2" onClick={closeMobile}>
                    <span className="text-2xl font-bold font-serif text-[var(--accent-gold)]">BlockBill</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link to="/create" className={navLinkClass('/create')}>Create</Link>
                    <Link to="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>
                    <Link to="/guide" className={navLinkClass('/guide')}>Guide</Link>
                </nav>

                {/* Desktop Wallet */}
                <div className="hidden md:block">
                    {walletAddress ? (
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] bg-[var(--accent-gold)] text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-medium">
                                {getNetworkName(network)}
                            </span>
                            <span className="text-sm text-[var(--ink-medium)] font-mono">{formatAddress(walletAddress)}</span>
                            <button type="button" onClick={disconnect}
                                className="text-xs text-[var(--stamp-red)] hover:underline">
                                Disconnect
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] bg-[var(--ink-light)] text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-medium">
                                {getNetworkName(network)}
                            </span>
                            <button type="button" onClick={openConnectModal}
                                className="bg-[var(--accent-gold)] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[var(--accent-gold-light)] transition-colors shadow-sm">
                                Connect Wallet
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Hamburger */}
                <button type="button" onClick={toggleMobile}
                    className="md:hidden flex flex-col gap-1.5 p-2 -mr-2" aria-label="Toggle menu">
                    <span className={`block w-6 h-0.5 bg-[var(--ink-dark)] transition-transform origin-center ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-[var(--ink-dark)] transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-[var(--ink-dark)] transition-transform origin-center ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-80' : 'max-h-0'}`}>
                <nav className="flex flex-col gap-1 px-4 pb-4 pt-2 border-t border-[var(--border-paper)]">
                    <Link to="/create" onClick={closeMobile}
                        className={`py-3 px-3 rounded-lg text-sm font-medium ${isActive('/create') ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]' : 'text-[var(--ink-medium)]'}`}>
                        Create Invoice
                    </Link>
                    <Link to="/dashboard" onClick={closeMobile}
                        className={`py-3 px-3 rounded-lg text-sm font-medium ${isActive('/dashboard') ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]' : 'text-[var(--ink-medium)]'}`}>
                        Dashboard
                    </Link>
                    <Link to="/guide" onClick={closeMobile}
                        className={`py-3 px-3 rounded-lg text-sm font-medium ${isActive('/guide') ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]' : 'text-[var(--ink-medium)]'}`}>
                        Guide
                    </Link>
                    <div className="pt-3 mt-2 border-t border-[var(--border-paper)]">
                        {walletAddress ? (
                            <div className="flex items-center justify-between px-3">
                                <div>
                                    <span className="text-[10px] bg-[var(--accent-gold)] text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-medium">{getNetworkName(network)}</span>
                                    <span className="text-xs text-[var(--ink-medium)] font-mono ml-2">{formatAddress(walletAddress)}</span>
                                </div>
                                <button type="button" onClick={() => { disconnect(); closeMobile(); }}
                                    className="text-xs text-[var(--stamp-red)] hover:underline">
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => { openConnectModal(); closeMobile(); }}
                                className="w-full bg-[var(--accent-gold)] text-white py-3 rounded-lg text-sm font-medium hover:bg-[var(--accent-gold-light)] transition-colors">
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
