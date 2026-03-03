import { useSyncExternalStore, useEffect } from 'react';
import type { Network } from '@btc-vision/bitcoin';
import { useNetwork } from './useNetwork';
import { providerService } from '../services/ProviderService';

/**
 * Shared block-number store — one poll for the entire app.
 * All components that call useBlockNumber() share the same value
 * and re-render together when a new block is detected.
 */

const POLL_INTERVAL = 15_000; // 15 s

interface BlockStore {
    blockNumber: bigint;
    network: Network | null;
    intervalId: ReturnType<typeof setInterval> | null;
    listeners: Set<() => void>;
}

const store: BlockStore = {
    blockNumber: 0n,
    network: null,
    intervalId: null,
    listeners: new Set(),
};

function emitChange(): void {
    for (const listener of store.listeners) listener();
}

async function fetchBlockNumber(): Promise<void> {
    try {
        if (!store.network) return;
        const provider = providerService.getProvider(store.network);
        const num = await provider.getBlockNumber();
        if (num !== store.blockNumber) {
            store.blockNumber = num;
            emitChange();
        }
    } catch {
        // Will retry on next poll
    }
}

function ensurePolling(network: Network): void {
    if (store.network !== network) {
        store.blockNumber = 0n;
        store.network = network;
        if (store.intervalId) {
            clearInterval(store.intervalId);
            store.intervalId = null;
        }
        emitChange();
    }
    if (!store.intervalId && store.listeners.size > 0) {
        void fetchBlockNumber();
        store.intervalId = setInterval(() => void fetchBlockNumber(), POLL_INTERVAL);
    }
}

function subscribe(listener: () => void): () => void {
    store.listeners.add(listener);
    // Start polling if this is the first subscriber
    if (store.listeners.size === 1 && !store.intervalId && store.network) {
        void fetchBlockNumber();
        store.intervalId = setInterval(() => void fetchBlockNumber(), POLL_INTERVAL);
    }
    return () => {
        store.listeners.delete(listener);
        if (store.listeners.size === 0 && store.intervalId) {
            clearInterval(store.intervalId);
            store.intervalId = null;
        }
    };
}

function getSnapshot(): bigint {
    return store.blockNumber;
}

/**
 * Returns the current block number. Polls every 15 s.
 * All components share the same block number — a single RPC poll
 * drives re-renders across Dashboard, InvoiceView, PayInvoice, etc.
 */
export function useBlockNumber(): bigint {
    const { network } = useNetwork();

    useEffect(() => {
        ensurePolling(network);
    }, [network]);

    return useSyncExternalStore(subscribe, getSnapshot);
}
