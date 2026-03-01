import { networks } from '@btc-vision/bitcoin';
import type { Network } from '@btc-vision/bitcoin';
import { networkKey } from './networks';

export interface ContractAddresses {
    readonly blockbill: string;
}

const CONTRACT_ADDRESSES: Record<string, ContractAddresses> = {
    [networkKey(networks.opnetTestnet)]: {
        blockbill: '0x8e02035a4c880801b76fd1b7734609fd5a2b2400ec89edf4e7e2a7f38d2a072a',
    },
    [networkKey(networks.regtest)]: {
        blockbill: '',
    },
    [networkKey(networks.bitcoin)]: {
        blockbill: '',
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
