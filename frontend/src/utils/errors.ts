/** Returns true if the error is a user-initiated cancellation (fee selector or wallet). */
export function isUserCancel(err: unknown): boolean {
    if (!(err instanceof Error)) return false;
    const msg = err.message.toLowerCase();
    return msg === 'transaction cancelled' || msg.includes('user rejected') || msg.includes('user denied');
}

/** Map raw WASM / contract revert strings to user-friendly messages. */
export function friendlyError(raw: string): string {
    const lower = raw.toLowerCase();
    if (lower === 'transaction cancelled') return 'Transaction cancelled.';
    if (lower.includes('insufficient balance')) return 'Insufficient token balance to complete this payment.';
    if (lower.includes('insufficient allowance')) return 'Token allowance too low — please approve first.';
    if (lower.includes('invoice not found')) return 'Invoice not found on-chain.';
    if (lower.includes('already paid')) return 'This invoice has already been paid.';
    if (lower.includes('invoice expired') || lower.includes('past deadline')) return 'This invoice has expired.';
    if (lower.includes('cancelled')) return 'This invoice has been cancelled.';
    if (lower.includes('unreachable')) return 'Contract reverted — check your inputs and try again.';
    if (lower.includes('user rejected') || lower.includes('user denied')) return 'Transaction rejected by wallet.';
    // Generic fallback — never expose raw WASM traces to users
    return 'Something went wrong. Please try again.';
}
