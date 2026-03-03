import { networks } from '@btc-vision/bitcoin';
import type { Network } from '@btc-vision/bitcoin';
import { networkKey } from './networks';

export interface ContractAddresses {
    readonly blockbill: string;
    readonly blockbillStream: string;
}

const CONTRACT_ADDRESSES: Record<string, ContractAddresses> = {
    [networkKey(networks.opnetTestnet)]: {
        blockbill: '0xfd9fea46fc9eec81287dcdd239b913322690ac70ea65425ee362c0f13d5f9c7a',
        blockbillStream: '0xa4545356dc987d44ba3d95924616fa254658058ae3d39bd36b320baca04feaec',
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
