import { useMemo } from 'react';
import { AddressVerificator } from '@btc-vision/transaction';
import type { Network } from '@btc-vision/bitcoin';

export interface AddressValidation {
    readonly isValid: boolean;
    readonly type: string | null;
    readonly error: string | null;
}

export function useAddressValidation(address: string, network: Network): AddressValidation {
    return useMemo(() => {
        if (!address) {
            return { isValid: false, type: null, error: null };
        }

        // 0x hex = public key / contract hash
        if (address.startsWith('0x') || address.startsWith('0X')) {
            const isValid = AddressVerificator.isValidPublicKey(address, network);
            return { isValid, type: isValid ? 'publicKey' : null, error: isValid ? null : 'Invalid hex address' };
        }

        // Detect Bitcoin / OPNet address type
        const type = AddressVerificator.detectAddressType(address, network);
        if (type) {
            return { isValid: true, type, error: null };
        }

        return { isValid: false, type: null, error: 'Invalid address' };
    }, [address, network]);
}
