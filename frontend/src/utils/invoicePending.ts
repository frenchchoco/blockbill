/**
 * Local pending-invoice storage — persists broadcast-but-unconfirmed invoices
 * so users see them in the Invoice Dashboard immediately after broadcast.
 *
 * Cleared automatically once the on-chain wallet invoice count grows.
 */

const STORAGE_KEY = 'bb_pending_invoices';

export interface PendingInvoice {
    /** Random client-side ID (not the on-chain invoice ID). */
    readonly pendingId: string;
    /** Wallet address (hex) that created this invoice. */
    readonly creatorHex: string;
    readonly tokenAddress: string;
    readonly tokenSymbol: string;
    readonly tokenIcon: string;
    readonly recipient: string;
    readonly totalAmount: string;
    readonly memo: string;
    readonly txId: string;
    readonly createdAt: number; // Date.now()
}

function readAll(): PendingInvoice[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed as PendingInvoice[];
    } catch {
        return [];
    }
}

function writeAll(pending: PendingInvoice[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
}

function normHex(hex: string): string {
    return hex.replace(/^(0x)+/i, '').toLowerCase();
}

/** Return all pending invoices for a given wallet, newest first. */
export function getPendingInvoices(walletHex: string): PendingInvoice[] {
    const norm = normHex(walletHex);
    return readAll()
        .filter((p) => normHex(p.creatorHex) === norm)
        .sort((a, b) => b.createdAt - a.createdAt);
}

/** Save a new pending invoice entry. Returns the pendingId. */
export function savePendingInvoice(entry: Omit<PendingInvoice, 'pendingId' | 'createdAt'>): string {
    const pendingId = `pending_inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const all = readAll();
    all.push({ ...entry, pendingId, createdAt: Date.now() });
    writeAll(all);
    return pendingId;
}

/** Clear all pending invoices for the given wallet (called when on-chain count grows). */
export function clearPendingInvoices(walletHex: string): void {
    const norm = normHex(walletHex);
    writeAll(readAll().filter((p) => normHex(p.creatorHex) !== norm));
}

/** Remove a single pending entry by pendingId. */
export function removePendingInvoice(pendingId: string): void {
    writeAll(readAll().filter((p) => p.pendingId !== pendingId));
}
