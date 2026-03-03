import type { Address } from '@btc-vision/transaction';
import type { InvoiceData } from '../types/invoice';
import type { InvoiceStatus } from '../types/invoice';

/** Raw properties shape returned by contract.getInvoice().properties */
interface RawInvoiceProperties {
    readonly creator?: Address;
    readonly token?: Address;
    readonly totalAmount?: bigint;
    readonly recipient?: Address;
    readonly status?: number;
    readonly deadline?: bigint;
    readonly taxBps?: number;
    readonly createdAtBlock?: bigint;
    readonly paidBy?: Address;
    readonly paidAtBlock?: bigint;
    readonly memo?: string;
    readonly lineItemCount?: number;
}

/**
 * Parse raw contract result properties into a typed InvoiceData object.
 * Handles the Address-to-hex conversion and provides fallback defaults.
 */
export function parseInvoiceProperties(id: bigint, p: RawInvoiceProperties): InvoiceData {
    return {
        id,
        creator: p.creator?.toHex() ?? '',
        token: p.token?.toHex() ?? '',
        totalAmount: p.totalAmount ?? 0n,
        recipient: p.recipient?.toHex() ?? '',
        memo: p.memo ?? '',
        deadline: p.deadline ?? 0n,
        taxBps: p.taxBps ?? 0,
        status: (p.status ?? 0) as InvoiceStatus,
        paidBy: p.paidBy?.toHex() ?? '',
        paidAtBlock: p.paidAtBlock ?? 0n,
        createdAtBlock: p.createdAtBlock ?? 0n,
        lineItemCount: p.lineItemCount ?? 0,
    };
}
