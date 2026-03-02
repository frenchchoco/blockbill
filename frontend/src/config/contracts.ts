import { networks } from '@btc-vision/bitcoin';
import type { Network } from '@btc-vision/bitcoin';
import { networkKey } from './networks';

export interface ContractAddresses {
    readonly blockbill: string;
    readonly blockbillStream: string;
}

const CONTRACT_ADDRESSES: Record<string, ContractAddresses> = {
    [networkKey(networks.opnetTestnet)]: {
        blockbill: '0xdf98b77330b8a2594b28dcb43651cc5cd8c8797aed77316d5d8a7f53fc57153a',
        blockbillStream: '',
    },
    [networkKey(networks.regtest)]: {
        blockbill: '',
        blockbillStream: '',
    },
    [networkKey(networks.bitcoin)]: {
        blockbill: '',
        blockbillStream: '',
    },
};

export function getBlockBillAddress(network: Network): string {
    const addresses = CONTRACT_ADDRESSES[networkKey(network)];
    if (!addresses) {
        throw new Error(`No addresses configured for network (key=${networkKey(network)})`);
    }
    if (!addresses.blockbill) {
        throw new Error('BlockBill contract not deployed on this network');
    }
    return addresses.blockbill;
}

export function getBlockBillStreamAddress(network: Network): string {
    const addresses = CONTRACT_ADDRESSES[networkKey(network)];
    if (!addresses) {
        throw new Error(`No addresses configured for network (key=${networkKey(network)})`);
    }
    if (!addresses.blockbillStream) {
        throw new Error('BlockBillStream contract not deployed on this network');
    }
    return addresses.blockbillStream;
}
