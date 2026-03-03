import { useState, useEffect, useCallback } from 'react';
import { networks } from '@btc-vision/bitcoin';
import type { Network } from '@btc-vision/bitcoin';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { contractService } from '../services/ContractService';
import { refreshGasParams } from '../config/networks';

export function useNetwork(): {
    network: Network;
    switchNetwork: (n: Network) => void;
    isConnected: boolean;
} {
    const { network: walletNetwork, walletAddress } = useWalletConnect();
    const [network, setNetwork] = useState<Network>(networks.opnetTestnet);

    // Pre-fetch gas params on mount and when network changes
    useEffect(() => {
        void refreshGasParams(network);
    }, [network]);

    useEffect(() => {
        if (walletAddress && walletNetwork) {
            if (walletNetwork !== network) {
                contractService.clearCache();
                setNetwork(walletNetwork);
            }
        }
    }, [walletNetwork, walletAddress, network]);

    const switchNetwork = useCallback((newNetwork: Network) => {
        contractService.clearCache();
        setNetwork(newNetwork);
    }, []);

    return { network, switchNetwork, isConnected: !!walletAddress };
}
