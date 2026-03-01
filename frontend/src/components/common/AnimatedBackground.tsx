import { useEffect, useRef } from 'react';

interface Stamp {
    x: number;
    y: number;
    text: string;
    rotation: number;
    size: number;
    color: string;
    phase: 'appear' | 'hold' | 'fade';
    life: number;
    maxLife: number;
    scale: number;
    opacity: number;
    borderWidth: number;
}

const STAMP_TEXTS = ['PAID', '\u20BF', 'VERIFIED', 'ON-CHAIN', 'L1', 'SETTLED', '\u2713', 'PROOF', 'BTC'];

const COLORS = [
    'rgba(139, 105, 20, A)',   // gold
    'rgba(198, 40, 40, A)',    // red
    'rgba(46, 125, 50, A)',    // green
    'rgba(93, 64, 55, A)',     // brown
    'rgba(141, 110, 99, A)',   // light brown
];

const MAX_STAMPS = 6;
const SPAWN_INTERVAL = 2800;
const APPEAR_DURATION = 12;
const HOLD_DURATION = 120;
const FADE_DURATION = 80;

function createStamp(canvasW: number, canvasH: number): Stamp {
    const margin = 100;
    return {
        x: margin + Math.random() * (canvasW - margin * 2),
        y: margin + Math.random() * (canvasH - margin * 2),
        text: STAMP_TEXTS[Math.floor(Math.random() * STAMP_TEXTS.length)],
        rotation: (Math.random() - 0.5) * 0.3,
        size: 14 + Math.random() * 18,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        phase: 'appear',
        life: 0,
        maxLife: APPEAR_DURATION + HOLD_DURATION + FADE_DURATION,
        scale: 2.5,
        opacity: 0,
        borderWidth: 1.5 + Math.random() * 1.5,
    };
}

export function AnimatedBackground(): React.JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = (): void => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const stamps: Stamp[] = [];
        let framesSinceSpawn = SPAWN_INTERVAL;

        const animate = (): void => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Spawn new stamps
            framesSinceSpawn++;
            if (framesSinceSpawn >= SPAWN_INTERVAL / 16 && stamps.length < MAX_STAMPS) {
                stamps.push(createStamp(canvas.width, canvas.height));
                framesSinceSpawn = 0;
            }

            // Update and draw stamps
            for (let i = stamps.length - 1; i >= 0; i--) {
                const s = stamps[i];
                s.life++;

                // Phase transitions
                if (s.life <= APPEAR_DURATION) {
                    s.phase = 'appear';
                    const t = s.life / APPEAR_DURATION;
                    // Stamp drop effect: scale down from big, bounce slightly
                    s.scale = 1 + (1.5 * (1 - t) * (1 - t));
                    s.opacity = t * 0.06;
                } else if (s.life <= APPEAR_DURATION + HOLD_DURATION) {
                    s.phase = 'hold';
                    s.scale = 1;
                    s.opacity = 0.06;
                } else {
                    s.phase = 'fade';
                    const t = (s.life - APPEAR_DURATION - HOLD_DURATION) / FADE_DURATION;
                    s.scale = 1;
                    s.opacity = 0.06 * (1 - t);
                }

                // Remove dead stamps
                if (s.life >= s.maxLife) {
                    stamps.splice(i, 1);
                    continue;
                }

                // Draw stamp
                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(s.rotation);
                ctx.scale(s.scale, s.scale);

                const alpha = s.opacity.toFixed(3);
                const fillColor = s.color.replace('A', alpha);
                const strokeColor = s.color.replace('A', (s.opacity * 1.5).toFixed(3));

                // Stamp border (rounded rect)
                const text = s.text;
                ctx.font = `bold ${s.size}px "Playfair Display", Georgia, serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const metrics = ctx.measureText(text);
                const padX = s.size * 0.6;
                const padY = s.size * 0.35;
                const w = metrics.width + padX * 2;
                const h = s.size + padY * 2;

                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = s.borderWidth;
                ctx.beginPath();
                ctx.roundRect(-w / 2, -h / 2, w, h, 3);
                ctx.stroke();

                // Stamp text
                ctx.fillStyle = fillColor;
                ctx.fillText(text, 0, 1);

                ctx.restore();
            }

            animFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            aria-hidden="true"
        />
    );
}
