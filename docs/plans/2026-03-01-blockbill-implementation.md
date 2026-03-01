# BlockBill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and deploy an on-chain invoicing dApp on Bitcoin L1 via OPNet — smart contract + React frontend with Paper/Stationery theme.

**Architecture:** Single `BlockBillContract` (AssemblyScript) deployed on OPNet testnet. React 19 + Vite frontend reads/writes contract state via OPNet SDK. Monorepo with `/contract` and `/frontend` directories.

**Tech Stack:** AssemblyScript (btc-runtime), React 19, Vite, TypeScript strict, Tailwind CSS, OPNet SDK (`opnet`), `@btc-vision/walletconnect` v2, `@btc-vision/bitcoin` (networks.opnetTestnet)

**OPNet Rules (MUST follow):**
- No `Buffer` — use `Uint8Array` + `BufferHelper`
- No raw PSBT — use `getContract()` from `opnet`
- Frontend: `signer: null`, `mldsaSigner: null` in `sendTransaction()`
- Always simulate before send
- `networks.opnetTestnet` for testnet (NOT `networks.testnet`)
- SafeMath for ALL u256 operations in contract
- No `any`, no `!`, strict TypeScript

---

## Task 1: Contract Project Scaffold

**Files:**
- Create: `contract/package.json`
- Create: `contract/asconfig.json`
- Create: `contract/tsconfig.json`
- Create: `contract/eslint.config.js`
- Create: `contract/src/index.ts`

**Step 1: Create contract directory and package.json**

```json
{
    "name": "blockbill-contract",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
        "build": "asc src/index.ts --config asconfig.json --target debug",
        "clean": "rm -rf build/*",
        "lint": "eslint src/"
    },
    "dependencies": {
        "@btc-vision/as-bignum": "0.1.2",
        "@btc-vision/btc-runtime": "rc"
    },
    "devDependencies": {
        "@btc-vision/assemblyscript": "^0.29.2",
        "@btc-vision/opnet-transform": "1.1.0",
        "@assemblyscript/loader": "latest",
        "eslint": "^9.39.2",
        "@eslint/js": "^9.39.2",
        "typescript-eslint": "^8.56.0"
    },
    "overrides": {
        "@noble/hashes": "2.0.1"
    }
}
```

**Step 2: Create asconfig.json**

Use exact OPNet config from guidelines (transform: `@btc-vision/opnet-transform`, all WASM features enabled, `runtime: "stub"`, `exportStart: "start"`, `use: ["abort=index/abort"]`). Output to `build/BlockBill.wasm`.

**Step 3: Create tsconfig.json for IDE support**

```json
{
    "extends": "./node_modules/@btc-vision/assemblyscript/std/assembly.json",
    "compilerOptions": {
        "strict": true,
        "target": "ESNext",
        "module": "ESNext",
        "experimentalDecorators": true
    },
    "include": ["src/**/*.ts"]
}
```

**Step 4: Create eslint.config.js**

Copy the OPNet contract ESLint config (flat config with `strictTypeChecked`, `experimentalDecorators`, no floats rule).

**Step 5: Create contract entry point `contract/src/index.ts`**

```typescript
import { Blockchain } from '@btc-vision/btc-runtime/runtime';
import { BlockBillContract } from './BlockBillContract';
import { revertOnError } from '@btc-vision/btc-runtime/runtime/abort/abort';

Blockchain.contract = (): BlockBillContract => {
    return new BlockBillContract();
};

export * from '@btc-vision/btc-runtime/runtime/exports';

export function abort(message: string, fileName: string, line: u32, column: u32): void {
    revertOnError(message, fileName, line, column);
}
```

**Step 6: Install dependencies**

```bash
cd contract
npm uninstall assemblyscript 2>/dev/null
npm install
```

**Step 7: Commit**

```bash
git add contract/
git commit -m "feat(contract): scaffold BlockBill contract project"
```

---

## Task 2: Smart Contract — Storage & Core Types

**Files:**
- Create: `contract/src/BlockBillContract.ts`

**Step 1: Define the contract class with storage pointers**

The contract extends `OP_NET`. Storage layout:

```typescript
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
    StoredU64,
    StoredString,
    StoredBoolean,
    AddressMemoryMap,
    EMPTY_POINTER,
} from '@btc-vision/btc-runtime/runtime';

// Invoice status constants
const STATUS_PENDING: u8 = 0;
const STATUS_PAID: u8 = 1;
const STATUS_EXPIRED: u8 = 2;
const STATUS_CANCELLED: u8 = 3;

// Fee: 50 basis points = 0.5%
const FEE_BPS: u256 = u256.fromU32(50);
const BPS_DENOMINATOR: u256 = u256.fromU32(10000);
const MAX_LINE_ITEMS: u32 = 10;
const MAX_MEMO_LENGTH: u32 = 200;
const MAX_DESCRIPTION_LENGTH: u32 = 100;

export class BlockBillContract extends OP_NET {
    // === Selectors ===
    private readonly createInvoiceSelector: Selector = encodeSelector('createInvoice(address,uint256,address,string,uint64,uint16)');
    private readonly payInvoiceSelector: Selector = encodeSelector('payInvoice(uint256)');
    private readonly cancelInvoiceSelector: Selector = encodeSelector('cancelInvoice(uint256)');
    private readonly markAsPaidBTCSelector: Selector = encodeSelector('markAsPaidBTC(uint256,string)');
    private readonly getInvoiceSelector: Selector = encodeSelector('getInvoice(uint256)');
    private readonly getLineItemsSelector: Selector = encodeSelector('getLineItems(uint256)');
    private readonly getInvoicesByCreatorSelector: Selector = encodeSelector('getInvoicesByCreator(address)');
    private readonly getInvoicesByRecipientSelector: Selector = encodeSelector('getInvoicesByRecipient(address)');
    private readonly setFeeRecipientSelector: Selector = encodeSelector('setFeeRecipient(address)');

    // === Storage Pointers ===
    private readonly invoiceCountPointer: u16 = Blockchain.nextPointer;
    private readonly feeRecipientPointer: u16 = Blockchain.nextPointer;

    // Invoice fields - each uses a StoredMapU256 keyed by invoiceId
    // We use separate maps for each field to avoid complex serialization
    private readonly invoiceCreatorPointer: u16 = Blockchain.nextPointer;
    private readonly invoiceTokenPointer: u16 = Blockchain.nextPointer;
    private readonly invoiceTotalAmountPointer: u16 = Blockchain.nextPointer;
    private readonly invoiceRecipientPointer: u16 = Blockchain.nextPointer;
    private readonly invoiceMemoPointer: u16 = Blockchain.nextPointer;
    private readonly invoiceDeadlinePointer: u16 = Blockchain.nextPointer;
    private readonly invoiceTaxBpsPointer: u16 = Blockchain.nextPointer;
    private readonly invoiceStatusPointer: u16 = Blockchain.nextPointer;
    private readonly invoicePaidByPointer: u16 = Blockchain.nextPointer;
    private readonly invoicePaidAtBlockPointer: u16 = Blockchain.nextPointer;
    private readonly invoiceCreatedAtBlockPointer: u16 = Blockchain.nextPointer;
    private readonly invoiceBtcTxHashPointer: u16 = Blockchain.nextPointer;
    private readonly invoiceLineItemCountPointer: u16 = Blockchain.nextPointer;

    // Line items: keyed by (invoiceId * MAX_LINE_ITEMS + index)
    private readonly lineItemDescriptionPointer: u16 = Blockchain.nextPointer;
    private readonly lineItemAmountPointer: u16 = Blockchain.nextPointer;

    // Index maps: creator/recipient -> list of invoice IDs
    private readonly creatorInvoiceCountPointer: u16 = Blockchain.nextPointer;
    private readonly creatorInvoiceListPointer: u16 = Blockchain.nextPointer;
    private readonly recipientInvoiceCountPointer: u16 = Blockchain.nextPointer;
    private readonly recipientInvoiceListPointer: u16 = Blockchain.nextPointer;

    // === Storage Instances ===
    private readonly invoiceCount: StoredU256 = new StoredU256(this.invoiceCountPointer, u256.Zero);

    // ... (storage maps instantiated per-pointer)

    public constructor() {
        super();
    }

    public override onDeployment(_calldata: Calldata): void {
        // Set fee recipient to deployer
        this.storeFeeRecipient(Blockchain.tx.sender);
    }

    public override callMethod(calldata: Calldata): BytesWriter {
        const selector = calldata.readSelector();

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
                return this.getInvoice(calldata);
            case this.getLineItemsSelector:
                return this.getLineItems(calldata);
            case this.getInvoicesByCreatorSelector:
                return this.getInvoicesByCreator(calldata);
            case this.getInvoicesByRecipientSelector:
                return this.getInvoicesByRecipient(calldata);
            case this.setFeeRecipientSelector:
                return this.setFeeRecipient(calldata);
            default:
                return super.callMethod(calldata);
        }
    }
}
```

**Step 2: Commit**

```bash
git add contract/src/BlockBillContract.ts
git commit -m "feat(contract): define BlockBillContract storage layout and selectors"
```

---

## Task 3: Smart Contract — createInvoice Method

**Files:**
- Modify: `contract/src/BlockBillContract.ts`

**Step 1: Implement createInvoice**

The method reads from calldata:
- `token` (Address) — required
- `totalAmount` (u256) — required
- `recipient` (Address) — optional (Address.dead() = open)
- `memo` (string) — optional
- `deadline` (u64) — optional (0 = none)
- `taxBps` (u16) — optional (0 = no tax)
- `lineItemCount` (u16) — how many line items follow
- For each line item: `description` (string) + `amount` (u256)

```typescript
@method(
    { name: 'token', type: ABIDataTypes.ADDRESS },
    { name: 'totalAmount', type: ABIDataTypes.UINT256 },
    { name: 'recipient', type: ABIDataTypes.ADDRESS },
    { name: 'memo', type: ABIDataTypes.STRING },
    { name: 'deadline', type: ABIDataTypes.UINT64 },
    { name: 'taxBps', type: ABIDataTypes.UINT16 },
    { name: 'lineItems', type: ABIDataTypes.TUPLE, components: [
        { name: 'description', type: ABIDataTypes.STRING },
        { name: 'amount', type: ABIDataTypes.UINT256 },
    ]}
)
@returns({ name: 'invoiceId', type: ABIDataTypes.UINT256 })
private createInvoice(calldata: Calldata): BytesWriter {
    const token: Address = calldata.readAddress();
    const totalAmount: u256 = calldata.readU256();
    const recipient: Address = calldata.readAddress();
    const memo: string = calldata.readStringWithLength();
    const deadline: u64 = calldata.readU64();
    const taxBps: u16 = calldata.readU16();
    const lineItemCount: u16 = calldata.readU16();

    // Validations
    if (totalAmount == u256.Zero) {
        Revert('Amount must be > 0');
    }
    if (lineItemCount > <u16>MAX_LINE_ITEMS) {
        Revert('Too many line items');
    }

    // Increment invoice counter
    const invoiceId: u256 = SafeMath.add(this.invoiceCount.get(), u256.One);
    this.invoiceCount.set(invoiceId);

    const creator: Address = Blockchain.tx.sender;

    // Store invoice fields
    this.storeAddress(this.invoiceCreatorPointer, invoiceId, creator);
    this.storeAddress(this.invoiceTokenPointer, invoiceId, token);
    this.storeU256(this.invoiceTotalAmountPointer, invoiceId, totalAmount);
    this.storeAddress(this.invoiceRecipientPointer, invoiceId, recipient);
    this.storeString(this.invoiceMemoPointer, invoiceId, memo);
    this.storeU64(this.invoiceDeadlinePointer, invoiceId, deadline);
    this.storeU16(this.invoiceTaxBpsPointer, invoiceId, taxBps);
    this.storeU8(this.invoiceStatusPointer, invoiceId, STATUS_PENDING);
    this.storeU64(this.invoiceCreatedAtBlockPointer, invoiceId, Blockchain.block.number);
    this.storeU16(this.invoiceLineItemCountPointer, invoiceId, lineItemCount);

    // Store line items
    for (let i: u16 = 0; i < lineItemCount; i++) {
        const desc: string = calldata.readStringWithLength();
        const amount: u256 = calldata.readU256();
        const itemKey: u256 = SafeMath.add(
            SafeMath.mul(invoiceId, u256.fromU32(MAX_LINE_ITEMS)),
            u256.fromU32(<u32>i)
        );
        this.storeString(this.lineItemDescriptionPointer, itemKey, desc);
        this.storeU256(this.lineItemAmountPointer, itemKey, amount);
    }

    // Index: add to creator's invoice list
    this.addToCreatorIndex(creator, invoiceId);
    // Index: add to recipient's invoice list (if specific)
    if (recipient != Address.dead()) {
        this.addToRecipientIndex(recipient, invoiceId);
    }

    const writer = new BytesWriter(32);
    writer.writeU256(invoiceId);
    return writer;
}
```

Note: The exact storage helper methods (`storeAddress`, `storeU256`, `storeString`, etc.) will use `Nested` storage patterns or manual pointer arithmetic — the implementation detail depends on what btc-runtime supports. We'll use `StoredMapU256` for u256-keyed lookups.

**Step 2: Commit**

```bash
git add contract/src/BlockBillContract.ts
git commit -m "feat(contract): implement createInvoice method"
```

---

## Task 4: Smart Contract — payInvoice Method

**Files:**
- Modify: `contract/src/BlockBillContract.ts`

**Step 1: Implement payInvoice**

This is the critical payment method. It:
1. Validates invoice exists and is pending
2. Checks deadline not passed
3. Checks caller is allowed recipient (if set)
4. Calls OP-20 `transferFrom(payer, creator, amount - fee)`
5. Calls OP-20 `transferFrom(payer, feeRecipient, fee)`
6. Updates status to paid

```typescript
@method({ name: 'invoiceId', type: ABIDataTypes.UINT256 })
@returns({ name: 'success', type: ABIDataTypes.BOOL })
private payInvoice(calldata: Calldata): BytesWriter {
    const invoiceId: u256 = calldata.readU256();
    const payer: Address = Blockchain.tx.sender;

    // Load invoice
    const status: u8 = this.loadU8(this.invoiceStatusPointer, invoiceId);
    if (status != STATUS_PENDING) {
        Revert('Invoice not pending');
    }

    // Check deadline
    const deadline: u64 = this.loadU64(this.invoiceDeadlinePointer, invoiceId);
    if (deadline > 0 && Blockchain.block.number > deadline) {
        Revert('Invoice expired');
    }

    // Check recipient restriction
    const recipient: Address = this.loadAddress(this.invoiceRecipientPointer, invoiceId);
    if (recipient != Address.dead() && recipient != payer) {
        Revert('Not authorized to pay');
    }

    const creator: Address = this.loadAddress(this.invoiceCreatorPointer, invoiceId);
    const totalAmount: u256 = this.loadU256(this.invoiceTotalAmountPointer, invoiceId);
    const token: Address = this.loadAddress(this.invoiceTokenPointer, invoiceId);

    // Calculate fee: totalAmount * 50 / 10000 = 0.5%
    const fee: u256 = SafeMath.div(SafeMath.mul(totalAmount, FEE_BPS), BPS_DENOMINATOR);
    const creatorAmount: u256 = SafeMath.sub(totalAmount, fee);

    // Execute OP-20 transfers via cross-contract calls
    // transferFrom(payer, creator, creatorAmount)
    // transferFrom(payer, feeRecipient, fee)
    // Note: Payer must have approved this contract for totalAmount on the token
    this.callTokenTransferFrom(token, payer, creator, creatorAmount);
    if (fee > u256.Zero) {
        const feeRecipient: Address = this.loadFeeRecipient();
        this.callTokenTransferFrom(token, payer, feeRecipient, fee);
    }

    // Update status
    this.storeU8(this.invoiceStatusPointer, invoiceId, STATUS_PAID);
    this.storeAddress(this.invoicePaidByPointer, invoiceId, payer);
    this.storeU64(this.invoicePaidAtBlockPointer, invoiceId, Blockchain.block.number);

    const writer = new BytesWriter(1);
    writer.writeBoolean(true);
    return writer;
}
```

**Step 2: Implement `callTokenTransferFrom` helper**

Uses OPNet cross-contract call mechanism to invoke the OP-20 token's `transferFrom`.

**Step 3: Commit**

```bash
git add contract/src/BlockBillContract.ts
git commit -m "feat(contract): implement payInvoice with OP-20 transferFrom + fee"
```

---

## Task 5: Smart Contract — cancelInvoice & markAsPaidBTC

**Files:**
- Modify: `contract/src/BlockBillContract.ts`

**Step 1: Implement cancelInvoice**

```typescript
@method({ name: 'invoiceId', type: ABIDataTypes.UINT256 })
@returns({ name: 'success', type: ABIDataTypes.BOOL })
private cancelInvoice(calldata: Calldata): BytesWriter {
    const invoiceId: u256 = calldata.readU256();
    const caller: Address = Blockchain.tx.sender;

    const creator: Address = this.loadAddress(this.invoiceCreatorPointer, invoiceId);
    if (caller != creator) {
        Revert('Only creator can cancel');
    }

    const status: u8 = this.loadU8(this.invoiceStatusPointer, invoiceId);
    if (status != STATUS_PENDING) {
        Revert('Can only cancel pending invoices');
    }

    this.storeU8(this.invoiceStatusPointer, invoiceId, STATUS_CANCELLED);

    const writer = new BytesWriter(1);
    writer.writeBoolean(true);
    return writer;
}
```

**Step 2: Implement markAsPaidBTC**

```typescript
@method(
    { name: 'invoiceId', type: ABIDataTypes.UINT256 },
    { name: 'btcTxHash', type: ABIDataTypes.STRING }
)
@returns({ name: 'success', type: ABIDataTypes.BOOL })
private markAsPaidBTC(calldata: Calldata): BytesWriter {
    const invoiceId: u256 = calldata.readU256();
    const btcTxHash: string = calldata.readStringWithLength();
    const caller: Address = Blockchain.tx.sender;

    const creator: Address = this.loadAddress(this.invoiceCreatorPointer, invoiceId);
    if (caller != creator) {
        Revert('Only creator can mark BTC paid');
    }

    const status: u8 = this.loadU8(this.invoiceStatusPointer, invoiceId);
    if (status != STATUS_PENDING) {
        Revert('Can only mark pending invoices');
    }

    this.storeU8(this.invoiceStatusPointer, invoiceId, STATUS_PAID);
    this.storeString(this.invoiceBtcTxHashPointer, invoiceId, btcTxHash);
    this.storeAddress(this.invoicePaidByPointer, invoiceId, caller);
    this.storeU64(this.invoicePaidAtBlockPointer, invoiceId, Blockchain.block.number);

    const writer = new BytesWriter(1);
    writer.writeBoolean(true);
    return writer;
}
```

**Step 3: Commit**

```bash
git add contract/src/BlockBillContract.ts
git commit -m "feat(contract): implement cancelInvoice and markAsPaidBTC"
```

---

## Task 6: Smart Contract — View Methods

**Files:**
- Modify: `contract/src/BlockBillContract.ts`

**Step 1: Implement getInvoice (read-only)**

Returns all invoice fields for a given invoiceId.

**Step 2: Implement getLineItems (read-only)**

Returns all line items for a given invoiceId.

**Step 3: Implement getInvoicesByCreator and getInvoicesByRecipient**

Returns list of invoice IDs for a given address.

**Step 4: Implement setFeeRecipient (owner-only)**

Allow deployer to update the fee recipient address.

**Step 5: Build and verify compilation**

```bash
cd contract && npm run build
```

Expected: `build/BlockBill.wasm` generated without errors.

**Step 6: Commit**

```bash
git add contract/
git commit -m "feat(contract): implement view methods and build contract"
```

---

## Task 7: Frontend Project Scaffold

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.app.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/eslint.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`

**Step 1: Create Vite + React project**

```bash
cd frontend
npm create vite@latest . -- --template react-ts
```

**Step 2: Install OPNet dependencies**

```bash
rm -rf node_modules package-lock.json
npx npm-check-updates -u && npm i @btc-vision/bitcoin@rc @btc-vision/bip32@latest @btc-vision/ecpair@latest @btc-vision/transaction@rc opnet@rc @btc-vision/walletconnect --prefer-online
npm i -D eslint@^10.0.0 @eslint/js@^10.0.1 typescript-eslint@^8.56.0 eslint-plugin-react-hooks eslint-plugin-react-refresh vite-plugin-node-polyfills vite-plugin-eslint2
npm i react-router-dom tailwindcss @tailwindcss/vite
```

**Step 3: Replace vite.config.ts with OPNet production config**

Use the exact vite.config.ts from OPNet guidelines (nodePolyfills first, undici alias, dedupe, manualChunks).

**Step 4: Replace eslint.config.js with OPNet React config**

Copy the OPNet React ESLint flat config.

**Step 5: Setup tsconfig.json with strict settings**

```json
{
    "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true,
        "noUncheckedIndexedAccess": true,
        "module": "ESNext",
        "target": "ESNext",
        "moduleResolution": "bundler",
        "jsx": "react-jsx",
        "lib": ["ESNext", "DOM", "DOM.Iterable"],
        "skipLibCheck": true,
        "outDir": "dist"
    },
    "include": ["src"]
}
```

**Step 6: Setup index.html + main.tsx with WalletConnectProvider**

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WalletConnectProvider } from '@btc-vision/walletconnect';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <WalletConnectProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </WalletConnectProvider>
    </StrictMode>
);
```

**Step 7: Verify dev server starts**

```bash
cd frontend && npm run dev
```

**Step 8: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): scaffold React + Vite + OPNet + WalletConnect"
```

---

## Task 8: Frontend — Config & Services (OPNet patterns)

**Files:**
- Create: `frontend/src/config/networks.ts`
- Create: `frontend/src/config/contracts.ts`
- Create: `frontend/src/services/ProviderService.ts`
- Create: `frontend/src/services/ContractService.ts`

**Step 1: Network config**

Define `NETWORK_CONFIGS` map with `networks.opnetTestnet` and `networks.bitcoin`. Use `networks.opnetTestnet` for testnet RPC URL `https://testnet.opnet.org`.

**Step 2: Contract addresses config**

Map of network → BlockBill contract address (placeholder for testnet, filled after deployment).

**Step 3: ProviderService singleton**

Follow OPNet guideline exactly: `JSONRpcProvider`, one instance per network, cached in `Map<string, JSONRpcProvider>`.

**Step 4: ContractService singleton**

Cache contract instances keyed by `${networkId}:${address}`. Clear on network change.

**Step 5: Commit**

```bash
git add frontend/src/config/ frontend/src/services/
git commit -m "feat(frontend): add network config and provider/contract services"
```

---

## Task 9: Frontend — BlockBill ABI & Contract Interface

**Files:**
- Create: `frontend/src/abi/BlockBillABI.ts`
- Create: `frontend/src/types/invoice.ts`

**Step 1: Define BlockBill ABI**

```typescript
import { ABIDataTypes, BitcoinAbiTypes, BitcoinInterfaceAbi } from 'opnet';

export const BLOCKBILL_ABI: BitcoinInterfaceAbi = [
    {
        name: 'createInvoice',
        type: BitcoinAbiTypes.Function,
        inputs: [
            { name: 'token', type: ABIDataTypes.ADDRESS },
            { name: 'totalAmount', type: ABIDataTypes.UINT256 },
            { name: 'recipient', type: ABIDataTypes.ADDRESS },
            { name: 'memo', type: ABIDataTypes.STRING },
            { name: 'deadline', type: ABIDataTypes.UINT64 },
            { name: 'taxBps', type: ABIDataTypes.UINT16 },
            { name: 'lineItems', type: ABIDataTypes.TUPLE, components: [
                { name: 'description', type: ABIDataTypes.STRING },
                { name: 'amount', type: ABIDataTypes.UINT256 },
            ]},
        ],
        outputs: [{ name: 'invoiceId', type: ABIDataTypes.UINT256 }],
    },
    {
        name: 'payInvoice',
        type: BitcoinAbiTypes.Function,
        inputs: [{ name: 'invoiceId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
    {
        name: 'cancelInvoice',
        type: BitcoinAbiTypes.Function,
        inputs: [{ name: 'invoiceId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
    {
        name: 'markAsPaidBTC',
        type: BitcoinAbiTypes.Function,
        inputs: [
            { name: 'invoiceId', type: ABIDataTypes.UINT256 },
            { name: 'btcTxHash', type: ABIDataTypes.STRING },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
    {
        name: 'getInvoice',
        type: BitcoinAbiTypes.Function,
        constant: true,
        inputs: [{ name: 'invoiceId', type: ABIDataTypes.UINT256 }],
        outputs: [
            { name: 'creator', type: ABIDataTypes.ADDRESS },
            { name: 'token', type: ABIDataTypes.ADDRESS },
            { name: 'totalAmount', type: ABIDataTypes.UINT256 },
            { name: 'recipient', type: ABIDataTypes.ADDRESS },
            { name: 'memo', type: ABIDataTypes.STRING },
            { name: 'deadline', type: ABIDataTypes.UINT64 },
            { name: 'taxBps', type: ABIDataTypes.UINT16 },
            { name: 'status', type: ABIDataTypes.UINT8 },
            { name: 'paidBy', type: ABIDataTypes.ADDRESS },
            { name: 'paidAtBlock', type: ABIDataTypes.UINT64 },
            { name: 'createdAtBlock', type: ABIDataTypes.UINT64 },
            { name: 'btcTxHash', type: ABIDataTypes.STRING },
        ],
    },
    {
        name: 'getLineItems',
        type: BitcoinAbiTypes.Function,
        constant: true,
        inputs: [{ name: 'invoiceId', type: ABIDataTypes.UINT256 }],
        outputs: [
            { name: 'items', type: ABIDataTypes.TUPLE, components: [
                { name: 'description', type: ABIDataTypes.STRING },
                { name: 'amount', type: ABIDataTypes.UINT256 },
            ]},
        ],
    },
    {
        name: 'getInvoicesByCreator',
        type: BitcoinAbiTypes.Function,
        constant: true,
        inputs: [{ name: 'creator', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'invoiceIds', type: ABIDataTypes.UINT256_ARRAY }],
    },
    {
        name: 'getInvoicesByRecipient',
        type: BitcoinAbiTypes.Function,
        constant: true,
        inputs: [{ name: 'recipient', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'invoiceIds', type: ABIDataTypes.UINT256_ARRAY }],
    },
    // Events
    {
        name: 'InvoiceCreated',
        type: BitcoinAbiTypes.Event,
        values: [
            { name: 'invoiceId', type: ABIDataTypes.UINT256 },
            { name: 'creator', type: ABIDataTypes.ADDRESS },
            { name: 'token', type: ABIDataTypes.ADDRESS },
            { name: 'totalAmount', type: ABIDataTypes.UINT256 },
        ],
    },
    {
        name: 'InvoicePaid',
        type: BitcoinAbiTypes.Event,
        values: [
            { name: 'invoiceId', type: ABIDataTypes.UINT256 },
            { name: 'paidBy', type: ABIDataTypes.ADDRESS },
            { name: 'amount', type: ABIDataTypes.UINT256 },
        ],
    },
    {
        name: 'InvoiceCancelled',
        type: BitcoinAbiTypes.Event,
        values: [
            { name: 'invoiceId', type: ABIDataTypes.UINT256 },
        ],
    },
];
```

**Step 2: Define TypeScript interface for IBlockBillContract**

```typescript
import { CallResult, OPNetEvent, BaseContractProperties } from 'opnet';
import { Address } from '@btc-vision/transaction';

export interface InvoiceData {
    creator: Address;
    token: Address;
    totalAmount: bigint;
    recipient: Address;
    memo: string;
    deadline: bigint;
    taxBps: number;
    status: number;
    paidBy: Address;
    paidAtBlock: bigint;
    createdAtBlock: bigint;
    btcTxHash: string;
}

export interface LineItem {
    description: string;
    amount: bigint;
}

export enum InvoiceStatus {
    Pending = 0,
    Paid = 1,
    Expired = 2,
    Cancelled = 3,
}

export interface IBlockBillContract extends BaseContractProperties {
    createInvoice(
        token: Address, totalAmount: bigint, recipient: Address,
        memo: string, deadline: bigint, taxBps: number, lineItems: LineItem[]
    ): Promise<CallResult<{ invoiceId: bigint }, [OPNetEvent<{ invoiceId: bigint; creator: Address; token: Address; totalAmount: bigint }>]>>;

    payInvoice(invoiceId: bigint): Promise<CallResult<{ success: boolean }, [OPNetEvent<{ invoiceId: bigint; paidBy: Address; amount: bigint }>]>>;

    cancelInvoice(invoiceId: bigint): Promise<CallResult<{ success: boolean }, []>>;

    markAsPaidBTC(invoiceId: bigint, btcTxHash: string): Promise<CallResult<{ success: boolean }, []>>;

    getInvoice(invoiceId: bigint): Promise<CallResult<InvoiceData, []>>;

    getLineItems(invoiceId: bigint): Promise<CallResult<{ items: LineItem[] }, []>>;

    getInvoicesByCreator(creator: Address): Promise<CallResult<{ invoiceIds: bigint[] }, []>>;

    getInvoicesByRecipient(recipient: Address): Promise<CallResult<{ invoiceIds: bigint[] }, []>>;
}
```

**Step 3: Commit**

```bash
git add frontend/src/abi/ frontend/src/types/
git commit -m "feat(frontend): define BlockBill ABI and TypeScript interface"
```

---

## Task 10: Frontend — Hooks (useNetwork, useBlockBill, useWallet)

**Files:**
- Create: `frontend/src/hooks/useNetwork.ts`
- Create: `frontend/src/hooks/useBlockBill.ts`
- Create: `frontend/src/hooks/useInvoice.ts`

**Step 1: useNetwork hook**

Detects wallet network, clears caches on switch. Uses `useWalletConnect()` from `@btc-vision/walletconnect`.

**Step 2: useBlockBill hook**

Returns cached `IBlockBillContract` instance via `getContract()` + `ContractService`. Sets sender address from wallet.

**Step 3: useInvoice hook**

Fetches a single invoice by ID: calls `getInvoice` + `getLineItems`, returns typed data. Caches results.

**Step 4: Commit**

```bash
git add frontend/src/hooks/
git commit -m "feat(frontend): add useNetwork, useBlockBill, useInvoice hooks"
```

---

## Task 11: Frontend — Paper/Stationery Theme

**Files:**
- Create: `frontend/src/styles/index.css`
- Create: `frontend/src/styles/theme.ts`
- Create: `frontend/src/components/common/StampBadge.tsx`
- Create: `frontend/src/components/common/PaperCard.tsx`
- Create: `frontend/src/components/layout/Header.tsx`
- Create: `frontend/src/components/layout/Footer.tsx`
- Create: `frontend/src/components/layout/Layout.tsx`

**Step 1: Tailwind config + CSS custom properties**

Define the Paper/Stationery palette:
- `--paper-bg: #FFFEF7` (cream)
- `--paper-card: #FFF8E7` (warm white)
- `--ink-dark: #3E2723` (dark brown)
- `--ink-medium: #5D4037`
- `--accent-gold: #8B6914`
- `--stamp-red: #C62828` (paid)
- `--stamp-orange: #EF6C00` (pending)
- `--stamp-grey: #9E9E9E` (expired)
- Serif font: Playfair Display (Google Fonts)
- Body font: Inter

**Step 2: StampBadge component**

Renders invoice status as a rotated rubber stamp with border and uppercase text. Uses CSS transforms for authentic stamp look.

**Step 3: PaperCard component**

A card with subtle paper texture background, light shadow, and warm border.

**Step 4: Layout with Header/Footer**

Header: logo + nav + WalletConnect button. Footer: "Powered by OPNet" + links.

**Step 5: Verify theme renders**

```bash
cd frontend && npm run dev
```

**Step 6: Commit**

```bash
git add frontend/src/styles/ frontend/src/components/
git commit -m "feat(frontend): implement Paper/Stationery theme with stamps"
```

---

## Task 12: Frontend — Landing Page

**Files:**
- Create: `frontend/src/pages/Landing.tsx`
- Modify: `frontend/src/App.tsx` (add routes)

**Step 1: Create Landing page**

Hero section with tagline "Trustless Invoicing on Bitcoin". Subtitle explaining the concept. CTA buttons: "Create Invoice" + "View Dashboard". Visual: stylized invoice illustration.

**Step 2: Setup React Router in App.tsx**

```tsx
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';

function App(): React.JSX.Element {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Landing />} />
                {/* More routes added in subsequent tasks */}
            </Routes>
        </Layout>
    );
}

export default App;
```

**Step 3: Commit**

```bash
git add frontend/src/pages/ frontend/src/App.tsx
git commit -m "feat(frontend): add landing page with Paper theme"
```

---

## Task 13: Frontend — Create Invoice Page

**Files:**
- Create: `frontend/src/pages/CreateInvoice.tsx`
- Create: `frontend/src/components/invoice/InvoiceForm.tsx`
- Create: `frontend/src/components/invoice/LineItemEditor.tsx`

**Step 1: InvoiceForm component**

Required fields: token selector (dropdown of known OP-20 tokens) + amount input.
Collapsible "Advanced Details" panel: recipient address, memo, deadline (block number), tax rate (bps), line items editor.

**Step 2: LineItemEditor component**

Add/remove up to 10 line items, each with description + amount.

**Step 3: CreateInvoice page**

Connects wallet, validates form, calls `createInvoice()` on contract:
1. Simulate: `const sim = await blockbill.createInvoice(token, amount, ...)`
2. Check revert: `if (sim.revert) throw`
3. Send: `await sim.sendTransaction({ signer: null, mldsaSigner: null, refundTo: address, maximumAllowedSatToSpend: 10000n, network })`
4. On success: redirect to `/invoice/:id`

**Step 4: Add route in App.tsx**

**Step 5: Commit**

```bash
git add frontend/src/pages/CreateInvoice.tsx frontend/src/components/invoice/
git commit -m "feat(frontend): create invoice page with form + OPNet transaction"
```

---

## Task 14: Frontend — Invoice View Page (Public)

**Files:**
- Create: `frontend/src/pages/InvoiceView.tsx`
- Create: `frontend/src/components/invoice/InvoiceDocument.tsx`

**Step 1: InvoiceDocument component**

Renders invoice as a paper document:
- Header with "INVOICE #id"
- StampBadge showing status (PAID/PENDING/EXPIRED/CANCELLED)
- From (creator address) / To (recipient or "Open")
- Token + amount
- Line items table (if any)
- Tax breakdown (if taxBps > 0)
- Memo section
- Created at block / Paid at block
- Copy link button

No wallet required — reads from contract via public RPC.

**Step 2: InvoiceView page**

Uses `useParams()` to get invoice ID, calls `useInvoice(id)` hook, renders `InvoiceDocument`.

**Step 3: Add route**

**Step 4: Commit**

```bash
git add frontend/src/pages/InvoiceView.tsx frontend/src/components/invoice/InvoiceDocument.tsx
git commit -m "feat(frontend): public invoice view page (wallet-free)"
```

---

## Task 15: Frontend — Pay Invoice Flow

**Files:**
- Create: `frontend/src/pages/PayInvoice.tsx`
- Create: `frontend/src/components/invoice/PaymentFlow.tsx`

**Step 1: PaymentFlow component**

1. Show invoice summary
2. Check if payer has enough OP-20 balance (`token.balanceOf`)
3. Check if payer has approved enough (`token.allowance`)
4. If not approved: execute approve tx first
5. Execute payInvoice tx
6. On success: redirect to receipt

Transaction pattern (FRONTEND — signer: null):
```typescript
// Step 1: Approve
const approveSim = await tokenContract.approve(blockbillAddress, totalAmount);
if (approveSim.revert) throw new Error('Approve failed');
await approveSim.sendTransaction({
    signer: null,
    mldsaSigner: null,
    refundTo: walletAddress,
    maximumAllowedSatToSpend: 10000n,
    network,
});

// Step 2: Pay
const paySim = await blockbillContract.payInvoice(invoiceId);
if (paySim.revert) throw new Error('Payment failed');
await paySim.sendTransaction({
    signer: null,
    mldsaSigner: null,
    refundTo: walletAddress,
    maximumAllowedSatToSpend: 10000n,
    network,
});
```

**Step 2: BTC payment fallback**

If invoice token is "BTC" (convention), show creator's BTC address with copy button instead of OP-20 flow. Creator marks paid later.

**Step 3: Fee selector (economy/normal/fast)**

Let user pick fee rate. Maps to `feeRate` in sendTransaction params.

**Step 4: Add route + commit**

```bash
git add frontend/src/pages/PayInvoice.tsx frontend/src/components/invoice/PaymentFlow.tsx
git commit -m "feat(frontend): pay invoice flow with approve + pay"
```

---

## Task 16: Frontend — Dashboard

**Files:**
- Create: `frontend/src/pages/Dashboard.tsx`
- Create: `frontend/src/components/dashboard/InvoiceList.tsx`
- Create: `frontend/src/components/dashboard/InvoiceRow.tsx`

**Step 1: Dashboard page**

Two tabs: "Created" (invoices I created) + "Received" (invoices assigned to me).
Calls `getInvoicesByCreator(myAddress)` and `getInvoicesByRecipient(myAddress)`.
For each ID, fetches invoice data via `getInvoice()`.

**Step 2: InvoiceList + InvoiceRow components**

Table with columns: ID, Token, Amount, Status (stamp badge), Created, Actions (View/Cancel/Mark Paid).
Filter by status: All / Pending / Paid / Cancelled.

**Step 3: Add route + commit**

```bash
git add frontend/src/pages/Dashboard.tsx frontend/src/components/dashboard/
git commit -m "feat(frontend): dashboard with created/received invoice tabs"
```

---

## Task 17: Frontend — Receipt Page

**Files:**
- Create: `frontend/src/pages/Receipt.tsx`

**Step 1: Receipt page**

Printable receipt view:
- "RECEIPT" header with large PAID stamp
- Invoice details + payment proof (paidBy, paidAtBlock, btcTxHash if BTC)
- On-chain verification link
- Print button (`window.print()`)
- Clean, minimal layout optimized for printing

**Step 2: Add route + commit**

```bash
git add frontend/src/pages/Receipt.tsx
git commit -m "feat(frontend): printable receipt page with on-chain proof"
```

---

## Task 18: Contract Deployment to OPNet Testnet

**Files:**
- Modify: `frontend/src/config/contracts.ts` (update with real address)

**Step 1: Build final contract WASM**

```bash
cd contract && npm run build
```

**Step 2: Deploy to OPNet testnet**

Use OPNet CLI or TransactionFactory for deployment. Network: `networks.opnetTestnet`, RPC: `https://testnet.opnet.org`.

**Step 3: Update frontend contract address**

Set the deployed contract address in `contracts.ts` for `networks.opnetTestnet`.

**Step 4: Test end-to-end on testnet**

Create invoice → view → pay → verify receipt.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: deploy contract to OPNet testnet and connect frontend"
```

---

## Task 19: Deploy Frontend to Vercel

**Step 1: Build frontend**

```bash
cd frontend && npm run build
```

**Step 2: Deploy to Vercel**

```bash
npx vercel --prod
```

**Step 3: Verify live URL works**

**Step 4: Commit Vercel config if any**

---

## Task 20: Contest Submission

**Step 1: Take screenshot of the dApp**

**Step 2: Post on X with #opnetvibecode @opnetbtc**

**Step 3: Submit on vibecode.finance:**
- GitHub repo: https://github.com/frenchchoco/blockbill
- Live URL
- Tweet link
- Mark as "Complete"

---

## Execution Order Summary

| # | Task | Priority | Est. |
|---|------|----------|------|
| 1 | Contract scaffold | P0 | 10m |
| 2 | Contract storage + types | P0 | 15m |
| 3 | createInvoice | P0 | 20m |
| 4 | payInvoice | P0 | 20m |
| 5 | cancelInvoice + markAsPaidBTC | P0 | 15m |
| 6 | View methods + build | P0 | 20m |
| 7 | Frontend scaffold | P0 | 15m |
| 8 | Config + services | P0 | 15m |
| 9 | ABI + interface | P0 | 10m |
| 10 | Hooks | P0 | 15m |
| 11 | Paper/Stationery theme | P0 | 30m |
| 12 | Landing page | P1 | 15m |
| 13 | Create Invoice page | P0 | 30m |
| 14 | Invoice View page | P0 | 20m |
| 15 | Pay Invoice flow | P0 | 30m |
| 16 | Dashboard | P1 | 25m |
| 17 | Receipt page | P1 | 15m |
| 18 | Testnet deployment | P0 | 20m |
| 19 | Vercel deployment | P0 | 10m |
| 20 | Contest submission | P0 | 10m |
