import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { useNetwork } from '../../hooks/useNetwork';
import { getNetworkName, getDefaultMaxGasSats, getMaxGasSats, getFeeRateOverride } from '../../config/networks';
import { formatAddress } from '../../config/tokens';
import { GasSettings } from '../common/GasSettings';

export function Header(): React.JSX.Element {
    const { walletAddress, openConnectModal, disconnect } = useWalletConnect();
    const { network } = useNetwork();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [gasOpen, setGasOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);
    const closeMobile = useCallback(() => setMobileOpen(false), []);
    const toggleDropdown = useCallback(() => setDropdownOpen((prev) => !prev), []);
    const closeDropdown = useCallback(() => setDropdownOpen(false), []);

    // Close dropdown on click outside
    useEffect(() => {
        if (!dropdownOpen) return;
        const handleClick = (e: MouseEvent): void => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [dropdownOpen]);

    const isActive = (path: string): boolean => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        if (path === '/create') {
            return location.pathname === '/create' || location.pathname.startsWith('/create/');
        }
        return location.pathname === path;
    };

    const navLinkClass = (path: string): string =>
        `transition-colors ${isActive(path) ? 'text-[var(--accent-gold)] font-semibold' : 'text-[var(--ink-medium)] hover:text-[var(--accent-gold)]'}`;

    return (
        <header className="border-b border-[var(--border-paper)] bg-[var(--paper-card)] sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5" onClick={closeMobile}>
                    <svg className="w-8 h-8 shrink-0" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="64" height="64" rx="12" fill="var(--paper-card)" />
                        <rect x="4" y="4" width="56" height="56" rx="8" fill="none" stroke="var(--accent-gold)" strokeWidth="2.5" />
                        <path d="M18 18h28M18 28h28M18 38h20M18 48h14" stroke="var(--ink-dark)" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="46" cy="46" r="12" fill="var(--accent-gold)" />
                        <path d="M42 46l3 3 6-6" stroke="var(--paper-card)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-2xl font-bold font-serif text-[var(--accent-gold)]">BlockBill</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link to="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>

                    {/* Create Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button type="button" onClick={toggleDropdown}
                            className={`flex items-center gap-1 transition-colors ${
                                isActive('/create')
                                    ? 'text-[var(--accent-gold)] font-semibold'
                                    : 'text-[var(--ink-medium)] hover:text-[var(--accent-gold)]'
                            }`}>
                            Create
                            <svg className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                                viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {dropdownOpen && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-[var(--paper-card)] border border-[var(--border-paper)] rounded-lg shadow-lg py-1 z-50">
                                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--paper-card)] border-l border-t border-[var(--border-paper)] rotate-45" />
                                <Link to="/create" onClick={closeDropdown}
                                    className="relative flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--ink-medium)] hover:bg-[var(--accent-gold)]/5 hover:text-[var(--accent-gold)] transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                    </svg>
                                    New Invoice
                                </Link>
                                <Link to="/create/stream" onClick={closeDropdown}
                                    className="relative flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--ink-medium)] hover:bg-[var(--accent-gold)]/5 hover:text-[var(--accent-gold)] transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                                    </svg>
                                    New Stream
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link to="/guide" className={navLinkClass('/guide')}>Guide</Link>
                </nav>

                {/* Desktop Wallet + Gas Settings */}
                <div className="hidden md:flex items-center gap-2">
                    {/* Gas Settings Gear */}
                    <button
                        type="button"
                        onClick={() => setGasOpen(true)}
                        className="relative p-2 rounded-lg text-[var(--ink-light)] hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/5 transition-colors"
                        aria-label="Gas settings"
                        title="Gas settings"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        {/* Dot indicator when gas is overridden */}
                        {(getMaxGasSats(network) !== getDefaultMaxGasSats(network) || getFeeRateOverride(network) !== undefined) && (
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--accent-gold)]" />
                        )}
                    </button>

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
                    <Link to="/dashboard" onClick={closeMobile}
                        className={`py-3 px-3 rounded-lg text-sm font-medium ${isActive('/dashboard') ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]' : 'text-[var(--ink-medium)]'}`}>
                        Dashboard
                    </Link>
                    <Link to="/create" onClick={closeMobile}
                        className={`py-3 px-3 rounded-lg text-sm font-medium ${location.pathname === '/create' ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]' : 'text-[var(--ink-medium)]'}`}>
                        New Invoice
                    </Link>
                    <Link to="/create/stream" onClick={closeMobile}
                        className={`py-3 px-3 rounded-lg text-sm font-medium ${location.pathname === '/create/stream' ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]' : 'text-[var(--ink-medium)]'}`}>
                        New Stream
                    </Link>
                    <Link to="/guide" onClick={closeMobile}
                        className={`py-3 px-3 rounded-lg text-sm font-medium ${isActive('/guide') ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]' : 'text-[var(--ink-medium)]'}`}>
                        Guide
                    </Link>
                    <button type="button" onClick={() => { setGasOpen(true); closeMobile(); }}
                        className="py-3 px-3 rounded-lg text-sm font-medium text-[var(--ink-medium)] flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        Gas Settings
                        {getMaxGasSats(network) !== getDefaultMaxGasSats(network) || getFeeRateOverride(network) !== undefined && (
                            <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)]" />
                        )}
                    </button>
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
            {/* Gas Settings Modal */}
            <GasSettings network={network} open={gasOpen} onClose={() => setGasOpen(false)} />
        </header>
    );
}
