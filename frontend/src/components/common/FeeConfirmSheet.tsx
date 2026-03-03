import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { LiveFeeRates } from '../../config/networks';

export interface FeeConfirmSheetProps {
    readonly open: boolean;
    readonly liveRates: LiveFeeRates | null;
    readonly loading: boolean;
    readonly defaultFeeRate: number;
    /** Optional minimum fee tier — tiers below this are disabled (UX guide). */
    readonly minTier?: 'low' | 'medium' | 'high';
    readonly onConfirm: (feeRate: number) => void;
    readonly onCancel: () => void;
}

interface Tier {
    readonly label: string;
    readonly key: 'low' | 'medium' | 'high';
    readonly description: string;
}

const TIERS: Tier[] = [
    { label: 'Economy', key: 'low', description: 'Slower' },
    { label: 'Standard', key: 'medium', description: 'Normal' },
    { label: 'Priority', key: 'high', description: 'Fast' },
];

const TIER_RANK: Record<string, number> = { low: 0, medium: 1, high: 2 };

export function FeeConfirmSheet({
    open, liveRates, loading, defaultFeeRate, minTier, onConfirm, onCancel,
}: FeeConfirmSheetProps): React.JSX.Element | null {
    const minRank = TIER_RANK[minTier ?? 'low'] ?? 0;
    const [selectedTier, setSelectedTier] = useState<'low' | 'medium' | 'high' | 'custom'>('medium');
    const [customValue, setCustomValue] = useState('');
    const [customError, setCustomError] = useState('');
    const panelRef = useRef<HTMLDivElement>(null);

    // Pre-select the tier closest to the user's default fee rate (respecting minTier)
    useEffect(() => {
        if (!open || !liveRates) return;
        const eligible = TIERS.filter((t) => (TIER_RANK[t.key] ?? 0) >= minRank);
        const diffs = eligible.map((t) => ({ key: t.key, diff: Math.abs(liveRates[t.key] - defaultFeeRate) }));
        diffs.sort((a, b) => a.diff - b.diff);
        setSelectedTier(diffs[0]?.key ?? 'medium');
        setCustomValue('');
        setCustomError('');
    }, [open, liveRates, defaultFeeRate, minRank]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent): void => { if (e.key === 'Escape') onCancel(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCancel]);

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent): void => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) onCancel();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open, onCancel]);

    // Compute the minimum custom rate from minTier (or 1 sat/vB default)
    const customFloor = minTier && liveRates ? liveRates[minTier] : 1;

    const handleCustomChange = useCallback((raw: string) => {
        const cleaned = raw.replace(/[^0-9.]/g, '');
        setCustomValue(cleaned);
        setSelectedTier('custom');
        if (!cleaned) { setCustomError(''); return; }
        const v = Number(cleaned);
        if (!Number.isFinite(v) || v < customFloor) setCustomError(`Min: ${customFloor} sat/vB`);
        else if (v > 2000) setCustomError('Max: 2,000 sat/vB');
        else setCustomError('');
    }, [customFloor]);

    const getSelectedRate = useCallback((): number | null => {
        if (selectedTier === 'custom') {
            const v = Number(customValue);
            if (!Number.isFinite(v) || v < customFloor || v > 2000) return null;
            return v;
        }
        if (!liveRates) return defaultFeeRate;
        return liveRates[selectedTier];
    }, [selectedTier, customValue, liveRates, defaultFeeRate, customFloor]);

    const handleConfirm = useCallback(() => {
        const rate = getSelectedRate();
        if (rate) onConfirm(rate);
    }, [getSelectedRate, onConfirm]);

    if (!open) return null;

    const hasError = !!customError;
    const confirmDisabled = hasError || getSelectedRate() === null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#1a1410]/50 backdrop-blur-[4px] animate-[fcsFadeIn_0.2s_ease-out]" />

            {/* Panel */}
            <div
                ref={panelRef}
                className="relative w-[360px] max-w-[92vw] bg-[var(--paper-card)] border border-[var(--border-paper)] rounded-xl shadow-[0_20px_60px_rgba(62,39,35,0.2)] animate-[fcsSlideIn_0.25s_ease-out]"
            >
                {/* Paper texture */}
                <div
                    className="absolute inset-0 opacity-[0.03] rounded-xl pointer-events-none"
                    style={{
                        backgroundImage:
                            'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                    }}
                />

                <div className="relative p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-serif text-[var(--ink-dark)] flex items-center gap-2">
                            <svg className="w-4 h-4 text-[var(--accent-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                            Choose Fee Rate
                        </h3>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="text-[var(--ink-light)] hover:text-[var(--ink-dark)] transition-colors p-1 -m-1"
                            aria-label="Close"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Live indicator */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-[var(--accent-gold)] animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="text-[10px] text-[var(--ink-light)] uppercase tracking-wider">
                            {loading ? 'Fetching rates...' : 'Live from network'}
                        </span>
                    </div>

                    {/* Fee tiers */}
                    {loading && !liveRates ? (
                        <div className="flex items-center justify-center py-6">
                            <div className="w-5 h-5 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {TIERS.map((tier) => {
                                    const rate = liveRates ? liveRates[tier.key] : defaultFeeRate;
                                    const isActive = selectedTier === tier.key;
                                    const isBelowMin = (TIER_RANK[tier.key] ?? 0) < minRank;
                                    return (
                                        <button
                                            key={tier.key}
                                            type="button"
                                            disabled={isBelowMin}
                                            onClick={() => setSelectedTier(tier.key)}
                                            className={`flex flex-col items-center px-2 py-3 rounded-lg border text-xs transition-all ${
                                                isBelowMin
                                                    ? 'border-[var(--border-paper)] bg-[var(--paper-bg)]/30 text-[var(--ink-light)]/50 cursor-not-allowed opacity-40'
                                                    : isActive
                                                        ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/8 text-[var(--ink-dark)]'
                                                        : 'border-[var(--border-paper)] bg-[var(--paper-bg)]/50 text-[var(--ink-medium)] hover:border-[var(--accent-gold)]/40'
                                            }`}
                                        >
                                            <span className="font-medium text-[11px] mb-0.5">{tier.label}</span>
                                            <span className="font-mono text-[var(--accent-gold)] font-semibold text-sm">{rate}</span>
                                            <span className="text-[9px] text-[var(--ink-light)] mt-0.5">sat/vB</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Custom */}
                            <div className={`px-3 py-2.5 rounded-lg border transition-all ${
                                selectedTier === 'custom'
                                    ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/8'
                                    : 'border-[var(--border-paper)] bg-[var(--paper-bg)]/50'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => setSelectedTier('custom')} className="flex items-center gap-2">
                                        <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            selectedTier === 'custom' ? 'border-[var(--accent-gold)]' : 'border-[var(--ink-light)]/40'
                                        }`}>
                                            {selectedTier === 'custom' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />}
                                        </span>
                                        <span className={`text-sm font-medium ${selectedTier === 'custom' ? 'text-[var(--ink-dark)]' : 'text-[var(--ink-medium)]'}`}>
                                            Custom
                                        </span>
                                    </button>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={customValue}
                                            onChange={(e) => handleCustomChange(e.target.value)}
                                            onFocus={() => setSelectedTier('custom')}
                                            placeholder="e.g. 25"
                                            className="w-full bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded-md px-3 py-1 text-sm text-[var(--ink-dark)] font-mono placeholder:text-[var(--ink-light)]/40 focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--ink-light)]">
                                            sat/vB
                                        </span>
                                    </div>
                                </div>
                                {customError && (
                                    <p className="text-[11px] text-[var(--stamp-red)] mt-1 ml-6">{customError}</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 text-sm text-[var(--ink-medium)] hover:text-[var(--ink-dark)] border border-[var(--border-paper)] rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={confirmDisabled || loading}
                            className="flex-1 px-4 py-2.5 text-sm font-medium bg-[var(--accent-gold)] text-white rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Confirm &amp; Send
                        </button>
                    </div>
                </div>

                <style>{`
                    @keyframes fcsFadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes fcsSlideIn {
                        from { opacity: 0; transform: translateY(8px) scale(0.97); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                `}</style>
            </div>
        </div>,
        document.body,
    );
}
