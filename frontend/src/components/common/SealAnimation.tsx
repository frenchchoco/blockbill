import { useEffect, useState, useRef } from 'react';

interface SealAnimationProps {
    /** When true, the wax seal stamps and the animation completes */
    readonly confirmed: boolean;
    readonly onComplete: () => void;
}

type Phase = 'enter' | 'waiting' | 'stamp' | 'imprint' | 'reveal' | 'done';

export function SealAnimation({ confirmed, onComplete }: SealAnimationProps): React.JSX.Element {
    const [phase, setPhase] = useState<Phase>('enter');
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    // Phase 1: envelope enters
    useEffect(() => {
        const t = setTimeout(() => setPhase('waiting'), 600);
        return () => clearTimeout(t);
    }, []);

    // Phase 2: when confirmed, stamp the seal
    useEffect(() => {
        if (!confirmed || phase !== 'waiting') return;

        const timers = [
            setTimeout(() => setPhase('stamp'), 100),
            setTimeout(() => setPhase('imprint'), 700),
            setTimeout(() => setPhase('reveal'), 1700),
            setTimeout(() => setPhase('done'), 2900),
            setTimeout(() => onCompleteRef.current(), 3500),
        ];
        return () => timers.forEach(clearTimeout);
    }, [confirmed, phase]);

    const past = (target: Phase): boolean => {
        const order: Phase[] = ['enter', 'waiting', 'stamp', 'imprint', 'reveal', 'done'];
        return order.indexOf(phase) >= order.indexOf(target);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-[#1a1410]/70 backdrop-blur-[6px] animate-[sealFadeIn_0.4s_ease-out]" />

            <div className="relative flex flex-col items-center gap-8">
                {/* Parchment card */}
                <div className={`relative transition-all duration-700 ease-out ${
                    past('enter') ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
                }`}>
                    <div className="w-72 bg-[#FFFEF7] rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden">
                        {/* Paper texture overlay */}
                        <div className="absolute inset-0 opacity-[0.03]"
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

                        <div className="p-8 pb-20 relative">
                            {/* Header lines */}
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

                            {/* Amount placeholder */}
                            <div className="flex justify-end mt-5">
                                <div className="h-3 w-20 bg-[#B8860B]/15 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Wax seal — positioned overlapping the bottom edge */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                        <div className={`transition-all ${
                            past('stamp')
                                ? 'opacity-100 scale-100 duration-300'
                                : 'opacity-0 scale-[3] duration-0'
                        } ${phase === 'stamp' ? 'ease-[cubic-bezier(0.22,1.8,0.36,1)]' : 'ease-out'}`}>

                            {/* Impact flash */}
                            <div className={`absolute inset-0 -m-4 rounded-full transition-opacity duration-500 ${
                                phase === 'stamp' ? 'opacity-100' : 'opacity-0'
                            }`} style={{ boxShadow: '0 0 40px 10px rgba(139, 32, 32, 0.3)' }} />

                            {/* Seal body */}
                            <div className={`relative w-20 h-20 rounded-full transition-all duration-1000 ${
                                past('imprint') ? 'shadow-[0_2px_8px_rgba(0,0,0,0.2)]' : 'shadow-[0_8px_30px_rgba(139,32,32,0.4)]'
                            }`}>
                                {/* Wax base with subtle irregularity */}
                                <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full">
                                    <defs>
                                        <radialGradient id="waxGrad" cx="40%" cy="35%" r="60%">
                                            <stop offset="0%" stopColor="#C62828" />
                                            <stop offset="50%" stopColor="#A52222" />
                                            <stop offset="100%" stopColor="#7B1818" />
                                        </radialGradient>
                                    </defs>
                                    <path d="M40 2 C52 1, 65 8, 73 18 C80 27, 79 42, 77 52 C75 62, 65 73, 55 77 C45 81, 30 79, 22 73 C14 67, 5 57, 3 46 C1 35, 4 22, 12 13 C20 4, 30 3, 40 2Z"
                                        fill="url(#waxGrad)" />
                                </svg>

                                {/* Seal emboss content */}
                                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
                                    past('imprint') ? 'opacity-100' : 'opacity-0'
                                }`}>
                                    <div className="text-center select-none" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}>
                                        <div className="text-[#F5CDCD]/80 text-[6px] font-bold uppercase tracking-[0.2em] font-serif leading-none">
                                            Sealed
                                        </div>
                                        <div className="text-[#F5CDCD]/50 text-[5px] tracking-[0.15em] my-[3px]">&#x2022; &#x2022; &#x2022;</div>
                                        <div className="text-[#FFD4D4]/90 text-sm font-serif font-bold leading-none" style={{ fontVariant: 'small-caps' }}>
                                            BB
                                        </div>
                                        <div className="text-[#F5CDCD]/50 text-[5px] tracking-[0.15em] my-[3px]">&#x2022; &#x2022; &#x2022;</div>
                                        <div className="text-[#F5CDCD]/80 text-[6px] font-bold uppercase tracking-[0.2em] font-serif leading-none">
                                            On-Chain
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Text below — waiting or confirmed */}
                <div className={`text-center mt-4 transition-all duration-700 ${
                    past('enter') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}>
                    {past('reveal') ? (
                        <>
                            <p className="text-[#FFFEF7] text-lg font-serif tracking-wide">
                                Invoice Sealed
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
            `}</style>
        </div>
    );
}
