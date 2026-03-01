import { useState, useCallback, useMemo } from 'react';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { Address } from '@btc-vision/transaction';
import { getContract, OP_20_ABI } from 'opnet';
import type { IOP20Contract } from 'opnet';
import { useNetwork } from './useNetwork';
import { providerService } from '../services/ProviderService';
import { getBlockBillAddress } from '../config/contracts';

const MAX_UINT256 = 2n ** 256n - 1n;

interface UseTokenApprovalReturn {
    readonly checkAllowance: (tokenAddress: string) => Promise<bigint>;
    readonly approve: (tokenAddress: string, amount?: bigint) => Promise<string>;
    readonly loading: boolean;
    readonly error: string | null;
}

export function useTokenApproval(): UseTokenApprovalReturn {
    const { walletAddress, address } = useWalletConnect();
    const { network } = useNetwork();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const spenderAddress = useMemo((): Address => {
        const hex = getBlockBillAddress(network);
        return Address.fromString(hex);
    }, [network]);

    const checkAllowance = useCallback(
        async (tokenAddress: string): Promise<bigint> => {
            if (!address) {
                throw new Error('Wallet not connected');
            }

            const provider = providerService.getProvider(network);
            const tokenContract = getContract<IOP20Contract>(
                tokenAddress, OP_20_ABI, provider, network,
            );

            const result = await tokenContract.allowance(address, spenderAddress);

            if (result.revert) {
                throw new Error(`Allowance check reverted: ${result.revert}`);
            }

            return result.properties.remaining;
        },
        [address, network, spenderAddress],
    );

    const approve = useCallback(
        async (tokenAddress: string, amount: bigint = MAX_UINT256): Promise<string> => {
            setLoading(true);
            setError(null);
            try {
                if (!address || !walletAddress) {
                    throw new Error('Wallet not connected');
                }

                const provider = providerService.getProvider(network);
                const tokenContract = getContract<IOP20Contract>(
                    tokenAddress, OP_20_ABI, provider, network, address,
                );

                const simulation = await tokenContract.increaseAllowance(spenderAddress, amount);

                if (simulation.revert) {
                    throw new Error(`Approval simulation reverted: ${simulation.revert}`);
                }

                const receipt = await simulation.sendTransaction({
                    signer: null,
                    mldsaSigner: null,
                    refundTo: walletAddress,
                    maximumAllowedSatToSpend: 100_000n,
                    network,
                });

                return receipt.transactionId;
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Unknown error during token approval';
                setError(msg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [address, walletAddress, network, spenderAddress],
    );

    return { checkAllowance, approve, loading, error };
}
