import { JSONRpcProvider } from 'opnet';
import { networks } from '@btc-vision/bitcoin';
import type { Network } from '@btc-vision/bitcoin';
import { getRpcUrl } from '../config/networks';

class ProviderService {
    private static instance: ProviderService;
    private readonly providers: Map<string, JSONRpcProvider> = new Map();

    private constructor() {}

    public static getInstance(): ProviderService {
        if (!ProviderService.instance) {
            ProviderService.instance = new ProviderService();
        }
        return ProviderService.instance;
    }

    public getProvider(network: Network): JSONRpcProvider {
        const networkId = this.getNetworkId(network);
        const existing = this.providers.get(networkId);
        if (existing) {
            return existing;
        }
        const rpcUrl = getRpcUrl(network);
        const provider = new JSONRpcProvider({ url: rpcUrl, network });
        this.providers.set(networkId, provider);
        return provider;
    }

    private getNetworkId(network: Network): string {
        if (network === networks.bitcoin) return 'mainnet';
        if (network === networks.opnetTestnet) return 'testnet';
        if (network === networks.regtest) return 'regtest';
        return 'unknown';
    }
}

export const providerService = ProviderService.getInstance();
