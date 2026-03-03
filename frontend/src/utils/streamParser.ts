import type { Address } from '@btc-vision/transaction';
import type { StreamData, StreamStatus } from '../types/stream';

/**
 * Raw properties shape returned by contract.getStream().properties.
 * Matches the ABI definition in BlockBillStreamABI.ts.
 */
export interface RawStreamProperties {
    readonly sender: Address;
    readonly recipient: Address;
    readonly token: Address;
    readonly totalDeposited: bigint;
    readonly totalWithdrawn: bigint;
    readonly ratePerBlock: bigint;
    readonly startBlock: bigint;
    readonly endBlock: bigint;
    readonly lastWithdrawBlock: bigint;
    readonly pausedAtBlock: bigint;
    readonly accumulatedBeforePause: bigint;
    readonly status: number;
}

/** Extract hex string from an Address object or raw string. */
function addressToHex(value: unknown): string {
    if (typeof value === 'object' && value !== null && 'toHex' in value) {
        return (value as { toHex(): string }).toHex();
    }
    return String(value ?? '');
}

/**
 * Parse raw contract result properties into a typed StreamData object.
 * Handles Address-to-hex conversion and provides fallback defaults.
 *
 * Accepts the SDK's typed properties (Address + bigint) as well as
 * untyped records — the addressToHex helper duck-types the conversion.
 */
export function parseStreamProperties(id: number, p: RawStreamProperties): StreamData {
    return {
        id,
        sender: addressToHex(p.sender),
        recipient: addressToHex(p.recipient),
        token: addressToHex(p.token),
        totalDeposited: p.totalDeposited ?? 0n,
        totalWithdrawn: p.totalWithdrawn ?? 0n,
        ratePerBlock: p.ratePerBlock ?? 0n,
        startBlock: p.startBlock ?? 0n,
        endBlock: p.endBlock ?? 0n,
        lastWithdrawBlock: p.lastWithdrawBlock ?? 0n,
        pausedAtBlock: p.pausedAtBlock ?? 0n,
        accumulatedBeforePause: p.accumulatedBeforePause ?? 0n,
        status: (p.status ?? 0) as StreamStatus,
    };
}

/** Strip any number of leading 0x prefixes and lowercase. */
export function normalizeHex(hex: string): string {
    return hex.replace(/^(0x)+/i, '').toLowerCase();
}
