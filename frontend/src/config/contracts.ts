import { networks } from '@btc-vision/bitcoin';
import type { Network } from '@btc-vision/bitcoin';

export interface ContractAddresses {
    readonly blockbill: string;
}

function networkKey(n: Network): string {
    return n.bech32Opnet ?? n.bech32;
}

// Keyed by bech32Opnet (taproot) prefix to avoid reference comparison issues
const CONTRACT_ADDRESSES: Record<string, ContractAddresses> = {
    [networkKey(networks.opnetTestnet)]: {
        blockbill: 'opt1sqqq495j4xkedr2vec7lpueh46xgwgal6aqvjqxrj',
    },
    [networkKey(networks.regtest)]: {
        blockbill: '',
    },
    [networkKey(networks.bitcoin)]: {
        blockbill: '',
    },
};

export function getBlockBillAddress(network: Network): string {
    const key = networkKey(network);
    const addresses = CONTRACT_ADDRESSES[key];
    if (!addresses) {
        throw new Error(`No addresses configured for network (key=${key})`);
    }
    if (!addresses.blockbill) {
        throw new Error('BlockBill contract not deployed on this network');
    }
    return addresses.blockbill;
}
