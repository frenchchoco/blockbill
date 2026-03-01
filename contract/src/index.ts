import { Blockchain } from '@btc-vision/btc-runtime/runtime';
import { BlockBillContract } from './BlockBillContract';
import { revertOnError } from '@btc-vision/btc-runtime/runtime/abort/abort';

Blockchain.contract = (): BlockBillContract => {
    return new BlockBillContract();
};

export function abort(message: string, fileName: string, line: u32, column: u32): void {
    revertOnError(message, fileName, line, column);
}
