import { getContract, OP_20_ABI } from 'opnet';
import type { IOP20Contract } from 'opnet';
import type { Network } from '@btc-vision/bitcoin';
import { Address } from '@btc-vision/transaction';
import { providerService } from './ProviderService';
import { BLOCKBILL_ABI } from '../abi/BlockBillABI';
import type { IBlockBillContract } from '../abi/BlockBillABI';
import { getBlockBillAddress } from '../config/contracts';

class ContractService {
    private static instance: ContractService;
    private readonly contracts: Map<string, unknown> = new Map();
    private readonly addressCache: Map<string, Address> = new Map();

    private constructor() {}

    public static getInstance(): ContractService {
        if (!ContractService.instance) {
            ContractService.instance = new ContractService();
        }
        return ContractService.instance;
    }

    /**
     * Resolve any address format to an Address object.
     * - 0x hex strings: Address.fromString() directly (no RPC)
     * - P2OP / taproot / bech32: resolve via provider.getPublicKeyInfo() RPC
     */
    public async resolveAddress(addr: string, network: Network, isContract: boolean = false): Promise<Address> {
        const cacheKey = `${addr}:${isContract}`;
        const cached = this.addressCache.get(cacheKey);
        if (cached) return cached;

        let resolved: Address;

        if (addr.startsWith('0x') || addr.startsWith('0X')) {
            resolved = Address.fromString(addr);
        } else {
            const provider = providerService.getProvider(network);
            const infoMap = await provider.getPublicKeysInfo(addr, isContract);
            const first = Object.values(infoMap)[0];
            if (!first) {
                throw new Error(`Could not resolve address: ${addr}`);
            }
            resolved = first;
        }

        this.addressCache.set(cacheKey, resolved);
        return resolved;
    }

    public getBlockBillContract(network: Network, sender?: Address): IBlockBillContract {
        const address = getBlockBillAddress(network);
        const key = `blockbill:${address}:${sender?.toString() ?? 'none'}`;
        const existing = this.contracts.get(key) as IBlockBillContract | undefined;
        if (existing) {
            return existing;
        }
        const provider = providerService.getProvider(network);
        const contract = getContract<IBlockBillContract>(
            address, BLOCKBILL_ABI, provider, network, sender
        );
        this.contracts.set(key, contract);
        return contract;
    }

    public getTokenContract(tokenAddress: string, network: Network, sender?: Address): IOP20Contract {
        const key = `token:${tokenAddress}:${sender?.toString() ?? 'none'}`;
        const existing = this.contracts.get(key) as IOP20Contract | undefined;
        if (existing) {
            return existing;
        }
        const provider = providerService.getProvider(network);
        const contract = getContract<IOP20Contract>(
            tokenAddress, OP_20_ABI, provider, network, sender
        );
        this.contracts.set(key, contract);
        return contract;
    }

    public clearCache(): void {
        this.contracts.clear();
        this.addressCache.clear();
    }
}

export const contractService = ContractService.getInstance();
