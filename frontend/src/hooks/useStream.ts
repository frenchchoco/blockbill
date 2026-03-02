import { useState, useEffect, useCallback, useRef } from 'react';
import type { Address } from '@btc-vision/transaction';
import { useNetwork } from './useNetwork';
import { contractService } from '../services/ContractService';
import type { StreamData, StreamStatus } from '../types/stream';

/** Raw properties shape returned by contract.getStream().properties */
interface RawStreamProperties {
    readonly sender?: Address;
    readonly recipient?: Address;
    readonly token?: Address;
    readonly totalDeposited?: bigint;
    readonly totalWithdrawn?: bigint;
    readonly ratePerBlock?: bigint;
    readonly startBlock?: bigint;
    readonly endBlock?: bigint;
    readonly lastWithdrawBlock?: bigint;
    readonly pausedAtBlock?: bigint;
    readonly accumulatedBeforePause?: bigint;
    readonly status?: number;
}

/**
 * Parse raw contract result properties into a typed StreamData object.
 * Handles the Address-to-hex conversion and provides fallback defaults.
 */
function parseStreamProperties(id: number, p: RawStreamProperties): StreamData {
    return {
        id,
        sender: p.sender?.toHex() ?? '',
        recipient: p.recipient?.toHex() ?? '',
        token: p.token?.toHex() ?? '',
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

const POLL_INTERVAL = 10_000; // 10 seconds

export function useStream(streamId: number | null): {
    stream: StreamData | null;
    withdrawable: bigint;
    loading: boolean;
    error: string | null;
    refresh: () => void;
} {
    const { network } = useNetwork();
    const [stream, setStream] = useState<StreamData | null>(null);
    const [withdrawable, setWithdrawable] = useState<bigint>(0n);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchStream = useCallback(async () => {
        if (streamId === null || streamId <= 0) {
            setStream(null);
            setWithdrawable(0n);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const contract = contractService.getStreamContract(network);

            // Fetch stream data
            const streamResult = await contract.getStream(BigInt(streamId));
            if (streamResult.revert) {
                throw new Error(`getStream reverted: ${streamResult.revert}`);
            }
            const parsed = parseStreamProperties(
                streamId,
                streamResult.properties as unknown as RawStreamProperties,
            );
            setStream(parsed);

            // Fetch withdrawable amount
            const wResult = await contract.getWithdrawable(BigInt(streamId));
            if (wResult.revert) {
                throw new Error(`getWithdrawable reverted: ${wResult.revert}`);
            }
            setWithdrawable(wResult.properties.withdrawable ?? 0n);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to fetch stream';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [streamId, network]);

    // Poll withdrawable every 10 seconds
    const pollWithdrawable = useCallback(async () => {
        if (streamId === null || streamId <= 0) return;
        try {
            const contract = contractService.getStreamContract(network);
            const wResult = await contract.getWithdrawable(BigInt(streamId));
            if (!wResult.revert) {
                setWithdrawable(wResult.properties.withdrawable ?? 0n);
            }
        } catch {
            // Silently ignore polling errors
        }
    }, [streamId, network]);

    // Initial fetch
    useEffect(() => {
        void fetchStream();
    }, [fetchStream]);

    // Set up polling interval
    useEffect(() => {
        if (streamId === null || streamId <= 0) return;

        intervalRef.current = setInterval(() => {
            void pollWithdrawable();
        }, POLL_INTERVAL);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [streamId, pollWithdrawable]);

    return { stream, withdrawable, loading, error, refresh: fetchStream };
}
