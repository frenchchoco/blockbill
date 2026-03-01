import { networks } from '@btc-vision/bitcoin';
import type { Network } from '@btc-vision/bitcoin';

export interface ContractAddresses {
    readonly blockbill: string;
}

const CONTRACT_ADDRESSES: Map<Network, ContractAddresses> = new Map([
    [networks.opnetTestnet, {
        blockbill: '', // Will be filled after testnet deployment
    }],
    [networks.regtest, {
        blockbill: '', // Will be filled after regtest deployment
    }],
    [networks.bitcoin, {
        blockbill: '', // Mainnet — future
    }],
]);

export function getBlockBillAddress(network: Network): string {
    const addresses = CONTRACT_ADDRESSES.get(network);
    if (!addresses) {
        throw new Error('No addresses configured for this network');
    }
    if (!addresses.blockbill) {
        throw new Error('BlockBill contract not deployed on this network');
    }
    return addresses.blockbill;
}
