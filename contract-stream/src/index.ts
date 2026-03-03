import { Blockchain } from '@btc-vision/btc-runtime/runtime';
import { BlockBillStreamContract } from './BlockBillStreamContract';
import { revertOnError } from '@btc-vision/btc-runtime/runtime/abort/abort';

Blockchain.contract = (): BlockBillStreamContract => {
    return new BlockBillStreamContract();
};

export * from '@btc-vision/btc-runtime/runtime/exports';

export function abort(message: string, fileName: string, line: u32, column: u32): void {
    revertOnError(message, fileName, line, column);
}
