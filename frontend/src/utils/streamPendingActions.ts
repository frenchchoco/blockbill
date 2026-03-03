/**
 * Track pending stream actions (withdraw, pause, resume, cancel, topUp)
 * so the dashboard can show visual feedback before on-chain confirmation.
 */

const STORAGE_KEY = 'bb_stream_pending_actions';

export type PendingActionType = 'withdraw' | 'pause' | 'resume' | 'cancel' | 'topUp';

export interface PendingStreamAction {
    readonly streamId: number;
    readonly action: PendingActionType;
    readonly timestamp: number; // Date.now()
}

/** Max age before auto-expiry (20 minutes — 2 blocks). */
const MAX_AGE_MS = 20 * 60 * 1000;

function readAll(): PendingStreamAction[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        const now = Date.now();
        // Auto-expire old entries
        return (parsed as PendingStreamAction[]).filter((a) => now - a.timestamp < MAX_AGE_MS);
    } catch {
        return [];
    }
}

function writeAll(actions: PendingStreamAction[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
}

/** Record a pending action for a stream. Replaces any existing action for the same stream. */
export function setPendingAction(streamId: number, action: PendingActionType): void {
    const actions = readAll().filter((a) => a.streamId !== streamId);
    actions.push({ streamId, action, timestamp: Date.now() });
    writeAll(actions);
}

/** Get the pending action for a given stream, if any. */
export function getPendingAction(streamId: number): PendingStreamAction | undefined {
    return readAll().find((a) => a.streamId === streamId);
}

/** Get all pending actions (auto-expired). */
export function getAllPendingActions(): PendingStreamAction[] {
    const actions = readAll();
    writeAll(actions); // persist the auto-expired list
    return actions;
}

/** Clear pending action for a specific stream. */
export function clearPendingAction(streamId: number): void {
    writeAll(readAll().filter((a) => a.streamId !== streamId));
}
