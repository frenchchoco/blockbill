import { u256 } from '@btc-vision/as-bignum/assembly';
import {
    Address,
    Blockchain,
    BytesWriter,
    Calldata,
    encodePointer,
    EMPTY_POINTER,
    ReentrancyGuard,
    Revert,
    SafeMath,
    StoredU256,
    TransferHelper,
} from '@btc-vision/btc-runtime/runtime';

const STATUS_ACTIVE: u8 = 0;
const STATUS_PAUSED: u8 = 1;
const STATUS_CANCELLED: u8 = 2;

const FEE_BPS: u256 = u256.fromU32(50);
const BPS_DENOMINATOR: u256 = u256.fromU32(10000);
const MAX_INDEX_ENTRIES: u32 = 1000;

export class BlockBillStreamContract extends ReentrancyGuard {
    // =====================================================
    // Global storage pointers
    // =====================================================
    private readonly streamCountPointer: u16 = Blockchain.nextPointer;
    private readonly feeRecipientPointer: u16 = Blockchain.nextPointer;
    private readonly ownerPointer: u16 = Blockchain.nextPointer;

    // =====================================================
    // Per-stream field pointers (keyed by streamId)
    // =====================================================
    private readonly pSender: u16 = Blockchain.nextPointer;
    private readonly pRecipient: u16 = Blockchain.nextPointer;
    private readonly pToken: u16 = Blockchain.nextPointer;
    private readonly pTotalDeposited: u16 = Blockchain.nextPointer;
    private readonly pTotalWithdrawn: u16 = Blockchain.nextPointer;
    private readonly pRatePerBlock: u16 = Blockchain.nextPointer;
    private readonly pStartBlock: u16 = Blockchain.nextPointer;
    private readonly pEndBlock: u16 = Blockchain.nextPointer;
    private readonly pLastWithdrawBlock: u16 = Blockchain.nextPointer;
    private readonly pPausedAtBlock: u16 = Blockchain.nextPointer;
    private readonly pAccumulatedBeforePause: u16 = Blockchain.nextPointer;
    private readonly pStatus: u16 = Blockchain.nextPointer;

    // =====================================================
    // Index pointers: sender/recipient stream counts + lists
    // =====================================================
    private readonly pSenderCount: u16 = Blockchain.nextPointer;
    private readonly pSenderList: u16 = Blockchain.nextPointer;
    private readonly pRecipientCount: u16 = Blockchain.nextPointer;
    private readonly pRecipientList: u16 = Blockchain.nextPointer;

    // =====================================================
    // Stored values
    // =====================================================
    private readonly streamCount: StoredU256 = new StoredU256(
        this.streamCountPointer,
        EMPTY_POINTER,
    );

    public constructor() {
        super();
    }

    // =====================================================
    // Lifecycle
    // =====================================================

    public override onDeployment(_calldata: Calldata): void {
        const deployer: Address = Blockchain.tx.sender;
        this.storeAddressAt(this.ownerPointer, u256.Zero, deployer);
        this.storeAddressAt(this.feeRecipientPointer, u256.Zero, deployer);
    }

    // =====================================================
    // Assertions
    // =====================================================

    private assertStreamExists(streamId: u256): void {
        if (streamId == u256.Zero || streamId > this.streamCount.value) {
            throw new Revert('Stream does not exist');
        }
    }

    // =====================================================
    // Write methods
    // =====================================================

    @method(
        { name: 'recipient', type: ABIDataTypes.ADDRESS },
        { name: 'token', type: ABIDataTypes.ADDRESS },
        { name: 'totalAmount', type: ABIDataTypes.UINT256 },
        { name: 'ratePerBlock', type: ABIDataTypes.UINT256 },
        { name: 'endBlock', type: ABIDataTypes.UINT64 },
    )
    @returns({ name: 'streamId', type: ABIDataTypes.UINT256 })
    public createStream(calldata: Calldata): BytesWriter {
        const recipient: Address = calldata.readAddress();
        const token: Address = calldata.readAddress();
        const totalAmount: u256 = calldata.readU256();
        const ratePerBlock: u256 = calldata.readU256();
        const endBlock: u64 = calldata.readU64();

        const caller: Address = Blockchain.tx.sender;

        // Validate
        if (totalAmount == u256.Zero) {
            throw new Revert('Amount must be > 0');
        }
        if (ratePerBlock == u256.Zero) {
            throw new Revert('Rate must be > 0');
        }
        if (recipient.isZero()) {
            throw new Revert('Recipient is zero address');
        }
        if (caller.equals(recipient)) {
            throw new Revert('Cannot stream to self');
        }
        if (endBlock > 0 && endBlock <= Blockchain.block.number) {
            throw new Revert('End block must be in the future');
        }

        // Calculate fee
        const fee: u256 = SafeMath.div(SafeMath.mul(totalAmount, FEE_BPS), BPS_DENOMINATOR);
        const netDeposit: u256 = SafeMath.sub(totalAmount, fee);

        // Increment stream count
        this.streamCount.set(SafeMath.add(this.streamCount.value, u256.One));
        const streamId: u256 = this.streamCount.value;

        const currentBlock: u64 = Blockchain.block.number;
        const contractAddr: Address = Blockchain.contractAddress;

        // Store stream fields (state BEFORE external calls)
        this.storeAddressAt(this.pSender, streamId, caller);
        this.storeAddressAt(this.pRecipient, streamId, recipient);
        this.storeAddressAt(this.pToken, streamId, token);
        this.storeU256At(this.pTotalDeposited, streamId, netDeposit);
        // totalWithdrawn defaults to 0
        this.storeU256At(this.pRatePerBlock, streamId, ratePerBlock);
        this.storeU64At(this.pStartBlock, streamId, currentBlock);
        this.storeU64At(this.pEndBlock, streamId, endBlock);
        this.storeU64At(this.pLastWithdrawBlock, streamId, currentBlock);
        // pausedAtBlock defaults to 0
        // accumulatedBeforePause defaults to 0
        this.storeU8At(this.pStatus, streamId, STATUS_ACTIVE);

        // Index sender and recipient
        this.addToSenderIndex(caller, streamId);
        this.addToRecipientIndex(recipient, streamId);

        // Transfer tokens: sender -> contract (net deposit)
        TransferHelper.transferFrom(token, caller, contractAddr, netDeposit);

        // Transfer fee: sender -> feeRecipient
        if (fee > u256.Zero) {
            const feeRecipient: Address = this.loadAddressAt(
                this.feeRecipientPointer,
                u256.Zero,
            );
            TransferHelper.transferFrom(token, caller, feeRecipient, fee);
        }

        // Return streamId
        const writer: BytesWriter = new BytesWriter(32);
        writer.writeU256(streamId);
        return writer;
    }

    @method({ name: 'streamId', type: ABIDataTypes.UINT256 })
    @returns({ name: 'amount', type: ABIDataTypes.UINT256 })
    public withdraw(calldata: Calldata): BytesWriter {
        const streamId: u256 = calldata.readU256();
        this.assertStreamExists(streamId);

        const withdrawable: u256 = this._calculateWithdrawable(streamId);
        if (withdrawable == u256.Zero) {
            throw new Revert('Nothing to withdraw');
        }

        const recipient: Address = this.loadAddressAt(this.pRecipient, streamId);
        const token: Address = this.loadAddressAt(this.pToken, streamId);
        const totalWithdrawn: u256 = this.loadU256At(this.pTotalWithdrawn, streamId);

        // Update state BEFORE external calls
        this.storeU256At(this.pTotalWithdrawn, streamId, SafeMath.add(totalWithdrawn, withdrawable));
        this.storeU64At(this.pLastWithdrawBlock, streamId, Blockchain.block.number);

        // Clear accumulatedBeforePause after withdrawal
        this.storeU256At(this.pAccumulatedBeforePause, streamId, u256.Zero);

        // Transfer: contract -> recipient
        TransferHelper.safeTransfer(token, recipient, withdrawable);

        const writer: BytesWriter = new BytesWriter(32);
        writer.writeU256(withdrawable);
        return writer;
    }

    @method(
        { name: 'streamId', type: ABIDataTypes.UINT256 },
        { name: 'to', type: ABIDataTypes.ADDRESS },
    )
    @returns({ name: 'amount', type: ABIDataTypes.UINT256 })
    public withdrawTo(calldata: Calldata): BytesWriter {
        const streamId: u256 = calldata.readU256();
        const to: Address = calldata.readAddress();
        this.assertStreamExists(streamId);

        const caller: Address = Blockchain.tx.sender;
        const recipient: Address = this.loadAddressAt(this.pRecipient, streamId);

        // Only recipient can call withdrawTo
        if (!caller.equals(recipient)) {
            throw new Revert('Only recipient can withdrawTo');
        }

        if (to.isZero()) {
            throw new Revert('Cannot withdraw to zero address');
        }

        const withdrawable: u256 = this._calculateWithdrawable(streamId);
        if (withdrawable == u256.Zero) {
            throw new Revert('Nothing to withdraw');
        }

        const token: Address = this.loadAddressAt(this.pToken, streamId);
        const totalWithdrawn: u256 = this.loadU256At(this.pTotalWithdrawn, streamId);

        // Update state BEFORE external calls
        this.storeU256At(this.pTotalWithdrawn, streamId, SafeMath.add(totalWithdrawn, withdrawable));
        this.storeU64At(this.pLastWithdrawBlock, streamId, Blockchain.block.number);

        // Clear accumulatedBeforePause after withdrawal
        this.storeU256At(this.pAccumulatedBeforePause, streamId, u256.Zero);

        // Transfer: contract -> custom 'to' address
        TransferHelper.safeTransfer(token, to, withdrawable);

        const writer: BytesWriter = new BytesWriter(32);
        writer.writeU256(withdrawable);
        return writer;
    }

    @method(
        { name: 'streamId', type: ABIDataTypes.UINT256 },
        { name: 'amount', type: ABIDataTypes.UINT256 },
    )
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public topUp(calldata: Calldata): BytesWriter {
        const streamId: u256 = calldata.readU256();
        const amount: u256 = calldata.readU256();
        this.assertStreamExists(streamId);

        const caller: Address = Blockchain.tx.sender;
        const sender: Address = this.loadAddressAt(this.pSender, streamId);

        // Only sender can top up
        if (!caller.equals(sender)) {
            throw new Revert('Only sender can top up');
        }

        if (amount == u256.Zero) {
            throw new Revert('Amount must be > 0');
        }

        const status: u8 = this.loadU8At(this.pStatus, streamId);
        if (status == STATUS_CANCELLED) {
            throw new Revert('Stream is cancelled');
        }

        // Calculate fee
        const fee: u256 = SafeMath.div(SafeMath.mul(amount, FEE_BPS), BPS_DENOMINATOR);
        const netAmount: u256 = SafeMath.sub(amount, fee);

        // Increase totalDeposited
        const totalDeposited: u256 = this.loadU256At(this.pTotalDeposited, streamId);
        this.storeU256At(this.pTotalDeposited, streamId, SafeMath.add(totalDeposited, netAmount));

        // Transfer tokens
        const token: Address = this.loadAddressAt(this.pToken, streamId);
        const contractAddr: Address = Blockchain.contractAddress;
        TransferHelper.transferFrom(token, caller, contractAddr, netAmount);

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

    @method({ name: 'streamId', type: ABIDataTypes.UINT256 })
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public cancelStream(calldata: Calldata): BytesWriter {
        const streamId: u256 = calldata.readU256();
        this.assertStreamExists(streamId);

        const caller: Address = Blockchain.tx.sender;
        const sender: Address = this.loadAddressAt(this.pSender, streamId);

        // Only sender can cancel
        if (!caller.equals(sender)) {
            throw new Revert('Only sender can cancel');
        }

        const status: u8 = this.loadU8At(this.pStatus, streamId);
        if (status == STATUS_CANCELLED) {
            throw new Revert('Stream already cancelled');
        }

        // Calculate withdrawable for recipient
        const withdrawable: u256 = this._calculateWithdrawable(streamId);

        // Calculate refund for sender
        const totalDeposited: u256 = this.loadU256At(this.pTotalDeposited, streamId);
        const totalWithdrawn: u256 = this.loadU256At(this.pTotalWithdrawn, streamId);
        const recipientOwed: u256 = SafeMath.add(totalWithdrawn, withdrawable);
        const refund: u256 = SafeMath.sub(totalDeposited, recipientOwed);

        // Update state BEFORE external calls
        this.storeU8At(this.pStatus, streamId, STATUS_CANCELLED);
        this.storeU256At(this.pTotalWithdrawn, streamId, SafeMath.add(totalWithdrawn, withdrawable));

        const token: Address = this.loadAddressAt(this.pToken, streamId);
        const recipient: Address = this.loadAddressAt(this.pRecipient, streamId);

        // Transfer withdrawable -> recipient
        if (withdrawable > u256.Zero) {
            TransferHelper.safeTransfer(token, recipient, withdrawable);
        }

        // Transfer refund -> sender
        if (refund > u256.Zero) {
            TransferHelper.safeTransfer(token, sender, refund);
        }

        const writer: BytesWriter = new BytesWriter(1);
        writer.writeBoolean(true);
        return writer;
    }

    @method({ name: 'streamId', type: ABIDataTypes.UINT256 })
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public pauseStream(calldata: Calldata): BytesWriter {
        const streamId: u256 = calldata.readU256();
        this.assertStreamExists(streamId);

        const caller: Address = Blockchain.tx.sender;
        const sender: Address = this.loadAddressAt(this.pSender, streamId);

        // Only sender can pause
        if (!caller.equals(sender)) {
            throw new Revert('Only sender can pause');
        }

        const status: u8 = this.loadU8At(this.pStatus, streamId);
        if (status != STATUS_ACTIVE) {
            throw new Revert('Stream is not active');
        }

        // Snapshot: accumulatedBeforePause = totalWithdrawn + current withdrawable
        const totalWithdrawn: u256 = this.loadU256At(this.pTotalWithdrawn, streamId);
        const withdrawable: u256 = this._calculateWithdrawable(streamId);
        const accumulated: u256 = SafeMath.add(totalWithdrawn, withdrawable);

        this.storeU256At(this.pAccumulatedBeforePause, streamId, accumulated);
        this.storeU64At(this.pPausedAtBlock, streamId, Blockchain.block.number);
        this.storeU8At(this.pStatus, streamId, STATUS_PAUSED);

        const writer: BytesWriter = new BytesWriter(1);
        writer.writeBoolean(true);
        return writer;
    }

    @method({ name: 'streamId', type: ABIDataTypes.UINT256 })
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public resumeStream(calldata: Calldata): BytesWriter {
        const streamId: u256 = calldata.readU256();
        this.assertStreamExists(streamId);

        const caller: Address = Blockchain.tx.sender;
        const sender: Address = this.loadAddressAt(this.pSender, streamId);

        // Only sender can resume
        if (!caller.equals(sender)) {
            throw new Revert('Only sender can resume');
        }

        const status: u8 = this.loadU8At(this.pStatus, streamId);
        if (status != STATUS_PAUSED) {
            throw new Revert('Stream is not paused');
        }

        // Set lastWithdrawBlock = current block (new starting point)
        this.storeU64At(this.pLastWithdrawBlock, streamId, Blockchain.block.number);
        // Clear pausedAtBlock
        this.storeU64At(this.pPausedAtBlock, streamId, 0);
        // Set status ACTIVE
        // NOTE: accumulatedBeforePause is KEPT (not cleared) — it preserves pre-pause streaming
        this.storeU8At(this.pStatus, streamId, STATUS_ACTIVE);

        const writer: BytesWriter = new BytesWriter(1);
        writer.writeBoolean(true);
        return writer;
    }

    @method({ name: 'newFeeRecipient', type: ABIDataTypes.ADDRESS })
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    public setFeeRecipient(calldata: Calldata): BytesWriter {
        const newFeeRecipient: Address = calldata.readAddress();
        const caller: Address = Blockchain.tx.sender;

        if (newFeeRecipient.isZero()) {
            throw new Revert('Zero address');
        }

        // Verify caller is the owner
        const owner: Address = this.loadAddressAt(this.ownerPointer, u256.Zero);
        if (!caller.equals(owner)) {
            throw new Revert('Only owner can set fee recipient');
        }

        this.storeAddressAt(this.feeRecipientPointer, u256.Zero, newFeeRecipient);

        const writer: BytesWriter = new BytesWriter(1);
        writer.writeBoolean(true);
        return writer;
    }

    // =====================================================
    // Read methods
    // =====================================================

    @method({ name: 'streamId', type: ABIDataTypes.UINT256 })
    @returns(
        { name: 'sender', type: ABIDataTypes.ADDRESS },
        { name: 'recipient', type: ABIDataTypes.ADDRESS },
        { name: 'token', type: ABIDataTypes.ADDRESS },
        { name: 'totalDeposited', type: ABIDataTypes.UINT256 },
        { name: 'totalWithdrawn', type: ABIDataTypes.UINT256 },
        { name: 'ratePerBlock', type: ABIDataTypes.UINT256 },
        { name: 'startBlock', type: ABIDataTypes.UINT64 },
        { name: 'endBlock', type: ABIDataTypes.UINT64 },
        { name: 'lastWithdrawBlock', type: ABIDataTypes.UINT64 },
        { name: 'pausedAtBlock', type: ABIDataTypes.UINT64 },
        { name: 'accumulatedBeforePause', type: ABIDataTypes.UINT256 },
        { name: 'status', type: ABIDataTypes.UINT8 },
    )
    public getStream(calldata: Calldata): BytesWriter {
        const streamId: u256 = calldata.readU256();

        const sender: Address = this.loadAddressAt(this.pSender, streamId);
        const recipient: Address = this.loadAddressAt(this.pRecipient, streamId);
        const token: Address = this.loadAddressAt(this.pToken, streamId);
        const totalDeposited: u256 = this.loadU256At(this.pTotalDeposited, streamId);
        const totalWithdrawn: u256 = this.loadU256At(this.pTotalWithdrawn, streamId);
        const ratePerBlock: u256 = this.loadU256At(this.pRatePerBlock, streamId);
        const startBlock: u64 = this.loadU64At(this.pStartBlock, streamId);
        const endBlock: u64 = this.loadU64At(this.pEndBlock, streamId);
        const lastWithdrawBlock: u64 = this.loadU64At(this.pLastWithdrawBlock, streamId);
        const pausedAtBlock: u64 = this.loadU64At(this.pPausedAtBlock, streamId);
        const accumulatedBeforePause: u256 = this.loadU256At(this.pAccumulatedBeforePause, streamId);
        const status: u8 = this.loadU8At(this.pStatus, streamId);

        // 3*32 (addresses) + 4*32 (u256s) + 4*8 (u64s) + 1 (u8) = 257 bytes
        const writer: BytesWriter = new BytesWriter(288);
        writer.writeAddress(sender);
        writer.writeAddress(recipient);
        writer.writeAddress(token);
        writer.writeU256(totalDeposited);
        writer.writeU256(totalWithdrawn);
        writer.writeU256(ratePerBlock);
        writer.writeU64(startBlock);
        writer.writeU64(endBlock);
        writer.writeU64(lastWithdrawBlock);
        writer.writeU64(pausedAtBlock);
        writer.writeU256(accumulatedBeforePause);
        writer.writeU8(status);
        return writer;
    }

    @method({ name: 'streamId', type: ABIDataTypes.UINT256 })
    @returns({ name: 'withdrawable', type: ABIDataTypes.UINT256 })
    public getWithdrawable(calldata: Calldata): BytesWriter {
        const streamId: u256 = calldata.readU256();
        const withdrawable: u256 = this._calculateWithdrawable(streamId);

        const writer: BytesWriter = new BytesWriter(32);
        writer.writeU256(withdrawable);
        return writer;
    }

    @method({ name: 'sender', type: ABIDataTypes.ADDRESS })
    @returns({ name: 'count', type: ABIDataTypes.UINT256 })
    public getStreamsBySender(calldata: Calldata): BytesWriter {
        const sender: Address = calldata.readAddress();
        const addrKey: u256 = u256.fromUint8ArrayBE(sender);
        const count: u256 = this.loadU256At(this.pSenderCount, addrKey);
        const countU32: u32 = count.toU32();

        const writer: BytesWriter = new BytesWriter(32 + countU32 * 32);
        writer.writeU256(count);

        for (let i: u32 = 0; i < countU32; i++) {
            const listKey: u256 = u256.add(
                u256.mul(addrKey, u256.fromU32(MAX_INDEX_ENTRIES)),
                u256.fromU32(i),
            );
            const streamId: u256 = this.loadU256At(this.pSenderList, listKey);
            writer.writeU256(streamId);
        }

        return writer;
    }

    @method({ name: 'recipient', type: ABIDataTypes.ADDRESS })
    @returns({ name: 'count', type: ABIDataTypes.UINT256 })
    public getStreamsByRecipient(calldata: Calldata): BytesWriter {
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
            const streamId: u256 = this.loadU256At(this.pRecipientList, listKey);
            writer.writeU256(streamId);
        }

        return writer;
    }

    @method()
    @returns({ name: 'count', type: ABIDataTypes.UINT256 })
    public getStreamCount(_calldata: Calldata): BytesWriter {
        const writer: BytesWriter = new BytesWriter(32);
        writer.writeU256(this.streamCount.value);
        return writer;
    }

    // =====================================================
    // Internal: calculate withdrawable amount
    // =====================================================

    private _calculateWithdrawable(streamId: u256): u256 {
        const status: u8 = this.loadU8At(this.pStatus, streamId);

        // CANCELLED: nothing withdrawable
        if (status == STATUS_CANCELLED) {
            return u256.Zero;
        }

        const totalWithdrawn: u256 = this.loadU256At(this.pTotalWithdrawn, streamId);
        const accumulatedBeforePause: u256 = this.loadU256At(this.pAccumulatedBeforePause, streamId);

        // PAUSED: return max(0, accumulatedBeforePause - totalWithdrawn)
        if (status == STATUS_PAUSED) {
            if (accumulatedBeforePause > totalWithdrawn) {
                return SafeMath.sub(accumulatedBeforePause, totalWithdrawn);
            }
            return u256.Zero;
        }

        // ACTIVE:
        const currentBlock: u64 = Blockchain.block.number;
        const endBlock: u64 = this.loadU64At(this.pEndBlock, streamId);
        const lastWithdrawBlock: u64 = this.loadU64At(this.pLastWithdrawBlock, streamId);

        // Determine effective end: if endBlock is set and in the past, use it
        let effectiveEnd: u64 = currentBlock;
        if (endBlock > 0 && endBlock < currentBlock) {
            effectiveEnd = endBlock;
        }

        if (effectiveEnd <= lastWithdrawBlock) {
            // Still may have accumulatedBeforePause from a prior pause cycle
            if (accumulatedBeforePause > totalWithdrawn) {
                return SafeMath.sub(accumulatedBeforePause, totalWithdrawn);
            }
            return u256.Zero;
        }

        const elapsed: u64 = effectiveEnd - lastWithdrawBlock;
        const ratePerBlock: u256 = this.loadU256At(this.pRatePerBlock, streamId);
        const streamed: u256 = SafeMath.add(
            SafeMath.mul(u256.fromU64(elapsed), ratePerBlock),
            accumulatedBeforePause,
        );

        // Cap at totalDeposited
        const totalDeposited: u256 = this.loadU256At(this.pTotalDeposited, streamId);
        const capped: u256 = streamed > totalDeposited ? totalDeposited : streamed;

        // Return max(0, capped - totalWithdrawn)
        if (capped > totalWithdrawn) {
            return SafeMath.sub(capped, totalWithdrawn);
        }
        return u256.Zero;
    }

    // =====================================================
    // Storage helpers (same pattern as BlockBillContract)
    // =====================================================

    /**
     * Builds a 32-byte storage key from a pointer (u16) and a u256 sub-key.
     * The pointer occupies the first 2 bytes, the sub-key occupies the remaining 30 bytes.
     *
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

    protected storeU64At(pointer: u16, key: u256, value: u64): void {
        this.storeU256At(pointer, key, u256.fromU64(value));
    }

    protected loadU64At(pointer: u16, key: u256): u64 {
        const val: u256 = this.loadU256At(pointer, key);
        return val.toU64();
    }

    // =====================================================
    // Index management helpers
    // =====================================================

    private addToSenderIndex(sender: Address, streamId: u256): void {
        const addrKey: u256 = u256.fromUint8ArrayBE(sender);
        const count: u256 = this.loadU256At(this.pSenderCount, addrKey);
        const countU32: u32 = count.toU32();

        // Fail explicitly when index is full so the user knows
        if (countU32 >= MAX_INDEX_ENTRIES) {
            throw new Revert('Sender index full');
        }

        // Use wrapping mul/add for storage key derivation
        const listKey: u256 = u256.add(
            u256.mul(addrKey, u256.fromU32(MAX_INDEX_ENTRIES)),
            u256.fromU32(countU32),
        );
        this.storeU256At(this.pSenderList, listKey, streamId);

        // Increment count
        this.storeU256At(this.pSenderCount, addrKey, SafeMath.add(count, u256.One));
    }

    private addToRecipientIndex(recipient: Address, streamId: u256): void {
        const addrKey: u256 = u256.fromUint8ArrayBE(recipient);
        const count: u256 = this.loadU256At(this.pRecipientCount, addrKey);
        const countU32: u32 = count.toU32();

        // Fail explicitly when index is full so the user knows
        if (countU32 >= MAX_INDEX_ENTRIES) {
            throw new Revert('Recipient index full');
        }

        // Use wrapping mul/add for storage key derivation
        const listKey: u256 = u256.add(
            u256.mul(addrKey, u256.fromU32(MAX_INDEX_ENTRIES)),
            u256.fromU32(countU32),
        );
        this.storeU256At(this.pRecipientList, listKey, streamId);

        this.storeU256At(this.pRecipientCount, addrKey, SafeMath.add(count, u256.One));
    }
}
