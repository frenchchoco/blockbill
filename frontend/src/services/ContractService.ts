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

    private constructor() {}

    public static getInstance(): ContractService {
        if (!ContractService.instance) {
            ContractService.instance = new ContractService();
        }
        return ContractService.instance;
    }

    public getBlockBillContract(network: Network, sender?: Address): IBlockBillContract {
        const addressStr = getBlockBillAddress(network);
        const key = `blockbill:${addressStr}:${sender?.toString() ?? 'none'}`;
        const existing = this.contracts.get(key) as IBlockBillContract | undefined;
        if (existing) {
            return existing;
        }
        const provider = providerService.getProvider(network);
        const contractAddress = Address.fromString(addressStr);
        const contract = getContract<IBlockBillContract>(
            contractAddress, BLOCKBILL_ABI, provider, network, sender
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
        const contractAddress = Address.fromString(tokenAddress);
        const contract = getContract<IOP20Contract>(
            contractAddress, OP_20_ABI, provider, network, sender
        );
        this.contracts.set(key, contract);
        return contract;
    }

    public clearCache(): void {
        this.contracts.clear();
    }
}

export const contractService = ContractService.getInstance();
