import { networks } from '@btc-vision/bitcoin';
import type { Network } from '@btc-vision/bitcoin';
import { networkKey } from './networks';

export interface ContractAddresses {
    readonly blockbill: string;
}

const CONTRACT_ADDRESSES: Record<string, ContractAddresses> = {
    [networkKey(networks.opnetTestnet)]: {
        blockbill: '0x9c4a95f674e5037f581885f0da7d76cc4ca0f8116d467891e09a7313f956b7e6',
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
