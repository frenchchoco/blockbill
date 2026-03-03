import { networks } from '@btc-vision/bitcoin';
import type { Network } from '@btc-vision/bitcoin';
import { networkKey } from './networks';

export interface ContractAddresses {
    readonly blockbill: string;
    readonly blockbillStream: string;
}

const CONTRACT_ADDRESSES: Record<string, ContractAddresses> = {
    [networkKey(networks.opnetTestnet)]: {
        blockbill: '0xd22b26a44ad94e1aad32544f52a138e631d8e3689a65938d6b08cb555bfd74ef',
        blockbillStream: '0x0c2d04acfa8f1e78c542e024dc1468d27f5dfa156a82864cf2b838ebd65219ed',
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
