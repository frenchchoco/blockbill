import { useEffect, useState, useRef } from 'react';

interface SealAnimationProps {
    /** When true, the PAID stamp slams down and the animation completes */
    readonly confirmed: boolean;
    readonly onComplete: () => void;
}

type Phase = 'enter' | 'waiting' | 'stamp' | 'settle' | 'done';

export function SealAnimation({ confirmed, onComplete }: SealAnimationProps): React.JSX.Element {
    const [phase, setPhase] = useState<Phase>('enter');
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    // Phase 1: parchment card enters
    useEffect(() => {
        const t = setTimeout(() => setPhase('waiting'), 500);
        return () => clearTimeout(t);
    }, []);

    // Phase 2: when confirmed, stamp PAID
    useEffect(() => {
        if (!confirmed || phase !== 'waiting') return;

        const timers = [
            setTimeout(() => setPhase('stamp'), 100),
            setTimeout(() => setPhase('settle'), 800),
            setTimeout(() => setPhase('done'), 2500),
            setTimeout(() => onCompleteRef.current(), 3200),
        ];
        return () => timers.forEach(clearTimeout);
    }, [confirmed, phase]);

    const past = (target: Phase): boolean => {
        const order: Phase[] = ['enter', 'waiting', 'stamp', 'settle', 'done'];
        return order.indexOf(phase) >= order.indexOf(target);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-[#1a1410]/70 backdrop-blur-[6px] animate-[sealFadeIn_0.4s_ease-out]" />

            <div className="relative flex flex-col items-center gap-6">
                {/* Parchment card */}
                <div className={`relative transition-all duration-600 ease-out ${
                    past('enter') ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
                }`}>
                    <div className="w-72 bg-[#FFFEF7] rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-visible">
                        {/* Paper texture */}
                        <div className="absolute inset-0 opacity-[0.03] rounded-sm"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

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

                            {/* PAID stamp — only rendered after stamp phase */}
                            {past('stamp') && (
                                <div
                                    className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all ${
                                        phase === 'stamp'
                                            ? 'scale-[2] opacity-0 animate-[stampSlam_0.3s_cubic-bezier(0.22,1.8,0.36,1)_forwards]'
                                            : 'scale-100 opacity-100'
                                    }`}
                                    style={{ transform: 'rotate(-12deg)' }}
                                >
                                    <div className="border-[4px] border-[#B71C1C] rounded-md px-8 py-3 select-none"
                                        style={{
                                            color: '#B71C1C',
                                            fontFamily: 'serif',
                                            fontWeight: 900,
                                            fontSize: '2.5rem',
                                            letterSpacing: '0.15em',
                                            textTransform: 'uppercase',
                                            lineHeight: 1,
                                            opacity: past('settle') ? 0.85 : 0.95,
                                            textShadow: '0 0 1px rgba(183, 28, 28, 0.3)',
                                        }}
                                    >
                                        PAID
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
                                Payment Confirmed
                            </p>
                            <p className="text-[#FFFEF7]/40 text-xs mt-1.5 tracking-wider uppercase">
                                Recorded on Bitcoin L1
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-[#FFFEF7] text-lg font-serif tracking-wide">
                                Transaction broadcast
                            </p>
                            <p className="text-[#FFFEF7]/40 text-xs mt-1.5 tracking-wider uppercase flex items-center justify-center gap-2">
                                <span className="inline-block w-3 h-3 border border-[#FFFEF7]/40 border-t-transparent rounded-full animate-spin" />
                                Waiting for block confirmation...
                            </p>
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
            `}</style>
        </div>
    );
}
