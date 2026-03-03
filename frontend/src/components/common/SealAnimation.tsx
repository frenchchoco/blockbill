import { useEffect, useState, useRef, useMemo } from 'react';

interface SealAnimationProps {
    /** When true, the final stamp slams down and the animation completes */
    readonly confirmed: boolean;
    readonly onComplete: () => void;
    /** Final stamp text — defaults to "PAID" */
    readonly stampLabel?: string;
    /** Final stamp border/text color — defaults to red (#B71C1C) */
    readonly stampColor?: string;
    /** Title shown after final confirmation — defaults to "Payment Confirmed" */
    readonly confirmedTitle?: string;
    /** Subtitle shown after final confirmation */
    readonly confirmedSubtitle?: string;
    /** Pending stamp text shown while broadcasting (default: "BROADCASTING") */
    readonly pendingStampLabel?: string;
    /** Pending stamp color (default: #B8860B — gold) */
    readonly pendingStampColor?: string;
    /** Delay before showing the pending stamp in ms (default: 6000). Set to 0 to skip. */
    readonly pendingStampDelay?: number;
    /** Delay before showing the "Continue" link (default: 15000) */
    readonly continueDelay?: number;
}

type Phase = 'enter' | 'waiting' | 'pending-stamp' | 'pending-settle' | 'stamp' | 'settle' | 'done';

/* ── Binary rain columns (generated once) ──────────────────────── */
const COLUMN_COUNT = 9;
const CHARS_PER_COL = 24;

function generateBinaryColumns(): string[] {
    const cols: string[] = [];
    for (let c = 0; c < COLUMN_COUNT; c++) {
        let str = '';
        for (let i = 0; i < CHARS_PER_COL; i++) {
            str += Math.random() > 0.5 ? '1' : '0';
            // occasional space for breathing
            if (Math.random() > 0.7) str += ' ';
        }
        cols.push(str);
    }
    return cols;
}

export function SealAnimation({
    confirmed,
    onComplete,
    stampLabel = 'PAID',
    stampColor = '#B71C1C',
    confirmedTitle = 'Payment Confirmed',
    confirmedSubtitle = 'Recorded on Bitcoin L1',
    pendingStampLabel = 'BROADCASTING',
    pendingStampColor = '#B8860B',
    pendingStampDelay = 6000,
    continueDelay = 15000,
}: SealAnimationProps): React.JSX.Element {
    const [phase, setPhase] = useState<Phase>('enter');
    const [showContinue, setShowContinue] = useState(false);
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    const binaryCols = useMemo(() => generateBinaryColumns(), []);

    const order: Phase[] = ['enter', 'waiting', 'pending-stamp', 'pending-settle', 'stamp', 'settle', 'done'];
    const past = (target: Phase): boolean => order.indexOf(phase) >= order.indexOf(target);

    // Show binary rain during waiting/pending phases (not after final stamp)
    const showBinaryRain = past('waiting') && !past('stamp');

    // Phase 1: parchment card enters
    useEffect(() => {
        const t = setTimeout(() => setPhase('waiting'), 500);
        return () => clearTimeout(t);
    }, []);

    // Pending stamp after delay (broadcasting feedback)
    useEffect(() => {
        if (confirmed || pendingStampDelay <= 0 || phase !== 'waiting') return;
        const timers = [
            setTimeout(() => setPhase('pending-stamp'), pendingStampDelay),
            setTimeout(() => setPhase('pending-settle'), pendingStampDelay + 700),
        ];
        return () => timers.forEach(clearTimeout);
    }, [confirmed, phase, pendingStampDelay]);

    // Show "Continue" link after long delay
    useEffect(() => {
        if (past('stamp')) return;
        if (phase !== 'waiting' && phase !== 'pending-stamp' && phase !== 'pending-settle') return;
        const t = setTimeout(() => setShowContinue(true), continueDelay);
        return () => clearTimeout(t);
    }, [phase, continueDelay]);

    // Final stamp: when confirmed, slam the real stamp
    useEffect(() => {
        if (!confirmed) return;
        if (phase === 'waiting' || phase === 'pending-stamp' || phase === 'pending-settle') {
            const timers = [
                setTimeout(() => setPhase('stamp'), 100),
                setTimeout(() => setPhase('settle'), 800),
                setTimeout(() => setPhase('done'), 2500),
                setTimeout(() => onCompleteRef.current(), 3200),
            ];
            return () => timers.forEach(clearTimeout);
        }
    }, [confirmed, phase]);

    // Determine which stamp to show
    const showPending = past('pending-stamp') && !past('stamp');
    const showFinal = past('stamp');
    const currentStampLabel = showFinal ? stampLabel : pendingStampLabel;
    const currentStampColor = showFinal ? stampColor : pendingStampColor;
    const isStamping = phase === 'pending-stamp' || phase === 'stamp';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-[#1a1410]/70 backdrop-blur-[6px] animate-[sealFadeIn_0.4s_ease-out]" />

            <div className="relative flex flex-col items-center gap-6">
                {/* Parchment card */}
                <div className={`relative transition-all duration-600 ease-out ${
                    past('enter') ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
                }`}>
                    <div className="w-72 bg-[#FFFEF7] rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">
                        {/* Paper texture */}
                        <div className="absolute inset-0 opacity-[0.03] rounded-sm"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

                        {/* ── Binary rain overlay ───────────────── */}
                        <div
                            className={`absolute inset-0 pointer-events-none transition-opacity duration-500 overflow-hidden ${
                                showBinaryRain ? 'opacity-100' : 'opacity-0'
                            }`}
                            aria-hidden="true"
                        >
                            <div className="absolute inset-0 flex justify-between px-3">
                                {binaryCols.map((col, i) => (
                                    <div
                                        key={i}
                                        className="text-[10px] font-mono leading-[1.3] whitespace-pre select-none animate-[binaryScroll_8s_linear_infinite]"
                                        style={{
                                            color: '#B8860B',
                                            opacity: 0.12 + (i % 3) * 0.04,
                                            animationDelay: `${-(i * 1.1)}s`,
                                            animationDuration: `${6 + (i % 3) * 2}s`,
                                        }}
                                    >
                                        {col}{'\n'}{col}
                                    </div>
                                ))}
                            </div>
                            {/* Top/bottom fade masks */}
                            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#FFFEF7] to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#FFFEF7] to-transparent" />
                        </div>

                        <div className="p-8 relative">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-[1px] flex-1 bg-[#3E2723]/10" />
                                <span className="text-[9px] tracking-[0.3em] uppercase text-[#3E2723]/30 font-serif">BlockBill</span>
                                <div className="h-[1px] flex-1 bg-[#3E2723]/10" />
                            </div>

                            {/* Skeleton invoice lines */}
                            <div className="space-y-2.5 mb-6">
                                <div className="h-2 w-24 bg-[#3E2723]/8 rounded-full" />
                                <div className="h-1.5 w-full bg-[#3E2723]/5 rounded-full" />
                                <div className="h-1.5 w-4/5 bg-[#3E2723]/5 rounded-full" />
                                <div className="h-1.5 w-11/12 bg-[#3E2723]/5 rounded-full" />
                            </div>

                            <div className="h-[1px] w-full bg-[#3E2723]/8 mb-5" />

                            <div className="space-y-2">
                                <div className="h-1.5 w-1/3 bg-[#3E2723]/5 rounded-full" />
                                <div className="h-1.5 w-1/2 bg-[#3E2723]/5 rounded-full" />
                            </div>

                            <div className="flex justify-end mt-5">
                                <div className="h-3 w-20 bg-[#B8860B]/15 rounded-full" />
                            </div>

                            {/* Stamp — pending or final */}
                            {(showPending || showFinal) && (
                                <div
                                    key={showFinal ? 'final' : 'pending'}
                                    className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all ${
                                        isStamping
                                            ? 'scale-[2] opacity-0 animate-[stampSlam_0.3s_cubic-bezier(0.22,1.8,0.36,1)_forwards]'
                                            : 'scale-100 opacity-100'
                                    }`}
                                    style={{ transform: 'rotate(-12deg)' }}
                                >
                                    <div className="rounded-md px-6 py-3 select-none"
                                        style={{
                                            borderWidth: showFinal ? '4px' : '3px',
                                            borderStyle: showPending ? 'dashed' : 'solid',
                                            borderColor: currentStampColor,
                                            color: currentStampColor,
                                            fontFamily: 'serif',
                                            fontWeight: 900,
                                            fontSize: showPending ? '1.4rem' : '2.5rem',
                                            letterSpacing: '0.15em',
                                            textTransform: 'uppercase',
                                            lineHeight: 1,
                                            opacity: (past('pending-settle') && !showFinal) ? 0.5 : past('settle') ? 0.85 : 0.95,
                                            textShadow: `0 0 1px ${currentStampColor}40`,
                                        }}
                                    >
                                        {currentStampLabel}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Text below */}
                <div className={`text-center transition-all duration-600 ${
                    past('enter') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}>
                    {past('settle') ? (
                        <>
                            <p className="text-[#FFFEF7] text-lg font-serif tracking-wide">
                                {confirmedTitle}
                            </p>
                            <p className="text-[#FFFEF7]/40 text-xs mt-1.5 tracking-wider uppercase">
                                {confirmedSubtitle}
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-[#FFFEF7] text-lg font-serif tracking-wide">
                                {showPending ? 'Broadcasting to network' : 'Transaction broadcast'}
                            </p>
                            <p className="text-[#FFFEF7]/40 text-xs mt-1.5 tracking-wider uppercase flex items-center justify-center gap-2">
                                <span className="inline-block w-3 h-3 border border-[#FFFEF7]/40 border-t-transparent rounded-full animate-spin" />
                                Waiting for block confirmation...
                            </p>
                            {showContinue && (
                                <button type="button" onClick={() => onCompleteRef.current()}
                                    className="mt-4 text-sm text-[#FFFEF7]/60 hover:text-[#FFFEF7] transition-colors underline underline-offset-4 animate-[sealFadeIn_0.4s_ease-out]">
                                    Continue without waiting &rarr;
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes sealFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes stampSlam {
                    0% { transform: rotate(-12deg) scale(2); opacity: 0; }
                    60% { transform: rotate(-12deg) scale(0.9); opacity: 1; }
                    80% { transform: rotate(-12deg) scale(1.05); opacity: 0.95; }
                    100% { transform: rotate(-12deg) scale(1); opacity: 0.95; }
                }
                @keyframes binaryScroll {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
            `}</style>
        </div>
    );
}
