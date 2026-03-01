import { useEffect, useState } from 'react';

interface SealAnimationProps {
    readonly onComplete: () => void;
}

type Phase = 'paper' | 'fold' | 'seal' | 'glow' | 'done';

export function SealAnimation({ onComplete }: SealAnimationProps): React.JSX.Element {
    const [phase, setPhase] = useState<Phase>('paper');

    useEffect(() => {
        const timers = [
            setTimeout(() => setPhase('fold'), 800),
            setTimeout(() => setPhase('seal'), 2000),
            setTimeout(() => setPhase('glow'), 3200),
            setTimeout(() => setPhase('done'), 4600),
            setTimeout(onComplete, 5200),
        ];
        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink-dark)]/60 backdrop-blur-sm animate-[fadeOverlay_0.3s_ease-out]">
            <div className="relative w-72 h-96 flex items-center justify-center">

                {/* Invoice paper */}
                <div className={`absolute w-56 transition-all duration-700 ease-in-out ${
                    phase === 'paper'
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 -translate-y-8 scale-75'
                }`}>
                    <div className="bg-[var(--paper-card)] border border-[var(--border-paper)] rounded-lg p-5 shadow-xl">
                        <div className="h-3 w-20 bg-[var(--border-paper)] rounded mb-3" />
                        <div className="h-2 w-full bg-[var(--border-paper)]/60 rounded mb-2" />
                        <div className="h-2 w-3/4 bg-[var(--border-paper)]/60 rounded mb-2" />
                        <div className="h-2 w-5/6 bg-[var(--border-paper)]/60 rounded mb-4" />
                        <div className="h-px w-full bg-[var(--border-paper)] mb-3" />
                        <div className="h-2 w-1/2 bg-[var(--border-paper)]/40 rounded mb-2" />
                        <div className="h-2 w-2/3 bg-[var(--border-paper)]/40 rounded mb-4" />
                        <div className="flex justify-end">
                            <div className="h-4 w-16 bg-[var(--accent-gold)]/30 rounded" />
                        </div>
                    </div>
                </div>

                {/* Envelope */}
                <div className={`absolute w-64 transition-all duration-700 ${
                    phase === 'paper' ? 'opacity-0 translate-y-12 scale-90' : 'opacity-100 translate-y-0 scale-100'
                }`}>
                    {/* Envelope body */}
                    <div className="relative">
                        {/* Back of envelope */}
                        <div className="w-64 h-44 bg-[var(--paper-card-dark)] border border-[var(--border-paper)] rounded-lg shadow-2xl overflow-hidden">
                            {/* Inner V pattern (visible when flap is open) */}
                            <div className="absolute inset-0 flex items-start justify-center pt-2">
                                <div className="w-0 h-0 border-l-[120px] border-r-[120px] border-t-[70px] border-l-transparent border-r-transparent border-t-[var(--border-paper)]/20" />
                            </div>
                            {/* Bottom V pattern */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                                <div className="w-0 h-0 border-l-[130px] border-r-[130px] border-b-[80px] border-l-transparent border-r-transparent border-b-[var(--paper-card)]" />
                            </div>
                        </div>

                        {/* Envelope flap */}
                        <div
                            className={`absolute -top-px left-0 right-0 flex justify-center transition-all origin-top ${
                                phase === 'fold' ? 'duration-700' : 'duration-500'
                            }`}
                            style={{
                                transform: phase === 'fold' || phase === 'seal' || phase === 'glow' || phase === 'done'
                                    ? 'perspective(400px) rotateX(180deg)'
                                    : 'perspective(400px) rotateX(0deg)',
                                transformStyle: 'preserve-3d',
                            }}
                        >
                            {/* Flap front */}
                            <div className="w-0 h-0 border-l-[132px] border-r-[132px] border-t-[80px] border-l-transparent border-r-transparent border-t-[var(--paper-card-dark)] drop-shadow-sm"
                                style={{ backfaceVisibility: 'hidden' }} />
                            {/* Flap back (visible when folded) */}
                            <div className="absolute inset-0 flex justify-center"
                                style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}>
                                <div className="w-0 h-0 border-l-[132px] border-r-[132px] border-t-[80px] border-l-transparent border-r-transparent border-t-[var(--paper-card)]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wax Seal */}
                <div className={`absolute transition-all ${
                    phase === 'seal' || phase === 'glow' || phase === 'done'
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-[2.5]'
                } ${phase === 'seal' ? 'duration-500' : 'duration-300'}`}
                    style={{ top: '38%' }}>
                    <div className={`relative ${phase === 'glow' || phase === 'done' ? 'animate-[sealGlow_1.5s_ease-in-out]' : ''}`}>
                        {/* Wax blob shape */}
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#8B2020] via-[#C62828] to-[#7B1818] shadow-[0_4px_20px_rgba(198,40,40,0.5)] flex items-center justify-center relative">
                            {/* Wax drip edges */}
                            <div className="absolute -top-1 -left-2 w-6 h-6 rounded-full bg-[#9B2222]" />
                            <div className="absolute -top-1 -right-3 w-5 h-5 rounded-full bg-[#8B1E1E]" />
                            <div className="absolute -bottom-2 -left-1 w-4 h-4 rounded-full bg-[#A52525]" />
                            <div className="absolute -bottom-1 -right-2 w-5 h-5 rounded-full bg-[#952020]" />
                            <div className="absolute top-1 -right-1 w-3 h-3 rounded-full bg-[#8B1A1A]" />
                            <div className="absolute -bottom-2 left-4 w-3 h-3 rounded-full bg-[#A02222]" />

                            {/* Inner ring */}
                            <div className="w-22 h-22 rounded-full border-2 border-[#D4A0A0]/30 flex items-center justify-center">
                                {/* Seal content */}
                                <div className="text-center select-none">
                                    <div className="text-[#F5D0D0]/90 text-[7px] font-bold uppercase tracking-[0.15em] leading-tight font-serif">
                                        Registered
                                    </div>
                                    <div className="text-[#F5D0D0]/70 text-[5px] tracking-wider my-0.5">&mdash;&mdash;&mdash;</div>
                                    <div className="text-[#FFD0D0] text-xs font-bold font-serif">&amp;</div>
                                    <div className="text-[#F5D0D0]/70 text-[5px] tracking-wider my-0.5">&mdash;&mdash;&mdash;</div>
                                    <div className="text-[#F5D0D0]/90 text-[7px] font-bold uppercase tracking-[0.15em] leading-tight font-serif">
                                        Immutable
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status text */}
                <div className={`absolute bottom-0 text-center transition-all duration-700 ${
                    phase === 'glow' || phase === 'done' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                    <p className="text-white text-lg font-serif font-bold tracking-wide">Invoice Sealed</p>
                    <p className="text-white/60 text-sm mt-1">Permanently recorded on Bitcoin L1</p>
                </div>
            </div>

            <style>{`
                @keyframes fadeOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes sealGlow {
                    0% { filter: drop-shadow(0 0 0px rgba(198, 40, 40, 0)); }
                    50% { filter: drop-shadow(0 0 20px rgba(198, 40, 40, 0.6)); }
                    100% { filter: drop-shadow(0 0 8px rgba(198, 40, 40, 0.2)); }
                }
            `}</style>
        </div>
    );
}
