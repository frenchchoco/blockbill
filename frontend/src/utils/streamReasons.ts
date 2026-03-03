/**
 * Store optional pause/cancel reasons for streams (local-only, not on-chain).
 * Keyed by streamId. Auto-expires after 90 days.
 */

const STORAGE_KEY = 'bb_stream_reasons';
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export type ReasonAction = 'pause' | 'cancel';

export interface StreamReason {
    readonly streamId: number;
    readonly action: ReasonAction;
    readonly reason: string;
    readonly timestamp: number;
}

function readAll(): StreamReason[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        const now = Date.now();
        return (parsed as StreamReason[]).filter((r) => now - r.timestamp < MAX_AGE_MS);
    } catch {
        return [];
    }
}

function writeAll(reasons: StreamReason[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reasons));
}

/** Save a reason for a stream action. Replaces any existing reason for the same stream+action. */
export function setStreamReason(streamId: number, action: ReasonAction, reason: string): void {
    if (!reason.trim()) return;
    const reasons = readAll().filter((r) => !(r.streamId === streamId && r.action === action));
    reasons.push({ streamId, action, reason: reason.trim(), timestamp: Date.now() });
    writeAll(reasons);
}

/** Get the reason for a specific stream action. */
export function getStreamReason(streamId: number, action?: ReasonAction): StreamReason | undefined {
    const all = readAll();
    if (action) return all.find((r) => r.streamId === streamId && r.action === action);
    // Return the most recent reason for this stream (cancel > pause)
    return all.filter((r) => r.streamId === streamId).sort((a, b) => b.timestamp - a.timestamp)[0];
}

/** Get all reasons (auto-expired). */
export function getAllStreamReasons(): StreamReason[] {
    const reasons = readAll();
    writeAll(reasons); // persist auto-expiry
    return reasons;
}
