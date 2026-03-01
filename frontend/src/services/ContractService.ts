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
    private readonly resolvedAddresses: Map<string, Address> = new Map();

    private constructor() {}

    public static getInstance(): ContractService {
        if (!ContractService.instance) {
            ContractService.instance = new ContractService();
        }
        return ContractService.instance;
    }

    /**
     * Resolve a string address to an Address object.
     * - Hex (0x…) → Address.fromString directly
     * - P2OP / bech32 → resolve via provider.getPublicKeysInfo (cached)
     */
    private async resolveAddress(addr: string, network: Network): Promise<Address> {
        const cached = this.resolvedAddresses.get(addr);
        if (cached) return cached;

        if (addr.startsWith('0x') || addr.startsWith('0X')) {
            const resolved = Address.fromString(addr);
            this.resolvedAddresses.set(addr, resolved);
            return resolved;
        }

        // P2OP / taproot / segwit: resolve via RPC
        const provider = providerService.getProvider(network);
        const infoMap = await provider.getPublicKeysInfo(addr, true);
        const resolved = Object.values(infoMap)[0];
        if (!resolved) {
            throw new Error(`Could not resolve address: ${addr}`);
        }
        this.resolvedAddresses.set(addr, resolved);
        return resolved;
    }

    public async getBlockBillContract(network: Network, sender?: Address): Promise<IBlockBillContract> {
        const addressStr = getBlockBillAddress(network);
        const key = `blockbill:${addressStr}:${sender?.toString() ?? 'none'}`;
        const existing = this.contracts.get(key) as IBlockBillContract | undefined;
        if (existing) {
            return existing;
        }
        const provider = providerService.getProvider(network);
        const contractAddress = await this.resolveAddress(addressStr, network);
        const contract = getContract<IBlockBillContract>(
            contractAddress, BLOCKBILL_ABI, provider, network, sender
        );
        this.contracts.set(key, contract);
        return contract;
    }

    public async getTokenContract(tokenAddress: string, network: Network, sender?: Address): Promise<IOP20Contract> {
        const key = `token:${tokenAddress}:${sender?.toString() ?? 'none'}`;
        const existing = this.contracts.get(key) as IOP20Contract | undefined;
        if (existing) {
            return existing;
        }
        const provider = providerService.getProvider(network);
        const contractAddress = await this.resolveAddress(tokenAddress, network);
        const contract = getContract<IOP20Contract>(
            contractAddress, OP_20_ABI, provider, network, sender
        );
        this.contracts.set(key, contract);
        return contract;
    }

    public clearCache(): void {
        this.contracts.clear();
        this.resolvedAddresses.clear();
    }
}

export const contractService = ContractService.getInstance();
