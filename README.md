# BlockBill — Invoicing & Streaming on Bitcoin L1

**On-chain invoicing and payment streams powered by OPNet.** Create, share, and settle invoices — or stream tokens block-by-block — directly on Bitcoin Layer 1. Every payment is immutable proof, recorded forever on the blockchain.

**Live:** [blockbill-eight.vercel.app](https://blockbill-eight.vercel.app)

## What is BlockBill?

BlockBill is a trustless financial toolkit built on Bitcoin L1 via OPNet. It enables anyone to:

- **Invoice** — Create on-chain invoices in 3 clicks, share via link/QR, pay with any OP-20 token
- **Stream** — LlamaPay-style token streaming: deposit once, stream block-by-block, withdraw anytime
- **Prove** — Every transaction recorded immutably on Bitcoin L1 — the blockchain is the receipt

### Why BlockBill?

Traditional invoicing requires trust: "Did they pay? When? How much?" And traditional payment schedules are rigid: salaries on the 1st, subscriptions monthly. BlockBill eliminates both by putting everything on-chain. The blockchain is the single source of truth.

## Features

### Invoicing
- **On-Chain Invoices** — All invoice data stored in a smart contract on Bitcoin L1
- **OP-20 Payments** — Pay with any OP-20 token, trustless via `transferFrom`
- **Relative Deadlines** — Set expiration as blocks from confirmation (~10 min/block), with presets (1d/1w/1m/1y)
- **Auto-Expire** — Invoices auto-detect expired status every 15s — no page refresh needed
- **Shareable Links** — Public invoice pages readable without a wallet, with QR codes
- **Printable Receipts** — On-chain proof of payment, ready to print or save as PDF
- **CSV Export** — Download your invoice data for accounting

### Streaming
- **Block-by-Block Streaming** — Tokens flow continuously at a configurable rate per block
- **Withdraw Anytime** — Recipients claim accrued tokens whenever they want
- **Pause / Resume** — Sender can freeze and restart streams on-chain
- **Top Up** — Add more tokens to extend stream duration without creating a new one
- **Cancel & Refund** — Stop a stream and return all unstreamed tokens to sender
- **Optional Pause/Cancel Reasons** — Add a note when pausing or cancelling (stored locally)
- **Duration Estimates** — Shows exact blocks + approximate time (e.g., "4,320 blocks ≈ 1 month")
- **Visual Progress Bars** — Shimmer effect on active streams, orange for paused, grey stripes for cancelled, two-tone withdrawn/claimable

### Platform
- **0.5% Platform Fee** — Mainnet-viable revenue model, deducted once on invoice or stream creation
- **Unified Dashboard** — Invoices + Streams in one view with tab switching
- **Paper/Stationery Theme** — A unique, warm design that stands out from dark-mode crypto UIs

## Architecture

```
┌──────────────────────┐      ┌──────────────────────────┐
│   React Frontend     │─RPC─▶│   OPNet Testnet Node      │
│   (Vite + TS)        │      │                            │
└──────────────────────┘      │   BlockBillContract        │
                              │   ├─ createInvoice()       │
                              │   └─ payInvoice()          │
                              │                            │
                              │   BlockBillStreamContract  │
                              │   ├─ createStream()        │
                              │   ├─ withdrawFromStream()  │
                              │   ├─ pauseStream()         │
                              │   ├─ resumeStream()        │
                              │   ├─ cancelStream()        │
                              │   └─ topUpStream()         │
                              └──────────────────────────┘
```

**Dual contract architecture.** Invoice and streaming logic in separate contracts. All data on-chain. No IPFS, no off-chain storage.

## Smart Contracts

### Invoice Contract

| Method | Description |
|--------|-------------|
| `createInvoice()` | Create an invoice with token, amount, optional memo/deadline/tax/line items |
| `payInvoice()` | Pay via OP-20 transferFrom — 99.5% to creator, 0.5% fee |
| `getInvoice()` | Read all invoice details |
| `getLineItems()` | Read line items for an invoice |
| `getInvoicesByCreator()` | List invoices created by an address |
| `getInvoicesByRecipient()` | List invoices received by an address |

### Stream Contract

| Method | Description |
|--------|-------------|
| `createStream()` | Create a stream with token, deposit, rate, optional end block |
| `withdrawFromStream()` | Recipient claims all accrued tokens |
| `pauseStream()` | Sender freezes the stream |
| `resumeStream()` | Sender restarts a paused stream |
| `cancelStream()` | Sender stops stream, returns unstreamed tokens |
| `topUpStream()` | Sender adds more tokens to the deposit |
| `getStream()` | Read stream details |
| `getWithdrawable()` | Calculate current withdrawable amount |
| `getStreamsBySender()` | List streams created by an address |
| `getStreamsByRecipient()` | List streams received by an address |

## Frontend

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Project pitch with features + CTAs |
| Dashboard | `/dashboard` | Unified view: Invoices + Streams tabs |
| Create Invoice | `/create` | Split-layout form with live preview |
| Create Stream | `/create/stream` | Stream creation with duration estimates |
| Invoice | `/invoice/:id` | Public invoice view (no wallet needed) |
| Pay | `/pay/:id` | Payment flow with approve + pay steps |
| Receipt | `/invoice/:id/receipt` | Printable payment receipt |
| Stream | `/stream/:id` | Live stream view with progress + actions |
| Guide | `/guide` | Step-by-step guide for invoicing + streaming |

### Paper/Stationery Theme

A deliberately warm, light design using cream backgrounds, serif typography (Playfair Display), and rubber stamp status badges — designed to look like real paper invoices, not another dark-mode crypto app.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | AssemblyScript (OPNet btc-runtime) |
| Frontend | React 19, Vite 7, TypeScript (strict) |
| Styling | Tailwind CSS + CSS custom properties |
| Wallet | @btc-vision/walletconnect v1 |
| OPNet SDK | opnet, @btc-vision/bitcoin, @btc-vision/transaction |
| Network | OPNet Testnet (Signet fork) |
| Deployment | Vercel (frontend), OPNet testnet (contracts) |

## Development

### Contracts

```bash
cd contract
npm install
npm run build    # → build/BlockBill.wasm
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # → localhost:5173
npm run build    # → dist/
```

## Testnet → Mainnet

Only 3 things change:
1. `networks.opnetTestnet` → `networks.bitcoin`
2. RPC URL: `testnet.opnet.org` → `mainnet.opnet.org`
3. Redeploy contracts on mainnet

No code changes needed — the architecture is network-agnostic.

## Contest

Built for [vibecode.finance](https://vibecodedotfinance.vercel.app/challenge) Week 2: "The DeFi Signal"

### Technical Highlights

- **Security Audited (BobOS)** — Full smart contract audit covering OPNet-specific vulnerability patterns (CRV-01→CRV-11), attack surfaces (ATK-01→ATK-20), complete storage layout review, and data serialization verification
- **100% OPNet Aligned** — Strict TypeScript Law 2026, all SDK conventions (`getContract` → `simulate` → `sendTransaction`), proper `Address` object handling, no raw PSBT, no deprecated ECDSA — built following Bob's development guidelines
- **Checks-Effects-Interactions** — All state mutations before external `TransferHelper.transferFrom` calls, preventing reentrancy
- **Collision-Free Storage** — Unique storage pointers via `Blockchain.nextPointer`, custom key derivation verified against `u256To30Bytes` truncation issues
- **DOS-Resistant Indexes** — Index operations silently skip when full instead of reverting, preventing spam-based denial-of-service
- **ML-DSA Ready** — Architecture prepared for quantum-resistant signatures (OPNet standard, no ECDSA)
- **Shared Block Polling** — Single `useSyncExternalStore` instance drives expired-status updates across all components — no duplicated RPC calls
- **Frontend Security** — Address validation (hex/bech32/P2OP), double-submission guards (`useRef` locks), graceful error handling, on-chain decimals resolution
- **Mainnet Viable** — 0.5% sustainable revenue model, network-agnostic architecture (3-line config switch), no off-chain dependencies
- **Configurable Gas** — User-adjustable max gas per transaction via in-app settings, essential for mainnet fee wars
- **Unique UX** — Paper/stationery theme (anti-dark-mode), printable on-chain receipts, QR code sharing, CSV export, unified dashboard, in-app user guide, animated progress bars

**#opnetvibecode** [@opnetbtc](https://x.com/opnetbtc)

Built with the help of Bob.

## License

MIT
