export const InvoiceStatus = {
    Pending: 0,
    Paid: 1,
    Expired: 2,
    Cancelled: 3,
} as const;

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export interface InvoiceData {
    readonly id: bigint;
    readonly creator: string;
    readonly token: string;
    readonly totalAmount: bigint;
    readonly recipient: string;
    readonly memo: string;
    readonly deadline: bigint;
    readonly taxBps: number;
    readonly status: InvoiceStatus;
    readonly paidBy: string;
    readonly paidAtBlock: bigint;
    readonly createdAtBlock: bigint;
    readonly btcTxHash: string;
    readonly lineItemCount: number;
}

export interface LineItem {
    readonly description: string;
    readonly amount: bigint;
}

export function getStatusLabel(status: InvoiceStatus): string {
    switch (status) {
        case InvoiceStatus.Pending: return 'PENDING';
        case InvoiceStatus.Paid: return 'PAID';
        case InvoiceStatus.Expired: return 'EXPIRED';
        case InvoiceStatus.Cancelled: return 'CANCELLED';
        default: return 'UNKNOWN';
    }
}

export function getStampClass(status: InvoiceStatus): string {
    switch (status) {
        case InvoiceStatus.Paid: return 'stamp stamp-paid';
        case InvoiceStatus.Pending: return 'stamp stamp-pending';
        case InvoiceStatus.Expired: return 'stamp stamp-expired';
        case InvoiceStatus.Cancelled: return 'stamp stamp-cancelled';
        default: return 'stamp';
    }
}
