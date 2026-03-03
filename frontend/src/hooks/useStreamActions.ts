import { useState, useCallback } from 'react';
import { useWalletConnect } from '@btc-vision/walletconnect';
import type { Address } from '@btc-vision/transaction';
import { useNetwork } from './useNetwork';
import { contractService } from '../services/ContractService';
import { getTxGasParams } from '../config/networks';

export function useStreamActions(): {
    createStream: (recipient: Address, token: Address, totalAmount: bigint, ratePerBlock: bigint, endBlock: bigint) => Promise<bigint>;
    withdraw: (streamId: bigint) => Promise<bigint>;
    withdrawTo: (streamId: bigint, to: Address) => Promise<bigint>;
    topUp: (streamId: bigint, amount: bigint) => Promise<void>;
    cancel: (streamId: bigint) => Promise<void>;
    pause: (streamId: bigint) => Promise<void>;
    resume: (streamId: bigint) => Promise<void>;
    loading: boolean;
} {
    const { walletAddress, address } = useWalletConnect();
    const { network } = useNetwork();
    const [loading, setLoading] = useState(false);

    const ensureConnected = useCallback((): { addr: Address; wallet: string } => {
        if (!address || !walletAddress) {
            throw new Error('Wallet not connected');
        }
        return { addr: address, wallet: walletAddress };
    }, [address, walletAddress]);

    const createStream = useCallback(
        async (
            recipient: Address, token: Address, totalAmount: bigint,
            ratePerBlock: bigint, endBlock: bigint,
        ): Promise<bigint> => {
            const { addr, wallet } = ensureConnected();
            setLoading(true);
            try {
                const contract = contractService.getStreamContract(network, addr);
                const simulation = await contract.createStream(
                    recipient, token, totalAmount, ratePerBlock, endBlock,
                );

                if (simulation.revert) {
                    throw new Error(`createStream reverted: ${simulation.revert}`);
                }

                await simulation.sendTransaction({
                    signer: null,
                    mldsaSigner: null,
                    refundTo: wallet,
                    ...getTxGasParams(network),
                    network,
                });

                return simulation.properties.streamId;
            } finally {
                setLoading(false);
            }
        },
        [network, ensureConnected],
    );

    const withdraw = useCallback(
        async (streamId: bigint): Promise<bigint> => {
            const { addr, wallet } = ensureConnected();
            setLoading(true);
            try {
                const contract = contractService.getStreamContract(network, addr);
                const simulation = await contract.withdraw(streamId);

                if (simulation.revert) {
                    throw new Error(`withdraw reverted: ${simulation.revert}`);
                }

                await simulation.sendTransaction({
                    signer: null,
                    mldsaSigner: null,
                    refundTo: wallet,
                    ...getTxGasParams(network),
                    network,
                });

                return simulation.properties.amount;
            } finally {
                setLoading(false);
            }
        },
        [network, ensureConnected],
    );

    const withdrawTo = useCallback(
        async (streamId: bigint, to: Address): Promise<bigint> => {
            const { addr, wallet } = ensureConnected();
            setLoading(true);
            try {
                const contract = contractService.getStreamContract(network, addr);
                const simulation = await contract.withdrawTo(streamId, to);

                if (simulation.revert) {
                    throw new Error(`withdrawTo reverted: ${simulation.revert}`);
                }

                await simulation.sendTransaction({
                    signer: null,
                    mldsaSigner: null,
                    refundTo: wallet,
                    ...getTxGasParams(network),
                    network,
                });

                return simulation.properties.amount;
            } finally {
                setLoading(false);
            }
        },
        [network, ensureConnected],
    );

    const topUp = useCallback(
        async (streamId: bigint, amount: bigint): Promise<void> => {
            const { addr, wallet } = ensureConnected();
            setLoading(true);
            try {
                const contract = contractService.getStreamContract(network, addr);
                const simulation = await contract.topUp(streamId, amount);

                if (simulation.revert) {
                    throw new Error(`topUp reverted: ${simulation.revert}`);
                }

                await simulation.sendTransaction({
                    signer: null,
                    mldsaSigner: null,
                    refundTo: wallet,
                    ...getTxGasParams(network),
                    network,
                });
            } finally {
                setLoading(false);
            }
        },
        [network, ensureConnected],
    );

    const cancel = useCallback(
        async (streamId: bigint): Promise<void> => {
            const { addr, wallet } = ensureConnected();
            setLoading(true);
            try {
                const contract = contractService.getStreamContract(network, addr);
                const simulation = await contract.cancelStream(streamId);

                if (simulation.revert) {
                    throw new Error(`cancelStream reverted: ${simulation.revert}`);
                }

                await simulation.sendTransaction({
                    signer: null,
                    mldsaSigner: null,
                    refundTo: wallet,
                    ...getTxGasParams(network),
                    network,
                });
            } finally {
                setLoading(false);
            }
        },
        [network, ensureConnected],
    );

    const pause = useCallback(
        async (streamId: bigint): Promise<void> => {
            const { addr, wallet } = ensureConnected();
            setLoading(true);
            try {
                const contract = contractService.getStreamContract(network, addr);
                const simulation = await contract.pauseStream(streamId);

                if (simulation.revert) {
                    throw new Error(`pauseStream reverted: ${simulation.revert}`);
                }

                await simulation.sendTransaction({
                    signer: null,
                    mldsaSigner: null,
                    refundTo: wallet,
                    ...getTxGasParams(network),
                    network,
                });
            } finally {
                setLoading(false);
            }
        },
        [network, ensureConnected],
    );

    const resume = useCallback(
        async (streamId: bigint): Promise<void> => {
            const { addr, wallet } = ensureConnected();
            setLoading(true);
            try {
                const contract = contractService.getStreamContract(network, addr);
                const simulation = await contract.resumeStream(streamId);

                if (simulation.revert) {
                    throw new Error(`resumeStream reverted: ${simulation.revert}`);
                }

                await simulation.sendTransaction({
                    signer: null,
                    mldsaSigner: null,
                    refundTo: wallet,
                    ...getTxGasParams(network),
                    network,
                });
            } finally {
                setLoading(false);
            }
        },
        [network, ensureConnected],
    );

    return { createStream, withdraw, withdrawTo, topUp, cancel, pause, resume, loading };
}
