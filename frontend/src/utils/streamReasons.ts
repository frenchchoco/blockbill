/**
 * Store optional pause/cancel reasons for streams (local-only, not on-chain).
 * Keyed by streamId. No expiry — reasons persist as long as localStorage exists.
 */

const STORAGE_KEY = 'bb_stream_reasons';

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
        return parsed as StreamReason[];
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

/** Get all reasons. */
export function getAllStreamReasons(): StreamReason[] {
    return readAll();
}
