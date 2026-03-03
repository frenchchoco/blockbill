import { useState, useEffect, useCallback, useRef } from 'react';
import { useNetwork } from './useNetwork';
import { contractService } from '../services/ContractService';
import type { StreamData } from '../types/stream';
import { parseStreamProperties } from '../utils/streamParser';

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
                streamResult.properties,
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
