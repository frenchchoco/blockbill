/**
 * Local stream draft storage — persists in-progress stream forms
 * so users see them in the Stream Dashboard before broadcast.
 */

const DRAFTS_KEY = 'bb_stream_drafts';

export type DraftStatus = 'draft' | 'pending';

export interface StreamDraft {
    /** Random client-side ID (not the on-chain stream ID). */
    readonly draftId: string;
    /** Wallet address (hex) that created this draft — used to scope drafts per wallet. */
    readonly senderAddress?: string;
    readonly tokenAddress: string;
    readonly tokenSymbol: string;
    readonly tokenIcon: string;
    readonly recipient: string;
    readonly totalAmount: string;
    readonly ratePerBlock: string;
    readonly durationBlocks: string;
    /** Optional memo (plain text, only stored locally). */
    readonly memo?: string;
    readonly createdAt: number;       // Date.now()
    readonly updatedAt: number;
    /** 'draft' = editable form, 'pending' = tx broadcast, waiting for block */
    readonly status: DraftStatus;
    /** Transaction ID set when status transitions to 'pending'. */
    readonly txId?: string;
}

function readAll(): StreamDraft[] {
    try {
        const raw = localStorage.getItem(DRAFTS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        // Migrate old drafts without status field
        return (parsed as StreamDraft[]).map((d) => ({
            ...d,
            status: d.status ?? 'draft',
        }));
    } catch {
        return [];
    }
}

function writeAll(drafts: StreamDraft[]): void {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

/** Normalize hex for comparison — strips any 0x prefix(es) and lowercases. */
function normHex(hex: string): string {
    return hex.replace(/^(0x)+/i, '').toLowerCase();
}

/** Return all saved drafts, newest first. Optionally filter by wallet address. */
export function getStreamDrafts(walletHex?: string): StreamDraft[] {
    let all = readAll().sort((a, b) => b.updatedAt - a.updatedAt);
    if (walletHex) {
        const norm = normHex(walletHex);
        all = all.filter((d) => !d.senderAddress || normHex(d.senderAddress) === norm);
    }
    return all;
}

/** Create or update a draft. Returns the draftId. */
export function saveStreamDraft(draft: Omit<StreamDraft, 'draftId' | 'createdAt' | 'updatedAt' | 'status'> & { draftId?: string }): string {
    const now = Date.now();
    const drafts = readAll();

    if (draft.draftId) {
        const idx = drafts.findIndex((d) => d.draftId === draft.draftId);
        if (idx >= 0) {
            drafts[idx] = { ...drafts[idx], ...draft, draftId: draft.draftId, status: 'draft', updatedAt: now };
            writeAll(drafts);
            return draft.draftId;
        }
    }

    const draftId = draft.draftId ?? `draft_${now}_${Math.random().toString(36).slice(2, 8)}`;
    drafts.push({
        ...draft,
        draftId,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
    });
    writeAll(drafts);
    return draftId;
}

/** Mark a draft as "pending" (tx broadcast, waiting for block confirmation). */
export function markDraftPending(draftId: string, txId: string): void {
    const drafts = readAll();
    const idx = drafts.findIndex((d) => d.draftId === draftId);
    if (idx >= 0) {
        drafts[idx] = { ...drafts[idx], status: 'pending', txId, updatedAt: Date.now() };
        writeAll(drafts);
    }
}

/** Delete a single draft. */
export function deleteStreamDraft(draftId: string): void {
    writeAll(readAll().filter((d) => d.draftId !== draftId));
}

/** Remove pending drafts for the given wallet (or all pending if no wallet specified). */
export function clearPendingDrafts(walletHex?: string): void {
    if (!walletHex) {
        writeAll(readAll().filter((d) => d.status !== 'pending'));
        return;
    }
    const norm = normHex(walletHex);
    writeAll(readAll().filter((d) =>
        !(d.status === 'pending' && (!d.senderAddress || normHex(d.senderAddress) === norm)),
    ));
}

/** Delete all drafts. */
export function clearStreamDrafts(): void {
    localStorage.removeItem(DRAFTS_KEY);
}
