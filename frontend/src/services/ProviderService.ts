import { JSONRpcProvider } from 'opnet';
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
        const key = network.bech32Opnet ?? network.bech32;
        const existing = this.providers.get(key);
        if (existing) {
            return existing;
        }
        const rpcUrl = getRpcUrl(network);
        const provider = new JSONRpcProvider({ url: rpcUrl, network });
        this.providers.set(key, provider);
        return provider;
    }
}

export const providerService = ProviderService.getInstance();
