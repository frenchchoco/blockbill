import { networks } from '@btc-vision/bitcoin';
import type { Network } from '@btc-vision/bitcoin';

export interface NetworkConfig {
    readonly name: string;
    readonly rpcUrl: string;
    readonly explorerUrl: string;
}

function networkKey(n: Network): string {
    return n.bech32Opnet ?? n.bech32;
}

const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
    [networkKey(networks.bitcoin)]: {
        name: 'Mainnet',
        rpcUrl: 'https://mainnet.opnet.org',
        explorerUrl: 'https://explorer.opnet.org',
    },
    [networkKey(networks.opnetTestnet)]: {
        name: 'OPNet Testnet',
        rpcUrl: 'https://testnet.opnet.org',
        explorerUrl: 'https://testnet-explorer.opnet.org',
    },
    [networkKey(networks.regtest)]: {
        name: 'Regtest',
        rpcUrl: 'http://localhost:9001',
        explorerUrl: 'http://localhost:3000',
    },
};

export function getRpcUrl(network: Network): string {
    const config = NETWORK_CONFIGS[networkKey(network)];
    if (!config) {
        throw new Error(`Unsupported network (key=${networkKey(network)})`);
    }
    return config.rpcUrl;
}

export function getNetworkName(network: Network): string {
    const config = NETWORK_CONFIGS[networkKey(network)];
    return config?.name ?? 'Unknown';
}
