# BlockBillStream Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add LlamaPay-style streaming payments to BlockBill — a new contract where senders deposit OP-20 tokens that flow block-by-block to recipients who withdraw at will.

**Architecture:** Separate AssemblyScript contract (`contract-stream/`) deployed independently from BlockBill invoicing. Frontend adds 3 new pages under the same React app with shared components, hooks, and services. Contract holds tokens via TransferHelper, calculates withdrawable based on elapsed blocks.

**Tech Stack:** AssemblyScript (OPNet btc-runtime), React 19 + Vite + TypeScript, opnet SDK, @btc-vision/walletconnect, Tailwind 4

---

## Task 1: Scaffold Stream Contract Project

**Files:**
- Create: `contract-stream/package.json`
- Create: `contract-stream/asconfig.json`
- Create: `contract-stream/tsconfig.json`
- Create: `contract-stream/src/index.ts`
- Create: `contract-stream/src/BlockBillStreamContract.ts` (empty class)

**Step 1: Create contract-stream directory**

```bash
mkdir -p contract-stream/src
```

**Step 2: Create package.json**

Create `contract-stream/package.json`:
```json
{
    "name": "blockbill-stream-contract",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
        "build": "asc src/index.ts --config asconfig.json --target debug",
        "clean": "rm -rf build/*"
    },
    "dependencies": {
        "@btc-vision/as-bignum": "0.1.2",
        "@btc-vision/btc-runtime": "rc"
    },
    "devDependencies": {
        "@btc-vision/assemblyscript": "^0.29.2",
        "@btc-vision/opnet-transform": "1.1.0",
        "@assemblyscript/loader": "latest"
    },
    "overrides": {
        "bip39": {
            "@noble/hashes": "1.6.1"
        }
    }
}
```

**Step 3: Create asconfig.json**

Create `contract-stream/asconfig.json`:
```json
{
    "targets": {
        "debug": {
            "outFile": "build/BlockBillStream.wasm",
            "textFile": "build/BlockBillStream.wat"
        }
    },
    "options": {
        "transform": "@btc-vision/opnet-transform",
        "sourceMap": false,
        "optimizeLevel": 3,
        "shrinkLevel": 1,
        "converge": true,
        "noAssert": false,
        "enable": [
            "sign-extension",
            "mutable-globals",
            "nontrapping-f2i",
            "bulk-memory",
            "simd",
            "reference-types",
            "multi-value"
        ],
        "runtime": "stub",
        "memoryBase": 0,
        "initialMemory": 1,
        "exportStart": "start",
        "use": ["abort="]
    }
}
```

**Step 4: Create tsconfig.json**

Create `contract-stream/tsconfig.json` (copy from `contract/tsconfig.json` if it exists, or use AssemblyScript default).

**Step 5: Create empty contract class + entry point**

Create `contract-stream/src/BlockBillStreamContract.ts`:
```typescript
import { ReentrancyGuard, Calldata, BytesWriter } from '@btc-vision/btc-runtime/runtime';

export class BlockBillStreamContract extends ReentrancyGuard {
    public constructor() {
        super();
    }

    public override onDeployment(_calldata: Calldata): void {
        // TODO: implement
    }
}
```

Create `contract-stream/src/index.ts`:
```typescript
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
```

**Step 6: Install dependencies**

```bash
cd contract-stream && npm install
```

**Step 7: Verify build compiles**

```bash
cd contract-stream && npm run build
```
Expected: WASM output at `contract-stream/build/BlockBillStream.wasm`

**Step 8: Commit**

```bash
git add contract-stream/
git commit -m "feat: scaffold BlockBillStream contract project"
```

---

## Task 2: Implement Stream Contract — Storage & Deployment

**Files:**
- Modify: `contract-stream/src/BlockBillStreamContract.ts`

**Step 1: Add all storage pointers and constants**

Replace `BlockBillStreamContract.ts` with storage layout:

```typescript
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
const NET_BPS: u256 = u256.fromU32(9950);
const MAX_INDEX_ENTRIES: u32 = 1000;

export class BlockBillStreamContract extends ReentrancyGuard {
    // Global
    private readonly streamCountPointer: u16 = Blockchain.nextPointer;
    private readonly feeRecipientPointer: u16 = Blockchain.nextPointer;
    private readonly ownerPointer: u16 = Blockchain.nextPointer;

    // Per-stream field pointers
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

    // Index pointers
    private readonly pSenderCount: u16 = Blockchain.nextPointer;
    private readonly pSenderList: u16 = Blockchain.nextPointer;
    private readonly pRecipientCount: u16 = Blockchain.nextPointer;
    private readonly pRecipientList: u16 = Blockchain.nextPointer;

    private readonly streamCount: StoredU256 = new StoredU256(
        this.streamCountPointer,
        EMPTY_POINTER,
    );

    public constructor() {
        super();
    }

    // ... methods will be added in next tasks
}
```

**Step 2: Add onDeployment**

```typescript
public override onDeployment(_calldata: Calldata): void {
    const deployer: Address = Blockchain.tx.sender;
    this.storeAddressAt(this.ownerPointer, u256.Zero, deployer);
    this.storeAddressAt(this.feeRecipientPointer, u256.Zero, deployer);
}
```

**Step 3: Add storage helpers**

Copy the same `buildKey`, `storeAddressAt`, `loadAddressAt`, `storeU256At`, `loadU256At`, `storeU8At`, `loadU8At`, `storeU64At`, `loadU64At` helpers from `contract/src/BlockBillContract.ts:465-521`. These are identical.

Also add index helpers `addToSenderIndex` and `addToRecipientIndex` following the same pattern as `addToCreatorIndex`/`addToRecipientIndex` in BlockBillContract.

**Step 4: Add assertStreamExists helper**

```typescript
private assertStreamExists(streamId: u256): void {
    if (streamId == u256.Zero || streamId > this.streamCount.value) {
        throw new Revert('Stream does not exist');
    }
}
```

**Step 5: Build and verify**

```bash
cd contract-stream && npm run build
```

**Step 6: Commit**

```bash
git add contract-stream/src/BlockBillStreamContract.ts
git commit -m "feat: stream contract storage layout and deployment"
```

---

## Task 3: Implement createStream

**Files:**
- Modify: `contract-stream/src/BlockBillStreamContract.ts`

**Step 1: Add createStream method**

```typescript
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

    // Validate
    if (totalAmount == u256.Zero) throw new Revert('Amount must be > 0');
    if (ratePerBlock == u256.Zero) throw new Revert('Rate must be > 0');
    if (recipient.isZero()) throw new Revert('Recipient cannot be zero');
    if (endBlock > 0 && endBlock <= Blockchain.block.number) {
        throw new Revert('End block must be in future');
    }

    const caller: Address = Blockchain.tx.sender;
    if (caller.equals(recipient)) throw new Revert('Cannot stream to self');

    // Calculate fee
    const fee: u256 = SafeMath.div(SafeMath.mul(totalAmount, FEE_BPS), BPS_DENOMINATOR);
    const netDeposit: u256 = SafeMath.sub(totalAmount, fee);

    // Increment stream count
    this.streamCount.set(SafeMath.add(this.streamCount.value, u256.One));
    const streamId: u256 = this.streamCount.value;

    const currentBlock: u64 = Blockchain.block.number;

    // Store stream fields (effects before interactions)
    this.storeAddressAt(this.pSender, streamId, caller);
    this.storeAddressAt(this.pRecipient, streamId, recipient);
    this.storeAddressAt(this.pToken, streamId, token);
    this.storeU256At(this.pTotalDeposited, streamId, netDeposit);
    this.storeU256At(this.pRatePerBlock, streamId, ratePerBlock);
    this.storeU64At(this.pStartBlock, streamId, currentBlock);
    this.storeU64At(this.pEndBlock, streamId, endBlock);
    this.storeU64At(this.pLastWithdrawBlock, streamId, currentBlock);
    this.storeU8At(this.pStatus, streamId, STATUS_ACTIVE);

    // Indexes
    this.addToSenderIndex(caller, streamId);
    this.addToRecipientIndex(recipient, streamId);

    // Transfer tokens from sender to contract (interactions last)
    const contractAddr: Address = Blockchain.contractAddress;
    TransferHelper.transferFrom(token, caller, contractAddr, netDeposit);

    // Transfer fee
    if (fee > u256.Zero) {
        const feeRecipient: Address = this.loadAddressAt(this.feeRecipientPointer, u256.Zero);
        TransferHelper.transferFrom(token, caller, feeRecipient, fee);
    }

    const writer: BytesWriter = new BytesWriter(32);
    writer.writeU256(streamId);
    return writer;
}
```

**Step 2: Build and verify**

```bash
cd contract-stream && npm run build
```

**Step 3: Commit**

```bash
git add contract-stream/src/BlockBillStreamContract.ts
git commit -m "feat: implement createStream with fee deduction"
```

---

## Task 4: Implement withdraw and withdrawTo

**Files:**
- Modify: `contract-stream/src/BlockBillStreamContract.ts`

**Step 1: Add internal _calculateWithdrawable helper**

```typescript
private _calculateWithdrawable(streamId: u256): u256 {
    const status: u8 = this.loadU8At(this.pStatus, streamId);

    if (status == STATUS_CANCELLED) return u256.Zero;

    const totalDeposited: u256 = this.loadU256At(this.pTotalDeposited, streamId);
    const totalWithdrawn: u256 = this.loadU256At(this.pTotalWithdrawn, streamId);
    const accumulated: u256 = this.loadU256At(this.pAccumulatedBeforePause, streamId);

    if (status == STATUS_PAUSED) {
        // When paused, only accumulated-before-pause minus already withdrawn
        if (accumulated <= totalWithdrawn) return u256.Zero;
        return SafeMath.sub(accumulated, totalWithdrawn);
    }

    // ACTIVE
    const ratePerBlock: u256 = this.loadU256At(this.pRatePerBlock, streamId);
    const lastWithdraw: u64 = this.loadU64At(this.pLastWithdrawBlock, streamId);
    const endBlock: u64 = this.loadU64At(this.pEndBlock, streamId);
    const currentBlock: u64 = Blockchain.block.number;

    const effectiveEnd: u64 = (endBlock > 0 && endBlock < currentBlock) ? endBlock : currentBlock;

    if (effectiveEnd <= lastWithdraw) return u256.Zero;

    const elapsed: u256 = u256.fromU64(effectiveEnd - lastWithdraw);
    const streamed: u256 = SafeMath.add(SafeMath.mul(elapsed, ratePerBlock), accumulated);

    // Cap at total deposited
    const capped: u256 = streamed > totalDeposited ? totalDeposited : streamed;

    if (capped <= totalWithdrawn) return u256.Zero;
    return SafeMath.sub(capped, totalWithdrawn);
}
```

**Step 2: Add withdraw (third-party enabled — always sends to recipient)**

```typescript
@method({ name: 'streamId', type: ABIDataTypes.UINT256 })
@returns({ name: 'amount', type: ABIDataTypes.UINT256 })
public withdraw(calldata: Calldata): BytesWriter {
    const streamId: u256 = calldata.readU256();
    this.assertStreamExists(streamId);

    const status: u8 = this.loadU8At(this.pStatus, streamId);
    if (status == STATUS_CANCELLED) throw new Revert('Stream is cancelled');

    const withdrawable: u256 = this._calculateWithdrawable(streamId);
    if (withdrawable == u256.Zero) {
        const writer: BytesWriter = new BytesWriter(32);
        writer.writeU256(u256.Zero);
        return writer;
    }

    const recipient: Address = this.loadAddressAt(this.pRecipient, streamId);
    const token: Address = this.loadAddressAt(this.pToken, streamId);

    // Effects
    const totalWithdrawn: u256 = this.loadU256At(this.pTotalWithdrawn, streamId);
    this.storeU256At(this.pTotalWithdrawn, streamId, SafeMath.add(totalWithdrawn, withdrawable));
    this.storeU64At(this.pLastWithdrawBlock, streamId, Blockchain.block.number);
    // Clear accumulated after withdrawal
    this.storeU256At(this.pAccumulatedBeforePause, streamId, u256.Zero);

    // Interactions
    const contractAddr: Address = Blockchain.contractAddress;
    TransferHelper.safeTransfer(token, contractAddr, recipient, withdrawable);

    const writer: BytesWriter = new BytesWriter(32);
    writer.writeU256(withdrawable);
    return writer;
}
```

**Step 3: Add withdrawTo (recipient-only — sends to custom address)**

```typescript
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
    if (!caller.equals(recipient)) throw new Revert('Only recipient');

    if (to.isZero()) throw new Revert('Cannot withdraw to zero');

    const status: u8 = this.loadU8At(this.pStatus, streamId);
    if (status == STATUS_CANCELLED) throw new Revert('Stream is cancelled');

    const withdrawable: u256 = this._calculateWithdrawable(streamId);
    if (withdrawable == u256.Zero) {
        const writer: BytesWriter = new BytesWriter(32);
        writer.writeU256(u256.Zero);
        return writer;
    }

    const token: Address = this.loadAddressAt(this.pToken, streamId);

    // Effects
    const totalWithdrawn: u256 = this.loadU256At(this.pTotalWithdrawn, streamId);
    this.storeU256At(this.pTotalWithdrawn, streamId, SafeMath.add(totalWithdrawn, withdrawable));
    this.storeU64At(this.pLastWithdrawBlock, streamId, Blockchain.block.number);
    this.storeU256At(this.pAccumulatedBeforePause, streamId, u256.Zero);

    // Interactions — send to custom address
    const contractAddr: Address = Blockchain.contractAddress;
    TransferHelper.safeTransfer(token, contractAddr, to, withdrawable);

    const writer: BytesWriter = new BytesWriter(32);
    writer.writeU256(withdrawable);
    return writer;
}
```

**Step 4: Build and verify**

```bash
cd contract-stream && npm run build
```

**Step 5: Commit**

```bash
git add contract-stream/src/BlockBillStreamContract.ts
git commit -m "feat: implement withdraw and withdrawTo with third-party claims"
```

---

## Task 5: Implement topUp, cancelStream, pauseStream, resumeStream

**Files:**
- Modify: `contract-stream/src/BlockBillStreamContract.ts`

**Step 1: Add topUp**

```typescript
@method(
    { name: 'streamId', type: ABIDataTypes.UINT256 },
    { name: 'amount', type: ABIDataTypes.UINT256 },
)
@returns({ name: 'success', type: ABIDataTypes.BOOL })
public topUp(calldata: Calldata): BytesWriter {
    const streamId: u256 = calldata.readU256();
    const amount: u256 = calldata.readU256();
    this.assertStreamExists(streamId);

    if (amount == u256.Zero) throw new Revert('Amount must be > 0');

    const caller: Address = Blockchain.tx.sender;
    const sender: Address = this.loadAddressAt(this.pSender, streamId);
    if (!caller.equals(sender)) throw new Revert('Only sender');

    const status: u8 = this.loadU8At(this.pStatus, streamId);
    if (status == STATUS_CANCELLED) throw new Revert('Stream is cancelled');

    // Fee
    const fee: u256 = SafeMath.div(SafeMath.mul(amount, FEE_BPS), BPS_DENOMINATOR);
    const netAmount: u256 = SafeMath.sub(amount, fee);

    // Effects
    const totalDeposited: u256 = this.loadU256At(this.pTotalDeposited, streamId);
    this.storeU256At(this.pTotalDeposited, streamId, SafeMath.add(totalDeposited, netAmount));

    // Interactions
    const token: Address = this.loadAddressAt(this.pToken, streamId);
    const contractAddr: Address = Blockchain.contractAddress;
    TransferHelper.transferFrom(token, caller, contractAddr, netAmount);

    if (fee > u256.Zero) {
        const feeRecipient: Address = this.loadAddressAt(this.feeRecipientPointer, u256.Zero);
        TransferHelper.transferFrom(token, caller, feeRecipient, fee);
    }

    const writer: BytesWriter = new BytesWriter(1);
    writer.writeBoolean(true);
    return writer;
}
```

**Step 2: Add cancelStream**

```typescript
@method({ name: 'streamId', type: ABIDataTypes.UINT256 })
@returns({ name: 'success', type: ABIDataTypes.BOOL })
public cancelStream(calldata: Calldata): BytesWriter {
    const streamId: u256 = calldata.readU256();
    this.assertStreamExists(streamId);

    const caller: Address = Blockchain.tx.sender;
    const sender: Address = this.loadAddressAt(this.pSender, streamId);
    if (!caller.equals(sender)) throw new Revert('Only sender');

    const status: u8 = this.loadU8At(this.pStatus, streamId);
    if (status == STATUS_CANCELLED) throw new Revert('Already cancelled');

    const token: Address = this.loadAddressAt(this.pToken, streamId);
    const recipient: Address = this.loadAddressAt(this.pRecipient, streamId);
    const contractAddr: Address = Blockchain.contractAddress;

    // Calculate what recipient is owed
    const withdrawable: u256 = this._calculateWithdrawable(streamId);

    // Calculate what sender gets back
    const totalDeposited: u256 = this.loadU256At(this.pTotalDeposited, streamId);
    const totalWithdrawn: u256 = this.loadU256At(this.pTotalWithdrawn, streamId);
    const totalOwed: u256 = SafeMath.add(totalWithdrawn, withdrawable);
    const refund: u256 = totalDeposited > totalOwed ? SafeMath.sub(totalDeposited, totalOwed) : u256.Zero;

    // Effects
    this.storeU8At(this.pStatus, streamId, STATUS_CANCELLED);
    this.storeU256At(this.pTotalWithdrawn, streamId, SafeMath.add(totalWithdrawn, withdrawable));

    // Interactions — send owed to recipient
    if (withdrawable > u256.Zero) {
        TransferHelper.safeTransfer(token, contractAddr, recipient, withdrawable);
    }

    // Refund sender
    if (refund > u256.Zero) {
        TransferHelper.safeTransfer(token, contractAddr, sender, refund);
    }

    const writer: BytesWriter = new BytesWriter(1);
    writer.writeBoolean(true);
    return writer;
}
```

**Step 3: Add pauseStream**

```typescript
@method({ name: 'streamId', type: ABIDataTypes.UINT256 })
@returns({ name: 'success', type: ABIDataTypes.BOOL })
public pauseStream(calldata: Calldata): BytesWriter {
    const streamId: u256 = calldata.readU256();
    this.assertStreamExists(streamId);

    const caller: Address = Blockchain.tx.sender;
    const sender: Address = this.loadAddressAt(this.pSender, streamId);
    if (!caller.equals(sender)) throw new Revert('Only sender');

    const status: u8 = this.loadU8At(this.pStatus, streamId);
    if (status != STATUS_ACTIVE) throw new Revert('Stream is not active');

    // Snapshot current withdrawable (so recipient doesn't lose accumulated funds)
    const withdrawable: u256 = this._calculateWithdrawable(streamId);
    const totalWithdrawn: u256 = this.loadU256At(this.pTotalWithdrawn, streamId);

    // accumulatedBeforePause = what's been streamed total (withdrawn + still claimable)
    this.storeU256At(this.pAccumulatedBeforePause, streamId, SafeMath.add(totalWithdrawn, withdrawable));
    this.storeU64At(this.pPausedAtBlock, streamId, Blockchain.block.number);
    this.storeU8At(this.pStatus, streamId, STATUS_PAUSED);

    const writer: BytesWriter = new BytesWriter(1);
    writer.writeBoolean(true);
    return writer;
}
```

**Step 4: Add resumeStream**

```typescript
@method({ name: 'streamId', type: ABIDataTypes.UINT256 })
@returns({ name: 'success', type: ABIDataTypes.BOOL })
public resumeStream(calldata: Calldata): BytesWriter {
    const streamId: u256 = calldata.readU256();
    this.assertStreamExists(streamId);

    const caller: Address = Blockchain.tx.sender;
    const sender: Address = this.loadAddressAt(this.pSender, streamId);
    if (!caller.equals(sender)) throw new Revert('Only sender');

    const status: u8 = this.loadU8At(this.pStatus, streamId);
    if (status != STATUS_PAUSED) throw new Revert('Stream is not paused');

    // Reset lastWithdrawBlock to now (resume point)
    this.storeU64At(this.pLastWithdrawBlock, streamId, Blockchain.block.number);
    this.storeU64At(this.pPausedAtBlock, streamId, 0);
    this.storeU8At(this.pStatus, streamId, STATUS_ACTIVE);

    const writer: BytesWriter = new BytesWriter(1);
    writer.writeBoolean(true);
    return writer;
}
```

**Step 5: Add setFeeRecipient**

```typescript
@method({ name: 'newFeeRecipient', type: ABIDataTypes.ADDRESS })
@returns({ name: 'success', type: ABIDataTypes.BOOL })
public setFeeRecipient(calldata: Calldata): BytesWriter {
    const newFeeRecipient: Address = calldata.readAddress();
    const caller: Address = Blockchain.tx.sender;

    if (newFeeRecipient.isZero()) throw new Revert('Zero address');

    const owner: Address = this.loadAddressAt(this.ownerPointer, u256.Zero);
    if (!caller.equals(owner)) throw new Revert('Only owner');

    this.storeAddressAt(this.feeRecipientPointer, u256.Zero, newFeeRecipient);

    const writer: BytesWriter = new BytesWriter(1);
    writer.writeBoolean(true);
    return writer;
}
```

**Step 6: Build and verify**

```bash
cd contract-stream && npm run build
```

**Step 7: Commit**

```bash
git add contract-stream/src/BlockBillStreamContract.ts
git commit -m "feat: implement topUp, cancel, pause, resume, setFeeRecipient"
```

---

## Task 6: Implement Read Methods

**Files:**
- Modify: `contract-stream/src/BlockBillStreamContract.ts`

**Step 1: Add getStream**

```typescript
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

    const writer: BytesWriter = new BytesWriter(400);
    writer.writeAddress(this.loadAddressAt(this.pSender, streamId));
    writer.writeAddress(this.loadAddressAt(this.pRecipient, streamId));
    writer.writeAddress(this.loadAddressAt(this.pToken, streamId));
    writer.writeU256(this.loadU256At(this.pTotalDeposited, streamId));
    writer.writeU256(this.loadU256At(this.pTotalWithdrawn, streamId));
    writer.writeU256(this.loadU256At(this.pRatePerBlock, streamId));
    writer.writeU64(this.loadU64At(this.pStartBlock, streamId));
    writer.writeU64(this.loadU64At(this.pEndBlock, streamId));
    writer.writeU64(this.loadU64At(this.pLastWithdrawBlock, streamId));
    writer.writeU64(this.loadU64At(this.pPausedAtBlock, streamId));
    writer.writeU256(this.loadU256At(this.pAccumulatedBeforePause, streamId));
    writer.writeU8(this.loadU8At(this.pStatus, streamId));
    return writer;
}
```

**Step 2: Add getWithdrawable**

```typescript
@method({ name: 'streamId', type: ABIDataTypes.UINT256 })
@returns({ name: 'amount', type: ABIDataTypes.UINT256 })
public getWithdrawable(calldata: Calldata): BytesWriter {
    const streamId: u256 = calldata.readU256();
    const withdrawable: u256 = this._calculateWithdrawable(streamId);
    const writer: BytesWriter = new BytesWriter(32);
    writer.writeU256(withdrawable);
    return writer;
}
```

**Step 3: Add getStreamsBySender and getStreamsByRecipient**

Follow exact same pattern as `getInvoicesByCreator`/`getInvoicesByRecipient` in BlockBillContract (lines 398-442), substituting `pSenderCount`/`pSenderList` and `pRecipientCount`/`pRecipientList`.

**Step 4: Add getStreamCount**

```typescript
@method()
@returns({ name: 'count', type: ABIDataTypes.UINT256 })
public getStreamCount(_calldata: Calldata): BytesWriter {
    const writer: BytesWriter = new BytesWriter(32);
    writer.writeU256(this.streamCount.value);
    return writer;
}
```

**Step 5: Build and verify**

```bash
cd contract-stream && npm run build
```

**Step 6: Commit**

```bash
git add contract-stream/src/BlockBillStreamContract.ts
git commit -m "feat: implement stream read methods"
```

---

## Task 7: Frontend — ABI, Config, Types

**Files:**
- Create: `frontend/src/abi/BlockBillStreamABI.ts`
- Modify: `frontend/src/config/contracts.ts`
- Create: `frontend/src/types/stream.ts`

**Step 1: Create stream types**

Create `frontend/src/types/stream.ts`:
```typescript
export enum StreamStatus {
    Active = 0,
    Paused = 1,
    Cancelled = 2,
}

export interface StreamData {
    readonly id: number;
    readonly sender: string;
    readonly recipient: string;
    readonly token: string;
    readonly totalDeposited: bigint;
    readonly totalWithdrawn: bigint;
    readonly ratePerBlock: bigint;
    readonly startBlock: bigint;
    readonly endBlock: bigint;
    readonly lastWithdrawBlock: bigint;
    readonly pausedAtBlock: bigint;
    readonly accumulatedBeforePause: bigint;
    readonly status: StreamStatus;
}
```

**Step 2: Create stream ABI**

Create `frontend/src/abi/BlockBillStreamABI.ts` following same pattern as `frontend/src/abi/BlockBillABI.ts`:
- All methods from the contract with correct ABIDataTypes
- `IBlockBillStreamContract` interface extending `BaseContractProperties`
- Mark read methods with `constant: true`

**Step 3: Add stream contract address to config**

Modify `frontend/src/config/contracts.ts`:
- Add `blockbillStream: string` to `ContractAddresses` interface
- Add placeholder address `''` for all networks (filled after deployment)
- Add `getBlockBillStreamAddress(network)` function

**Step 4: Commit**

```bash
git add frontend/src/abi/BlockBillStreamABI.ts frontend/src/types/stream.ts frontend/src/config/contracts.ts
git commit -m "feat: add stream ABI, types, and contract config"
```

---

## Task 8: Frontend — Stream Service and Hooks

**Files:**
- Modify: `frontend/src/services/ContractService.ts`
- Create: `frontend/src/hooks/useStream.ts`
- Create: `frontend/src/hooks/useStreamActions.ts`

**Step 1: Add stream contract to ContractService**

Add to `frontend/src/services/ContractService.ts`:
```typescript
import { BLOCKBILL_STREAM_ABI } from '../abi/BlockBillStreamABI';
import type { IBlockBillStreamContract } from '../abi/BlockBillStreamABI';
import { getBlockBillStreamAddress } from '../config/contracts';

// Add method:
public getStreamContract(network: Network, sender?: Address): IBlockBillStreamContract {
    const address = getBlockBillStreamAddress(network);
    const key = `stream:${address}:${sender?.toString() ?? 'none'}`;
    const existing = this.contracts.get(key) as IBlockBillStreamContract | undefined;
    if (existing) return existing;
    const provider = providerService.getProvider(network);
    const contract = getContract<IBlockBillStreamContract>(
        address, BLOCKBILL_STREAM_ABI, provider, network, sender
    );
    this.contracts.set(key, contract);
    return contract;
}
```

**Step 2: Create useStream hook**

Create `frontend/src/hooks/useStream.ts`:
- Fetches stream data by ID via `getStream()`
- Polls `getWithdrawable()` every ~10 seconds for real-time display
- Returns `{ stream, withdrawable, loading, error, refresh }`
- Handles address parsing (Address objects → hex strings via `parseStreamProperties()`)

**Step 3: Create useStreamActions hook**

Create `frontend/src/hooks/useStreamActions.ts`:
- Wraps all write methods: `createStream`, `withdraw`, `withdrawTo`, `topUp`, `cancelStream`, `pauseStream`, `resumeStream`
- Each method: simulate → sendTransaction (signer: null for frontend)
- Uses `useWalletConnect()` for address/walletAddress
- Uses `useNetwork()` for network
- Returns `{ createStream, withdraw, withdrawTo, topUp, cancel, pause, resume, loading }`

**Step 4: Create useStreamApproval hook**

Create `frontend/src/hooks/useStreamApproval.ts`:
- Same pattern as `useTokenApproval` but spender = stream contract address
- `checkAllowance(tokenAddress)` and `approve(tokenAddress, amount?)`

**Step 5: Commit**

```bash
git add frontend/src/services/ContractService.ts frontend/src/hooks/useStream.ts frontend/src/hooks/useStreamActions.ts frontend/src/hooks/useStreamApproval.ts
git commit -m "feat: add stream contract service and hooks"
```

---

## Task 9: Frontend — CreateStream Page

**Files:**
- Create: `frontend/src/pages/CreateStream.tsx`
- Modify: `frontend/src/App.tsx` (add route)

**Step 1: Create CreateStream page**

Create `frontend/src/pages/CreateStream.tsx`:
- Follow same layout pattern as `CreateInvoice.tsx` (split form + preview)
- Form fields:
  - Token selector (reuse `getKnownTokens` + custom token input)
  - Recipient address input (with `useAddressValidation`)
  - Total deposit amount (with balance display)
  - Rate input with helper: tokens/block with estimated ~per hour, ~per day, ~per month
    - Bitcoin ~10 min/block → ~6/hr, ~144/day, ~4320/month
  - Duration toggle: Infinite (endBlock=0) vs Fixed (date picker → estimated block)
  - Fee preview (0.5%)
- Live preview panel showing stream summary in PaperCard
- 2-step flow: Approve token → Create stream
- On success: navigate to `/stream/:id`

**Step 2: Add route to App.tsx**

```typescript
import { CreateStream } from './pages/CreateStream';
// Add in Routes:
<Route path="/streams/create" element={<CreateStream />} />
```

**Step 3: Commit**

```bash
git add frontend/src/pages/CreateStream.tsx frontend/src/App.tsx
git commit -m "feat: add CreateStream page with form and preview"
```

---

## Task 10: Frontend — StreamView Page

**Files:**
- Create: `frontend/src/pages/StreamView.tsx`
- Modify: `frontend/src/App.tsx` (add route)

**Step 1: Create StreamView page**

Create `frontend/src/pages/StreamView.tsx`:
- Uses `useStream(id)` for data + real-time withdrawable
- **Progress visualization:** Animated bar showing streamed vs total (ink flowing metaphor)
  - CSS animation: gradient flowing left-to-right
  - Percentage: `(totalWithdrawn + withdrawable) / totalDeposited * 100`
- **Key metrics grid:**
  - Total Deposited
  - Streamed So Far (totalWithdrawn + withdrawable)
  - Already Withdrawn
  - Currently Claimable (withdrawable, updating in real-time)
  - Remaining (totalDeposited - totalWithdrawn - withdrawable)
  - Rate (X tokens/block ≈ Y/day)
- **StampBadge** for status: ACTIVE (green), PAUSED (orange), CANCELLED (red)
- **Actions (contextual on wallet connection):**
  - If user is recipient: Withdraw button, Withdraw To button (shows address input)
  - If user is sender: Top Up (amount input), Pause/Resume toggle, Cancel button
  - If user is third party: Withdraw button (sends to recipient)
- **Share:** Copy link + QR code (reuse from InvoiceView pattern)

**Step 2: Add route**

```typescript
import { StreamView } from './pages/StreamView';
<Route path="/stream/:id" element={<StreamView />} />
```

**Step 3: Commit**

```bash
git add frontend/src/pages/StreamView.tsx frontend/src/App.tsx
git commit -m "feat: add StreamView page with live visualization and actions"
```

---

## Task 11: Frontend — StreamDashboard Page

**Files:**
- Create: `frontend/src/pages/StreamDashboard.tsx`
- Modify: `frontend/src/App.tsx` (add route)

**Step 1: Create StreamDashboard page**

Create `frontend/src/pages/StreamDashboard.tsx`:
- Follow same pattern as `Dashboard.tsx`
- Tabs: "Sending" / "Receiving"
- Status filters: All, Active, Paused, Cancelled
- Each stream card shows:
  - Counterparty (recipient if sending, sender if receiving)
  - Token + rate per block
  - Mini progress bar
  - Withdrawable amount (for receiving tab)
  - StampBadge for status
  - Link to `/stream/:id`
- Fetches streams: `getStreamCount()` → scan all → filter by wallet
- Same pattern as Dashboard invoice scanning

**Step 2: Add route**

```typescript
import { StreamDashboard } from './pages/StreamDashboard';
<Route path="/streams" element={<StreamDashboard />} />
```

**Step 3: Commit**

```bash
git add frontend/src/pages/StreamDashboard.tsx frontend/src/App.tsx
git commit -m "feat: add StreamDashboard page with tabs and filters"
```

---

## Task 12: Frontend — Navigation Update

**Files:**
- Modify: `frontend/src/components/layout/Header.tsx`

**Step 1: Add Streams nav link**

In `Header.tsx`, add "Streams" to both desktop and mobile nav:

Desktop nav (line 32, after Dashboard link):
```tsx
<Link to="/streams" className={navLinkClass('/streams')}>Streams</Link>
```

Mobile nav (after Dashboard link, around line 80):
```tsx
<Link to="/streams" onClick={closeMobile}
    className={`py-3 px-3 rounded-lg text-sm font-medium ${isActive('/streams') ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]' : 'text-[var(--ink-medium)]'}`}>
    Streams
</Link>
```

**Step 2: Update isActive to support sub-paths**

The `/streams/create` and `/stream/:id` routes should also highlight "Streams" nav:
```typescript
const isActive = (path: string): boolean => {
    if (path === '/streams') {
        return location.pathname === '/streams' || location.pathname.startsWith('/stream');
    }
    return location.pathname === path;
};
```

**Step 3: Commit**

```bash
git add frontend/src/components/layout/Header.tsx
git commit -m "feat: add Streams link to navigation"
```

---

## Task 13: Frontend — Landing Page Update

**Files:**
- Modify: `frontend/src/pages/Landing.tsx`

**Step 1: Add streaming section to landing page**

Add a new feature section below existing features highlighting streaming payments:
- "Stream payments by the block" headline
- Brief description of the streaming feature
- CTA button linking to `/streams/create`

Keep it concise — 1 additional feature card or section, matching existing design.

**Step 2: Commit**

```bash
git add frontend/src/pages/Landing.tsx
git commit -m "feat: add streaming payments to landing page"
```

---

## Task 14: Build Contract & Deploy

**Step 1: Final contract build**

```bash
cd contract-stream && npm run build
```

Verify `contract-stream/build/BlockBillStream.wasm` exists.

**Step 2: Deploy via OP_WALLET**

Use OP_WALLET to deploy the WASM to OPNet testnet. Record the contract address.

**Step 3: Update contract config**

Update `frontend/src/config/contracts.ts` with the deployed address for `opnetTestnet`.

**Step 4: Commit**

```bash
git add frontend/src/config/contracts.ts
git commit -m "feat: add deployed BlockBillStream contract address"
```

---

## Task 15: Integration Test & Polish

**Step 1: Frontend build check**

```bash
cd frontend && npm run build
```

Fix any TypeScript errors.

**Step 2: Manual integration test**

- Create a stream on testnet
- Verify stream appears in dashboard
- Wait a few blocks, check withdrawable updates
- Withdraw funds
- Test pause/resume
- Test cancel with refund
- Test top-up

**Step 3: Final commit**

```bash
git add -A
git commit -m "fix: polish streaming payments integration"
```
