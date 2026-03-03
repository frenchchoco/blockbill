export const StreamStatus = {
    Active: 0,
    Paused: 1,
    Cancelled: 2,
} as const;

export type StreamStatus = (typeof StreamStatus)[keyof typeof StreamStatus];

export interface StreamData {
    readonly id: number;
    readonly sender: string;      // hex address
    readonly recipient: string;   // hex address
    readonly token: string;       // hex address
    readonly totalDeposited: bigint;
    readonly totalWithdrawn: bigint;
    readonly ratePerBlock: bigint;
    readonly startBlock: bigint;
    readonly endBlock: bigint;
    readonly lastWithdrawBlock: bigint;
    readonly pausedAtBlock: bigint;
    readonly accumulatedBeforePause: bigint;
    readonly status: StreamStatus;
}

/** Returns true when all deposited tokens have been withdrawn (stream is functionally done). */
export function isStreamExhausted(stream: StreamData): boolean {
    return stream.status === StreamStatus.Active
        && stream.totalDeposited > 0n
        && stream.totalWithdrawn >= stream.totalDeposited;
}

export function getStreamStatusLabel(status: StreamStatus, exhausted = false): string {
    if (exhausted) return 'COMPLETED';
    switch (status) {
        case StreamStatus.Active: return 'ACTIVE';
        case StreamStatus.Paused: return 'PAUSED';
        case StreamStatus.Cancelled: return 'CANCELLED';
        default: return 'UNKNOWN';
    }
}

export function getStreamStampClass(status: StreamStatus, exhausted = false): string {
    if (exhausted) return 'stamp stamp-paid';
    switch (status) {
        case StreamStatus.Active: return 'stamp stamp-paid';
        case StreamStatus.Paused: return 'stamp stamp-pending';
        case StreamStatus.Cancelled: return 'stamp stamp-cancelled';
        default: return 'stamp';
    }
}
