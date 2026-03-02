import { useState, useEffect } from 'react';
import { useNetwork } from './useNetwork';
import { providerService } from '../services/ProviderService';

/**
 * Fetches the current block number and polls every 30s.
 */
export function useBlockNumber(): bigint {
    const { network } = useNetwork();
    const [blockNumber, setBlockNumber] = useState<bigint>(0n);

    useEffect(() => {
        let cancelled = false;

        const fetch = async (): Promise<void> => {
            try {
                const provider = providerService.getProvider(network);
                const num = await provider.getBlockNumber();
                if (!cancelled) setBlockNumber(num);
            } catch {
                // ignore — will retry on next poll
            }
        };

        void fetch();
        const interval = setInterval(() => void fetch(), 30_000);
        return () => { cancelled = true; clearInterval(interval); };
    }, [network]);

    return blockNumber;
}
