import { u256 } from '@btc-vision/as-bignum/assembly';
import {
    Address,
    Blockchain,
    BytesWriter,
    Calldata,
    encodePointer,
    EMPTY_POINTER,
    OP_NET,
    Revert,
    SafeMath,
    StoredU256,
    TransferHelper,
} from '@btc-vision/btc-runtime/runtime';

const STATUS_PENDING: u8 = 0;
const STATUS_PAID: u8 = 1;
const STATUS_CANCELLED: u8 = 3;

const FEE_BPS: u256 = u256.fromU32(50);
const BPS_DENOMINATOR: u256 = u256.fromU32(10000);
const MAX_LINE_ITEMS: u32 = 10;

// Max invoices per creator/recipient for the index list key scheme
const MAX_INDEX_ENTRIES: u32 = 1000;

// Number of 32-byte slots for long string storage (7 * 32 = 224 bytes max)
const LONG_STRING_MAX_SLOTS: u32 = 7;

export class BlockBillContract extends OP_NET {
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
    private readonly invoiceCount: StoredU256 = new StoredU256(
        this.invoiceCountPointer,
        EMPTY_POINTER,
    );

    public constructor() {
        super();
    }

    public override onDeployment(_calldata: Calldata): void {
        const deployer: Address = Blockchain.tx.sender;
        this.storeAddressAt(this.ownerPointer, u256.Zero, deployer);
        this.storeAddressAt(this.feeRecipientPointer, u256.Zero, deployer);
    }

    // =====================================================
    // Write methods (decorated for ABI generation)
    // =====================================================

    @method(
        { name: 'token', type: ABIDataTypes.ADDRESS },
        { name: 'totalAmount', type: ABIDataTypes.UINT256 },
        { name: 'recipient', type: ABIDataTypes.ADDRESS },
        { name: 'memo', type: ABIDataTypes.STRING },
        { name: 'deadline', type: ABIDataTypes.UINT64 },
        { name: 'taxBps', type: ABIDataTypes.UINT16 },
        { name: 'lineItemCount', type: ABIDataTypes.UINT16 },
    )
    @returns({ name: 'invoiceId', type: ABIDataTypes.UINT256 })
    public createInvoice(calldata: Calldata): BytesWriter {
        // Read parameters
        const token: Address = calldata.readAddress();
        const totalAmount: u256 = calldata.readU256();
        const recipient: Address = calldata.readAddress();
        const memo: string = calldata.readStringWithLength();
        const deadline: u64 = calldata.readU64();
        const taxBps: u16 = calldata.readU16();
        const lineItemCount: u16 = calldata.readU16();

        // Validate
        if (totalAmount == u256.Zero) {
            throw new Revert('Total amount must be > 0');
        }

        if (<u32>lineItemCount > MAX_LINE_ITEMS) {
            throw new Revert('Too many line items');
        }

        // Increment invoice count to get new invoiceId
        this.invoiceCount.set(SafeMath.add(this.invoiceCount.value, u256.One));
        const invoiceId: u256 = this.invoiceCount.value;

        const caller: Address = Blockchain.tx.sender;

        // Store invoice fields
        this.storeAddressAt(this.pCreator, invoiceId, caller);
        this.storeAddressAt(this.pToken, invoiceId, token);
        this.storeU256At(this.pTotalAmount, invoiceId, totalAmount);
        this.storeAddressAt(this.pRecipient, invoiceId, recipient);
        this.storeLongString(this.pMemo, invoiceId, memo);
        this.storeU64At(this.pDeadline, invoiceId, deadline);
        this.storeU16At(this.pTaxBps, invoiceId, taxBps);
        this.storeU8At(this.pStatus, invoiceId, STATUS_PENDING);
        this.storeU64At(this.pCreatedAtBlock, invoiceId, Blockchain.block.number);
        this.storeU16At(this.pLineItemCount, invoiceId, lineItemCount);

        // Store line items
        for (let i: u16 = 0; i < lineItemCount; i++) {
            const desc: string = calldata.readStringWithLength();
            const amount: u256 = calldata.readU256();

            const lineKey: u256 = SafeMath.add(
                SafeMath.mul(invoiceId, u256.fromU32(MAX_LINE_ITEMS)),
                u256.fromU32(<u32>i),
            );
            this.storeShortString(this.pLineDesc, lineKey, desc);
            this.storeU256At(this.pLineAmount, lineKey, amount);
        }

        // Add to creator index
        this.addToCreatorIndex(caller, invoiceId);

        // Add to recipient index if recipient is not zero address
        if (!recipient.isZero()) {
            this.addToRecipientIndex(recipient, invoiceId);
        }

        // Return invoiceId
        const writer: BytesWriter = new BytesWriter(32);
        writer.writeU256(invoiceId);
        return writer;
    }

    @method({ name: 'invoiceId', type: ABIDataTypes.UINT256 })
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public payInvoice(calldata: Calldata): BytesWriter {
        const invoiceId: u256 = calldata.readU256();
        const caller: Address = Blockchain.tx.sender;

        // Load and validate status
        const status: u8 = this.loadU8At(this.pStatus, invoiceId);
        if (status != STATUS_PENDING) {
            throw new Revert('Invoice is not pending');
        }

        // Check deadline
        const deadline: u64 = this.loadU64At(this.pDeadline, invoiceId);
        if (deadline > 0 && Blockchain.block.number > deadline) {
            throw new Revert('Invoice expired');
        }

        // Check recipient authorization
        const recipient: Address = this.loadAddressAt(this.pRecipient, invoiceId);
        if (!recipient.isZero() && !caller.equals(recipient)) {
            throw new Revert('Not authorized');
        }

        // Load invoice data
        const creator: Address = this.loadAddressAt(this.pCreator, invoiceId);
        const totalAmount: u256 = this.loadU256At(this.pTotalAmount, invoiceId);
        const token: Address = this.loadAddressAt(this.pToken, invoiceId);

        // Calculate fee and creator amount
        const fee: u256 = SafeMath.div(SafeMath.mul(totalAmount, FEE_BPS), BPS_DENOMINATOR);
        const creatorAmount: u256 = SafeMath.sub(totalAmount, fee);

        // Update state BEFORE external calls (checks-effects-interactions pattern)
        this.storeU8At(this.pStatus, invoiceId, STATUS_PAID);
        this.storeAddressAt(this.pPaidBy, invoiceId, caller);
        this.storeU64At(this.pPaidAtBlock, invoiceId, Blockchain.block.number);

        // Transfer tokens: payer -> creator (creatorAmount)
        TransferHelper.transferFrom(token, caller, creator, creatorAmount);

        // Transfer tokens: payer -> feeRecipient (fee)
        if (fee > u256.Zero) {
            const feeRecipient: Address = this.loadAddressAt(
                this.feeRecipientPointer,
                u256.Zero,
            );
            TransferHelper.transferFrom(token, caller, feeRecipient, fee);
        }

        const writer: BytesWriter = new BytesWriter(1);
        writer.writeBoolean(true);
        return writer;
    }

    @method({ name: 'invoiceId', type: ABIDataTypes.UINT256 })
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public cancelInvoice(calldata: Calldata): BytesWriter {
        const invoiceId: u256 = calldata.readU256();
        const caller: Address = Blockchain.tx.sender;

        // Verify caller is the creator
        const creator: Address = this.loadAddressAt(this.pCreator, invoiceId);
        if (!caller.equals(creator)) {
            throw new Revert('Only creator can cancel');
        }

        // Verify status is pending
        const status: u8 = this.loadU8At(this.pStatus, invoiceId);
        if (status != STATUS_PENDING) {
            throw new Revert('Invoice is not pending');
        }

        // Update status
        this.storeU8At(this.pStatus, invoiceId, STATUS_CANCELLED);

        const writer: BytesWriter = new BytesWriter(1);
        writer.writeBoolean(true);
        return writer;
    }

    @method(
        { name: 'invoiceId', type: ABIDataTypes.UINT256 },
        { name: 'btcTxHash', type: ABIDataTypes.STRING },
    )
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public markAsPaidBTC(calldata: Calldata): BytesWriter {
        const invoiceId: u256 = calldata.readU256();
        const btcTxHash: string = calldata.readStringWithLength();
        const caller: Address = Blockchain.tx.sender;

        // Verify caller is the creator
        const creator: Address = this.loadAddressAt(this.pCreator, invoiceId);
        if (!caller.equals(creator)) {
            throw new Revert('Only creator can mark as paid');
        }

        // Verify status is pending
        const status: u8 = this.loadU8At(this.pStatus, invoiceId);
        if (status != STATUS_PENDING) {
            throw new Revert('Invoice is not pending');
        }

        // Update status to PAID
        this.storeU8At(this.pStatus, invoiceId, STATUS_PAID);

        // Store BTC tx hash (short string, up to 31 bytes)
        this.storeShortString(this.pBtcTxHash, invoiceId, btcTxHash);

        // Store paid metadata
        this.storeAddressAt(this.pPaidBy, invoiceId, caller);
        this.storeU64At(this.pPaidAtBlock, invoiceId, Blockchain.block.number);

        const writer: BytesWriter = new BytesWriter(1);
        writer.writeBoolean(true);
        return writer;
    }

    @method({ name: 'newFeeRecipient', type: ABIDataTypes.ADDRESS })
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public setFeeRecipient(calldata: Calldata): BytesWriter {
        const newFeeRecipient: Address = calldata.readAddress();
        const caller: Address = Blockchain.tx.sender;

        // Verify caller is the owner
        const owner: Address = this.loadAddressAt(this.ownerPointer, u256.Zero);
        if (!caller.equals(owner)) {
            throw new Revert('Only owner can set fee recipient');
        }

        // Store new fee recipient
        this.storeAddressAt(this.feeRecipientPointer, u256.Zero, newFeeRecipient);

        const writer: BytesWriter = new BytesWriter(1);
        writer.writeBoolean(true);
        return writer;
    }

    // =====================================================
    // Read methods
    // =====================================================

    @method({ name: 'invoiceId', type: ABIDataTypes.UINT256 })
    @returns(
        { name: 'creator', type: ABIDataTypes.ADDRESS },
        { name: 'token', type: ABIDataTypes.ADDRESS },
        { name: 'totalAmount', type: ABIDataTypes.UINT256 },
        { name: 'recipient', type: ABIDataTypes.ADDRESS },
        { name: 'status', type: ABIDataTypes.UINT8 },
        { name: 'deadline', type: ABIDataTypes.UINT64 },
        { name: 'taxBps', type: ABIDataTypes.UINT16 },
        { name: 'createdAtBlock', type: ABIDataTypes.UINT64 },
        { name: 'paidBy', type: ABIDataTypes.ADDRESS },
        { name: 'paidAtBlock', type: ABIDataTypes.UINT64 },
        { name: 'memo', type: ABIDataTypes.STRING },
        { name: 'btcTxHash', type: ABIDataTypes.STRING },
        { name: 'lineItemCount', type: ABIDataTypes.UINT16 },
    )
    public getInvoice(calldata: Calldata): BytesWriter {
        const invoiceId: u256 = calldata.readU256();

        const creator: Address = this.loadAddressAt(this.pCreator, invoiceId);
        const token: Address = this.loadAddressAt(this.pToken, invoiceId);
        const totalAmount: u256 = this.loadU256At(this.pTotalAmount, invoiceId);
        const recipient: Address = this.loadAddressAt(this.pRecipient, invoiceId);
        const status: u8 = this.loadU8At(this.pStatus, invoiceId);
        const deadline: u64 = this.loadU64At(this.pDeadline, invoiceId);
        const taxBps: u16 = this.loadU16At(this.pTaxBps, invoiceId);
        const createdAtBlock: u64 = this.loadU64At(this.pCreatedAtBlock, invoiceId);
        const paidBy: Address = this.loadAddressAt(this.pPaidBy, invoiceId);
        const paidAtBlock: u64 = this.loadU64At(this.pPaidAtBlock, invoiceId);
        const memo: string = this.loadLongString(this.pMemo, invoiceId);
        const btcTxHash: string = this.loadShortString(this.pBtcTxHash, invoiceId);
        const lineItemCount: u16 = this.loadU16At(this.pLineItemCount, invoiceId);

        const writer: BytesWriter = new BytesWriter(500);
        writer.writeAddress(creator);
        writer.writeAddress(token);
        writer.writeU256(totalAmount);
        writer.writeAddress(recipient);
        writer.writeU8(status);
        writer.writeU64(deadline);
        writer.writeU16(taxBps);
        writer.writeU64(createdAtBlock);
        writer.writeAddress(paidBy);
        writer.writeU64(paidAtBlock);
        writer.writeStringWithLength(memo);
        writer.writeStringWithLength(btcTxHash);
        writer.writeU16(lineItemCount);
        return writer;
    }

    @method({ name: 'invoiceId', type: ABIDataTypes.UINT256 })
    @returns(
        { name: 'count', type: ABIDataTypes.UINT16 },
        { name: 'descriptions', type: ABIDataTypes.STRING },
        { name: 'amounts', type: ABIDataTypes.UINT256 },
    )
    public getLineItems(calldata: Calldata): BytesWriter {
        const invoiceId: u256 = calldata.readU256();
        const count: u16 = this.loadU16At(this.pLineItemCount, invoiceId);

        const writer: BytesWriter = new BytesWriter(500);
        writer.writeU16(count);

        for (let i: u16 = 0; i < count; i++) {
            const lineKey: u256 = SafeMath.add(
                SafeMath.mul(invoiceId, u256.fromU32(MAX_LINE_ITEMS)),
                u256.fromU32(<u32>i),
            );
            const desc: string = this.loadShortString(this.pLineDesc, lineKey);
            const amount: u256 = this.loadU256At(this.pLineAmount, lineKey);

            writer.writeStringWithLength(desc);
            writer.writeU256(amount);
        }

        return writer;
    }

    @method({ name: 'creator', type: ABIDataTypes.ADDRESS })
    @returns({ name: 'count', type: ABIDataTypes.UINT256 })
    public getInvoicesByCreator(calldata: Calldata): BytesWriter {
        const creator: Address = calldata.readAddress();
        const addrKey: u256 = u256.fromUint8ArrayBE(creator);
        const count: u256 = this.loadU256At(this.pCreatorCount, addrKey);
        const countU32: u32 = count.toU32();

        const writer: BytesWriter = new BytesWriter(32 + countU32 * 32);
        writer.writeU256(count);

        for (let i: u32 = 0; i < countU32; i++) {
            const listKey: u256 = u256.add(
                u256.mul(addrKey, u256.fromU32(MAX_INDEX_ENTRIES)),
                u256.fromU32(i),
            );
            const invoiceId: u256 = this.loadU256At(this.pCreatorList, listKey);
            writer.writeU256(invoiceId);
        }

        return writer;
    }

    @method({ name: 'recipient', type: ABIDataTypes.ADDRESS })
    @returns({ name: 'count', type: ABIDataTypes.UINT256 })
    public getInvoicesByRecipient(calldata: Calldata): BytesWriter {
        const recipient: Address = calldata.readAddress();
        const addrKey: u256 = u256.fromUint8ArrayBE(recipient);
        const count: u256 = this.loadU256At(this.pRecipientCount, addrKey);
        const countU32: u32 = count.toU32();

        const writer: BytesWriter = new BytesWriter(32 + countU32 * 32);
        writer.writeU256(count);

        for (let i: u32 = 0; i < countU32; i++) {
            const listKey: u256 = u256.add(
                u256.mul(addrKey, u256.fromU32(MAX_INDEX_ENTRIES)),
                u256.fromU32(i),
            );
            const invoiceId: u256 = this.loadU256At(this.pRecipientList, listKey);
            writer.writeU256(invoiceId);
        }

        return writer;
    }

    @method()
    @returns({ name: 'count', type: ABIDataTypes.UINT256 })
    public getInvoiceCount(_calldata: Calldata): BytesWriter {
        const writer: BytesWriter = new BytesWriter(32);
        writer.writeU256(this.invoiceCount.value);
        return writer;
    }

    // =====================================================
    // Storage helpers
    // =====================================================

    /**
     * Builds a 32-byte storage key from a pointer (u16) and a u256 sub-key.
     * The pointer occupies the first 2 bytes, the sub-key occupies the remaining 30 bytes.
     *
     * NOTE: u256To30Bytes keeps the FIRST 30 bytes of the BE representation, truncating
     * the last 2 bytes — which is where small values (like sequential invoice IDs) have
     * their significant bits. This causes all small IDs to collide to the same key.
     * Fix: take bytes 2..31 of the 32-byte BE representation (drop MSB, keep LSB).
     */
    protected buildKey(pointer: u16, key: u256): Uint8Array {
        const be: Uint8Array = key.toUint8Array(true); // 32 bytes, big-endian
        const sub: Uint8Array = new Uint8Array(30);
        for (let i: i32 = 0; i < 30; i++) {
            sub[i] = be[i + 2];
        }
        return encodePointer(pointer, sub);
    }

    protected storeAddressAt(pointer: u16, key: u256, addr: Address): void {
        const storageKey: Uint8Array = this.buildKey(pointer, key);
        Blockchain.setStorageAt(storageKey, addr);
    }

    protected loadAddressAt(pointer: u16, key: u256): Address {
        const storageKey: Uint8Array = this.buildKey(pointer, key);
        const raw: Uint8Array = Blockchain.getStorageAt(storageKey);
        return Address.fromUint8Array(raw);
    }

    protected storeU256At(pointer: u16, key: u256, value: u256): void {
        const storageKey: Uint8Array = this.buildKey(pointer, key);
        Blockchain.setStorageAt(storageKey, value.toUint8Array(true));
    }

    protected loadU256At(pointer: u16, key: u256): u256 {
        const storageKey: Uint8Array = this.buildKey(pointer, key);
        const raw: Uint8Array = Blockchain.getStorageAt(storageKey);
        return u256.fromUint8ArrayBE(raw);
    }

    protected storeU8At(pointer: u16, key: u256, value: u8): void {
        this.storeU256At(pointer, key, u256.fromU32(<u32>value));
    }

    protected loadU8At(pointer: u16, key: u256): u8 {
        const val: u256 = this.loadU256At(pointer, key);
        return <u8>val.toU32();
    }

    protected storeU16At(pointer: u16, key: u256, value: u16): void {
        this.storeU256At(pointer, key, u256.fromU32(<u32>value));
    }

    protected loadU16At(pointer: u16, key: u256): u16 {
        const val: u256 = this.loadU256At(pointer, key);
        return <u16>val.toU32();
    }

    protected storeU64At(pointer: u16, key: u256, value: u64): void {
        this.storeU256At(pointer, key, u256.fromU64(value));
    }

    protected loadU64At(pointer: u16, key: u256): u64 {
        const val: u256 = this.loadU256At(pointer, key);
        return val.toU64();
    }

    // =====================================================
    // Short string storage helpers (up to 31 bytes)
    // Stores as two u256 slots: [length, packed-bytes]
    // =====================================================

    protected storeShortString(pointer: u16, baseKey: u256, value: string): void {
        const encoded: ArrayBuffer = String.UTF8.encode(value);
        const bytes: Uint8Array = Uint8Array.wrap(encoded);
        const len: u32 = bytes.length < 31 ? bytes.length : 31;

        const lenSlotKey: u256 = SafeMath.mul(baseKey, u256.fromU32(2));
        const dataSlotKey: u256 = SafeMath.add(lenSlotKey, u256.One);

        // Store length
        this.storeU256At(pointer, lenSlotKey, u256.fromU32(len));

        // Pack bytes left-aligned in a 32-byte array
        const packed: Uint8Array = new Uint8Array(32);
        for (let i: u32 = 0; i < len; i++) {
            packed[i] = bytes[i];
        }
        const storageKey: Uint8Array = this.buildKey(pointer, dataSlotKey);
        Blockchain.setStorageAt(storageKey, packed);
    }

    protected loadShortString(pointer: u16, baseKey: u256): string {
        const lenSlotKey: u256 = SafeMath.mul(baseKey, u256.fromU32(2));
        const dataSlotKey: u256 = SafeMath.add(lenSlotKey, u256.One);

        const len: u32 = this.loadU256At(pointer, lenSlotKey).toU32();
        if (len == 0) {
            return '';
        }

        const storageKey: Uint8Array = this.buildKey(pointer, dataSlotKey);
        const packed: Uint8Array = Blockchain.getStorageAt(storageKey);

        const actualLen: u32 = len < 31 ? len : 31;
        const strBytes: Uint8Array = new Uint8Array(<i32>actualLen);
        for (let i: u32 = 0; i < actualLen; i++) {
            strBytes[i] = packed[i];
        }

        return String.UTF8.decode(strBytes.buffer);
    }

    // =====================================================
    // Long string storage helpers (up to 7 * 32 = 224 bytes)
    // Slot 0 = byte length, Slots 1..7 = raw 32-byte chunks
    // =====================================================

    protected storeLongString(pointer: u16, baseKey: u256, value: string): void {
        const encoded: ArrayBuffer = String.UTF8.encode(value);
        const bytes: Uint8Array = Uint8Array.wrap(encoded);
        const maxBytes: i32 = <i32>(LONG_STRING_MAX_SLOTS * 32);
        const len: u32 = <u32>(bytes.length < maxBytes ? bytes.length : maxBytes);
        const slotsNeeded: u32 = LONG_STRING_MAX_SLOTS + 1;
        const base: u256 = SafeMath.mul(baseKey, u256.fromU32(slotsNeeded));

        // Store length
        this.storeU256At(pointer, base, u256.fromU32(len));

        // Store data in 32-byte chunks
        for (let i: u32 = 0; i < LONG_STRING_MAX_SLOTS; i++) {
            const offset: u32 = i * 32;
            if (offset >= len) break;

            const chunk: Uint8Array = new Uint8Array(32);
            const remaining: u32 = len - offset;
            const chunkLen: u32 = remaining < 32 ? remaining : 32;

            for (let j: u32 = 0; j < chunkLen; j++) {
                chunk[j] = bytes[offset + j];
            }

            const slotKey: u256 = SafeMath.add(base, u256.fromU32(i + 1));
            const storageKey: Uint8Array = this.buildKey(pointer, slotKey);
            Blockchain.setStorageAt(storageKey, chunk);
        }
    }

    protected loadLongString(pointer: u16, baseKey: u256): string {
        const slotsNeeded: u32 = LONG_STRING_MAX_SLOTS + 1;
        const base: u256 = SafeMath.mul(baseKey, u256.fromU32(slotsNeeded));

        const len: u32 = this.loadU256At(pointer, base).toU32();
        if (len == 0) {
            return '';
        }

        const maxBytes: u32 = LONG_STRING_MAX_SLOTS * 32;
        const actualLen: u32 = len < maxBytes ? len : maxBytes;
        const result: Uint8Array = new Uint8Array(<i32>actualLen);

        for (let i: u32 = 0; i < LONG_STRING_MAX_SLOTS; i++) {
            const offset: u32 = i * 32;
            if (offset >= actualLen) break;

            const slotKey: u256 = SafeMath.add(base, u256.fromU32(i + 1));
            const storageKey: Uint8Array = this.buildKey(pointer, slotKey);
            const chunk: Uint8Array = Blockchain.getStorageAt(storageKey);

            const remaining: u32 = actualLen - offset;
            const chunkLen: u32 = remaining < 32 ? remaining : 32;

            for (let j: u32 = 0; j < chunkLen; j++) {
                result[offset + j] = chunk[j];
            }
        }

        return String.UTF8.decode(result.buffer);
    }

    // =====================================================
    // Index management helpers
    // =====================================================

    private addToCreatorIndex(creator: Address, invoiceId: u256): void {
        const addrKey: u256 = u256.fromUint8ArrayBE(creator);
        const count: u256 = this.loadU256At(this.pCreatorCount, addrKey);
        const countU32: u32 = count.toU32();

        // Use wrapping mul/add for storage key derivation (addrKey * MAX overflows with SafeMath)
        const listKey: u256 = u256.add(
            u256.mul(addrKey, u256.fromU32(MAX_INDEX_ENTRIES)),
            u256.fromU32(countU32),
        );
        this.storeU256At(this.pCreatorList, listKey, invoiceId);

        // Increment count
        this.storeU256At(this.pCreatorCount, addrKey, SafeMath.add(count, u256.One));
    }

    private addToRecipientIndex(recipient: Address, invoiceId: u256): void {
        const addrKey: u256 = u256.fromUint8ArrayBE(recipient);
        const count: u256 = this.loadU256At(this.pRecipientCount, addrKey);
        const countU32: u32 = count.toU32();

        // Use wrapping mul/add for storage key derivation (addrKey * MAX overflows with SafeMath)
        const listKey: u256 = u256.add(
            u256.mul(addrKey, u256.fromU32(MAX_INDEX_ENTRIES)),
            u256.fromU32(countU32),
        );
        this.storeU256At(this.pRecipientList, listKey, invoiceId);

        this.storeU256At(this.pRecipientCount, addrKey, SafeMath.add(count, u256.One));
    }
}
