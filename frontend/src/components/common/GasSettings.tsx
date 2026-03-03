import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Network } from '@btc-vision/bitcoin';
import {
    getFeeRateOverride,
    setFeeRateOverride,
    clearFeeRateOverride,
    getDefaultMaxGasSats,
    getMaxGasSats,
    setMaxGasSatsOverride,
    clearMaxGasSatsOverride,
    fetchLiveFeeRates,
} from '../../config/networks';
import type { LiveFeeRates } from '../../config/networks';

interface GasSettingsProps {
    readonly network: Network;
    readonly open: boolean;
    readonly onClose: () => void;
}

interface FeePreset {
    readonly label: string;
    readonly key: 'low' | 'medium' | 'high';
    readonly fallback: number;
}

const FEE_PRESETS: FeePreset[] = [
    { label: 'Economy', key: 'low', fallback: 5 },
    { label: 'Standard', key: 'medium', fallback: 15 },
    { label: 'Priority', key: 'high', fallback: 60 },
];

function formatSats(sats: bigint): string {
    return Number(sats).toLocaleString('en-US');
}

function satsToBtc(sats: bigint): string {
    return (Number(sats) / 1e8).toFixed(8).replace(/0+$/, '').replace(/\.$/, '');
}

export function GasSettings({ network, open, onClose }: GasSettingsProps): React.JSX.Element | null {
    // Fee rate state
    const currentFeeRate = getFeeRateOverride(network);
    const [feeMode, setFeeMode] = useState<'auto' | 'preset' | 'custom'>('auto');
    const [feePresetIndex, setFeePresetIndex] = useState(1); // Standard
    const [customFeeRate, setCustomFeeRate] = useState('');
    const [feeRateError, setFeeRateError] = useState('');

    // Live fee rates from RPC
    const [liveRates, setLiveRates] = useState<LiveFeeRates | null>(null);
    const [ratesLoading, setRatesLoading] = useState(false);

    // Max gas budget state
    const defaultBudget = getDefaultMaxGasSats(network);
    const currentBudget = getMaxGasSats(network);
    const [budgetValue, setBudgetValue] = useState('');
    const [budgetError, setBudgetError] = useState('');

    const panelRef = useRef<HTMLDivElement>(null);

    // Fetch live fee rates when opening
    useEffect(() => {
        if (!open) return;
        setRatesLoading(true);
        fetchLiveFeeRates(network)
            .then((rates) => setLiveRates(rates))
            .catch(() => { /* keep stale */ })
            .finally(() => setRatesLoading(false));
    }, [open, network]);

    // Sync state when opening
    useEffect(() => {
        if (!open) return;

        // Fee rate
        if (currentFeeRate === undefined) {
            setFeeMode('auto');
            setCustomFeeRate('');
        } else {
            // Try to match against live rates first, then fallbacks
            const rates = liveRates;
            const matchIdx = rates
                ? FEE_PRESETS.findIndex((p) => rates[p.key] === currentFeeRate)
                : FEE_PRESETS.findIndex((p) => p.fallback === currentFeeRate);
            if (matchIdx >= 0) {
                setFeeMode('preset');
                setFeePresetIndex(matchIdx);
            } else {
                setFeeMode('custom');
                setCustomFeeRate(currentFeeRate.toString());
            }
        }
        setFeeRateError('');

        // Budget
        if (currentBudget === defaultBudget) {
            setBudgetValue('');
        } else {
            setBudgetValue(currentBudget.toString());
        }
        setBudgetError('');
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent): void => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open, onClose]);

    const getPresetRate = useCallback((idx: number): number => {
        const preset = FEE_PRESETS[idx];
        return liveRates ? liveRates[preset.key] : preset.fallback;
    }, [liveRates]);

    const getActiveFeeRate = useCallback((): number | null => {
        if (feeMode === 'auto') return null; // means "let wallet decide"
        if (feeMode === 'preset') return getPresetRate(feePresetIndex);
        const v = Number(customFeeRate);
        if (!Number.isFinite(v) || v < 1 || v > 2000) return null;
        return v;
    }, [feeMode, feePresetIndex, customFeeRate, getPresetRate]);

    const handleCustomFeeChange = useCallback((raw: string) => {
        const cleaned = raw.replace(/[^0-9.]/g, '');
        setCustomFeeRate(cleaned);
        setFeeMode('custom');
        if (!cleaned) { setFeeRateError(''); return; }
        const v = Number(cleaned);
        if (!Number.isFinite(v) || v < 1) setFeeRateError('Minimum: 1 sat/vB');
        else if (v > 2000) setFeeRateError('Maximum: 2,000 sat/vB');
        else setFeeRateError('');
    }, []);

    const handleBudgetChange = useCallback((raw: string) => {
        const cleaned = raw.replace(/[^0-9]/g, '');
        setBudgetValue(cleaned);
        if (!cleaned) { setBudgetError(''); return; }
        try {
            const v = BigInt(cleaned);
            if (v < 10_000n) setBudgetError('Min: 10,000 sats');
            else if (v > 10_000_000n) setBudgetError('Max: 10,000,000 sats');
            else setBudgetError('');
        } catch { setBudgetError('Invalid'); }
    }, []);

    const handleApply = useCallback(() => {
        // Fee rate
        if (feeMode === 'auto') {
            clearFeeRateOverride(network);
        } else {
            const rate = getActiveFeeRate();
            if (rate && rate >= 1) setFeeRateOverride(network, rate);
        }

        // Budget
        if (!budgetValue) {
            clearMaxGasSatsOverride(network);
        } else {
            try {
                const v = BigInt(budgetValue);
                if (v >= 10_000n && v <= 10_000_000n) {
                    if (v === defaultBudget) clearMaxGasSatsOverride(network);
                    else setMaxGasSatsOverride(network, v);
                }
            } catch { /* keep current */ }
        }

        onClose();
    }, [feeMode, getActiveFeeRate, budgetValue, defaultBudget, network, onClose]);

    const handleReset = useCallback(() => {
        clearFeeRateOverride(network);
        clearMaxGasSatsOverride(network);
        setFeeMode('auto');
        setCustomFeeRate('');
        setFeeRateError('');
        setBudgetValue('');
        setBudgetError('');
    }, [network]);

    if (!open) return null;

    const isModified = currentFeeRate !== undefined || currentBudget !== defaultBudget;
    const hasError = !!feeRateError || !!budgetError;
    const activeFeeRate = feeMode === 'auto' ? null : (feeMode === 'preset' ? getPresetRate(feePresetIndex) : Number(customFeeRate) || null);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#1a1410]/50 backdrop-blur-[4px] animate-[gasFadeIn_0.2s_ease-out]" />

            {/* Panel */}
            <div
                ref={panelRef}
                className="relative w-[380px] max-w-[92vw] max-h-[90vh] overflow-y-auto bg-[var(--paper-card)] border border-[var(--border-paper)] rounded-xl shadow-[0_20px_60px_rgba(62,39,35,0.2)] animate-[gasSlideIn_0.25s_ease-out]"
            >
                {/* Paper texture */}
                <div
                    className="absolute inset-0 opacity-[0.03] rounded-xl pointer-events-none"
                    style={{
                        backgroundImage:
                            'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                    }}
                />

                <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-serif text-[var(--ink-dark)] flex items-center gap-2">
                            <svg className="w-4 h-4 text-[var(--accent-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            Transaction Settings
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-[var(--ink-light)] hover:text-[var(--ink-dark)] transition-colors p-1 -m-1"
                            aria-label="Close"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* ── Fee Rate Section ── */}
                    <div className="mb-5">
                        <label className="block text-sm font-serif font-medium text-[var(--ink-dark)] mb-1.5">
                            Fee Rate
                        </label>
                        <p className="text-xs text-[var(--ink-light)] mb-3 leading-relaxed">
                            Higher fee rate = faster confirmation. Increase during fee spikes.
                        </p>

                        {/* Auto */}
                        <button
                            type="button"
                            onClick={() => setFeeMode('auto')}
                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm transition-all mb-2 ${
                                feeMode === 'auto'
                                    ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/8 text-[var(--ink-dark)]'
                                    : 'border-[var(--border-paper)] bg-[var(--paper-bg)]/50 text-[var(--ink-medium)] hover:border-[var(--accent-gold)]/40'
                            }`}
                        >
                            <span className="flex items-center gap-2.5">
                                <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    feeMode === 'auto' ? 'border-[var(--accent-gold)]' : 'border-[var(--ink-light)]/40'
                                }`}>
                                    {feeMode === 'auto' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />}
                                </span>
                                <span className="font-medium">Auto</span>
                                <span className="text-[9px] uppercase tracking-wider text-[var(--accent-gold)] bg-[var(--accent-gold)]/10 px-1.5 py-0.5 rounded">
                                    default
                                </span>
                            </span>
                            <span className="text-xs text-[var(--ink-light)]">Wallet decides</span>
                        </button>

                        {/* Live indicator */}
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${ratesLoading ? 'bg-[var(--accent-gold)] animate-pulse' : liveRates ? 'bg-emerald-500' : 'bg-[var(--ink-light)]'}`} />
                            <span className="text-[10px] text-[var(--ink-light)] uppercase tracking-wider">
                                {ratesLoading ? 'Fetching rates...' : liveRates ? 'Live from network' : 'Using defaults'}
                            </span>
                        </div>

                        {/* Fee presets */}
                        <div className="grid grid-cols-3 gap-1.5 mb-2">
                            {FEE_PRESETS.map((preset, idx) => {
                                const isActive = feeMode === 'preset' && feePresetIndex === idx;
                                const rate = getPresetRate(idx);
                                return (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        onClick={() => { setFeeMode('preset'); setFeePresetIndex(idx); }}
                                        className={`flex flex-col items-center px-2 py-2 rounded-lg border text-xs transition-all ${
                                            isActive
                                                ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/8 text-[var(--ink-dark)]'
                                                : 'border-[var(--border-paper)] bg-[var(--paper-bg)]/50 text-[var(--ink-medium)] hover:border-[var(--accent-gold)]/40'
                                        }`}
                                    >
                                        <span className="font-medium text-[11px]">{preset.label}</span>
                                        <span className="font-mono text-[var(--accent-gold)] font-semibold">{rate}</span>
                                        <span className="text-[9px] text-[var(--ink-light)]">sat/vB</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom fee rate */}
                        <div className={`px-3 py-2.5 rounded-lg border transition-all ${
                            feeMode === 'custom'
                                ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/8'
                                : 'border-[var(--border-paper)] bg-[var(--paper-bg)]/50'
                        }`}>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setFeeMode('custom')} className="flex items-center gap-2">
                                    <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        feeMode === 'custom' ? 'border-[var(--accent-gold)]' : 'border-[var(--ink-light)]/40'
                                    }`}>
                                        {feeMode === 'custom' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />}
                                    </span>
                                    <span className={`text-sm font-medium ${feeMode === 'custom' ? 'text-[var(--ink-dark)]' : 'text-[var(--ink-medium)]'}`}>
                                        Custom
                                    </span>
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={customFeeRate}
                                        onChange={(e) => handleCustomFeeChange(e.target.value)}
                                        onFocus={() => setFeeMode('custom')}
                                        placeholder="e.g. 25"
                                        className="w-full bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded-md px-3 py-1 text-sm text-[var(--ink-dark)] font-mono placeholder:text-[var(--ink-light)]/40 focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--ink-light)]">
                                        sat/vB
                                    </span>
                                </div>
                            </div>
                            {feeRateError && (
                                <p className="text-[11px] text-[var(--stamp-red)] mt-1 ml-6">{feeRateError}</p>
                            )}
                        </div>

                        {activeFeeRate && activeFeeRate > 0 && (
                            <p className="text-xs text-[var(--ink-light)] mt-2 text-center font-mono">
                                {activeFeeRate} sat/vB
                            </p>
                        )}
                    </div>

                    {/* ── Max Gas Budget Section ── */}
                    <div className="pt-4 border-t border-[var(--border-paper)]">
                        <label className="block text-sm font-serif font-medium text-[var(--ink-dark)] mb-1.5">
                            Max Gas Budget
                        </label>
                        <p className="text-xs text-[var(--ink-light)] mb-2 leading-relaxed">
                            Maximum total sats the wallet may spend on gas per transaction.
                        </p>
                        <div className="relative">
                            <input
                                type="text"
                                inputMode="numeric"
                                value={budgetValue}
                                onChange={(e) => handleBudgetChange(e.target.value)}
                                placeholder={`Default: ${formatSats(defaultBudget)}`}
                                className="w-full bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded-lg px-4 py-2.5 text-sm text-[var(--ink-dark)] font-mono placeholder:text-[var(--ink-light)]/40 focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[var(--ink-light)]">
                                sats
                            </span>
                        </div>
                        {budgetError && (
                            <p className="text-[11px] text-[var(--stamp-red)] mt-1">{budgetError}</p>
                        )}
                        {budgetValue && !budgetError && (
                            <p className="text-xs text-[var(--ink-light)] mt-1 font-mono">
                                &asymp; {satsToBtc(BigInt(budgetValue))} BTC
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-5">
                        {isModified && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-xs text-[var(--ink-light)] hover:text-[var(--stamp-red)] transition-colors"
                            >
                                Reset all
                            </button>
                        )}
                        <div className="flex-1" />
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-[var(--ink-medium)] hover:text-[var(--ink-dark)] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleApply}
                            disabled={hasError}
                            className="px-5 py-2 text-sm font-medium bg-[var(--accent-gold)] text-white rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Apply
                        </button>
                    </div>
                </div>

                <style>{`
                    @keyframes gasFadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes gasSlideIn {
                        from { opacity: 0; transform: translateY(8px) scale(0.97); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                `}</style>
            </div>
        </div>,
        document.body,
    );
}
