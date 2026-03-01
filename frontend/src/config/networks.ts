import { networks } from '@btc-vision/bitcoin';
import type { Network } from '@btc-vision/bitcoin';

export interface NetworkConfig {
    readonly name: string;
    readonly rpcUrl: string;
    readonly explorerUrl: string;
}

const NETWORK_CONFIGS: Map<Network, NetworkConfig> = new Map([
    [networks.bitcoin, {
        name: 'Mainnet',
        rpcUrl: 'https://mainnet.opnet.org',
        explorerUrl: 'https://explorer.opnet.org',
    }],
    [networks.opnetTestnet, {
        name: 'OPNet Testnet',
        rpcUrl: 'https://testnet.opnet.org',
        explorerUrl: 'https://testnet-explorer.opnet.org',
    }],
    [networks.regtest, {
        name: 'Regtest',
        rpcUrl: 'http://localhost:9001',
        explorerUrl: 'http://localhost:3000',
    }],
]);

export function getRpcUrl(network: Network): string {
    const config = NETWORK_CONFIGS.get(network);
    if (!config) {
        throw new Error('Unsupported network');
    }
    return config.rpcUrl;
}

export function getNetworkName(network: Network): string {
    return NETWORK_CONFIGS.get(network)?.name ?? 'Unknown';
}
