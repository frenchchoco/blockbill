import { u256 } from '@btc-vision/as-bignum/assembly';
import {
    Address,
    Blockchain,
    BytesWriter,
    Calldata,
    encodeSelector,
    OP_NET,
    Revert,
    Selector,
    SafeMath,
    StoredU256,
} from '@btc-vision/btc-runtime/runtime';

const STATUS_PENDING: u8 = 0;
const STATUS_PAID: u8 = 1;
const STATUS_CANCELLED: u8 = 3;

const FEE_BPS: u256 = u256.fromU32(50);
const BPS_DENOMINATOR: u256 = u256.fromU32(10000);
const MAX_LINE_ITEMS: u32 = 10;

export class BlockBillContract extends OP_NET {
    // Selectors
    private readonly createInvoiceSelector: Selector = encodeSelector('createInvoice(address,uint256,address,string,uint64,uint16)');
    private readonly payInvoiceSelector: Selector = encodeSelector('payInvoice(uint256)');
    private readonly cancelInvoiceSelector: Selector = encodeSelector('cancelInvoice(uint256)');
    private readonly markAsPaidBTCSelector: Selector = encodeSelector('markAsPaidBTC(uint256,string)');
    private readonly getInvoiceSelector: Selector = encodeSelector('getInvoice(uint256)');
    private readonly getLineItemsSelector: Selector = encodeSelector('getLineItems(uint256)');
    private readonly getInvoicesByCreatorSelector: Selector = encodeSelector('getInvoicesByCreator(address)');
    private readonly getInvoicesByRecipientSelector: Selector = encodeSelector('getInvoicesByRecipient(address)');
    private readonly setFeeRecipientSelector: Selector = encodeSelector('setFeeRecipient(address)');
    private readonly getInvoiceCountSelector: Selector = encodeSelector('getInvoiceCount()');

    // Storage pointers
    private readonly invoiceCountPointer: u16 = Blockchain.nextPointer;
    private readonly feeRecipientPointer: u16 = Blockchain.nextPointer;
    private readonly ownerPointer: u16 = Blockchain.nextPointer;

    // Per-invoice field pointers (keyed by invoiceId)
    private readonly pCreator: u16 = Blockchain.nextPointer;
    private readonly pToken: u16 = Blockchain.nextPointer;
    private readonly pTotalAmount: u16 = Blockchain.nextPointer;
    private readonly pRecipient: u16 = Blockchain.nextPointer;
    private readonly pMemo: u16 = Blockchain.nextPointer;
    private readonly pDeadline: u16 = Blockchain.nextPointer;
    private readonly pTaxBps: u16 = Blockchain.nextPointer;
    private readonly pStatus: u16 = Blockchain.nextPointer;
    private readonly pPaidBy: u16 = Blockchain.nextPointer;
    private readonly pPaidAtBlock: u16 = Blockchain.nextPointer;
    private readonly pCreatedAtBlock: u16 = Blockchain.nextPointer;
    private readonly pBtcTxHash: u16 = Blockchain.nextPointer;
    private readonly pLineItemCount: u16 = Blockchain.nextPointer;

    // Line item field pointers (keyed by invoiceId * MAX_LINE_ITEMS + index)
    private readonly pLineDesc: u16 = Blockchain.nextPointer;
    private readonly pLineAmount: u16 = Blockchain.nextPointer;

    // Index pointers: creator/recipient invoice counts + lists
    private readonly pCreatorCount: u16 = Blockchain.nextPointer;
    private readonly pCreatorList: u16 = Blockchain.nextPointer;
    private readonly pRecipientCount: u16 = Blockchain.nextPointer;
    private readonly pRecipientList: u16 = Blockchain.nextPointer;

    // Stored values
    private readonly invoiceCount: StoredU256 = new StoredU256(this.invoiceCountPointer, u256.Zero);

    public constructor() {
        super();
    }

    public override onDeployment(_calldata: Calldata): void {
        // Store deployer as owner and fee recipient
        const deployer: Address = Blockchain.tx.sender;
        Blockchain.setStorageAt(this.ownerPointer, u256.Zero, deployer.toU256());
        Blockchain.setStorageAt(this.feeRecipientPointer, u256.Zero, deployer.toU256());
    }

    public override callMethod(calldata: Calldata): BytesWriter {
        const selector: Selector = calldata.readSelector();

        switch (selector) {
            case this.createInvoiceSelector:
                return this.createInvoice(calldata);
            case this.payInvoiceSelector:
                return this.payInvoice(calldata);
            case this.cancelInvoiceSelector:
                return this.cancelInvoice(calldata);
            case this.markAsPaidBTCSelector:
                return this.markAsPaidBTC(calldata);
            case this.getInvoiceSelector:
                return this._getInvoice(calldata);
            case this.getLineItemsSelector:
                return this._getLineItems(calldata);
            case this.getInvoicesByCreatorSelector:
                return this._getInvoicesByCreator(calldata);
            case this.getInvoicesByRecipientSelector:
                return this._getInvoicesByRecipient(calldata);
            case this.setFeeRecipientSelector:
                return this._setFeeRecipient(calldata);
            case this.getInvoiceCountSelector:
                return this._getInvoiceCount(calldata);
            default:
                return super.callMethod(calldata);
        }
    }

    // === Storage helpers ===

    protected storeAddressAt(pointer: u16, key: u256, addr: Address): void {
        Blockchain.setStorageAt(pointer, key, addr.toU256());
    }

    protected loadAddressAt(pointer: u16, key: u256): Address {
        const val: u256 = Blockchain.getStorageAt(pointer, key);
        return Address.fromU256(val);
    }

    protected storeU256At(pointer: u16, key: u256, value: u256): void {
        Blockchain.setStorageAt(pointer, key, value);
    }

    protected loadU256At(pointer: u16, key: u256): u256 {
        return Blockchain.getStorageAt(pointer, key);
    }

    // For u8/u16/u64, we store them as u256
    protected storeU8At(pointer: u16, key: u256, value: u8): void {
        Blockchain.setStorageAt(pointer, key, u256.fromU32(<u32>value));
    }

    protected loadU8At(pointer: u16, key: u256): u8 {
        const val: u256 = Blockchain.getStorageAt(pointer, key);
        return <u8>val.toU32();
    }

    protected storeU16At(pointer: u16, key: u256, value: u16): void {
        Blockchain.setStorageAt(pointer, key, u256.fromU32(<u32>value));
    }

    protected loadU16At(pointer: u16, key: u256): u16 {
        const val: u256 = Blockchain.getStorageAt(pointer, key);
        return <u16>val.toU32();
    }

    protected storeU64At(pointer: u16, key: u256, value: u64): void {
        Blockchain.setStorageAt(pointer, key, u256.fromU64(value));
    }

    protected loadU64At(pointer: u16, key: u256): u64 {
        const val: u256 = Blockchain.getStorageAt(pointer, key);
        return val.toU64();
    }

    // Stub methods (will be implemented in next tasks)
    private createInvoice(_calldata: Calldata): BytesWriter {
        Revert('Not implemented');
        return new BytesWriter(0);
    }

    private payInvoice(_calldata: Calldata): BytesWriter {
        Revert('Not implemented');
        return new BytesWriter(0);
    }

    private cancelInvoice(_calldata: Calldata): BytesWriter {
        Revert('Not implemented');
        return new BytesWriter(0);
    }

    private markAsPaidBTC(_calldata: Calldata): BytesWriter {
        Revert('Not implemented');
        return new BytesWriter(0);
    }

    private _getInvoice(_calldata: Calldata): BytesWriter {
        Revert('Not implemented');
        return new BytesWriter(0);
    }

    private _getLineItems(_calldata: Calldata): BytesWriter {
        Revert('Not implemented');
        return new BytesWriter(0);
    }

    private _getInvoicesByCreator(_calldata: Calldata): BytesWriter {
        Revert('Not implemented');
        return new BytesWriter(0);
    }

    private _getInvoicesByRecipient(_calldata: Calldata): BytesWriter {
        Revert('Not implemented');
        return new BytesWriter(0);
    }

    private _setFeeRecipient(_calldata: Calldata): BytesWriter {
        Revert('Not implemented');
        return new BytesWriter(0);
    }

    private _getInvoiceCount(_calldata: Calldata): BytesWriter {
        const writer: BytesWriter = new BytesWriter(32);
        writer.writeU256(this.invoiceCount.get());
        return writer;
    }
}
