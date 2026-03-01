# BlockBill — Trustless Invoicing on Bitcoin L1

**On-chain invoicing powered by OPNet.** Create, share, and settle invoices directly on Bitcoin Layer 1. Every payment is immutable proof, recorded forever on the blockchain.

**Live:** [blockbill-eight.vercel.app](https://blockbill-eight.vercel.app)

## What is BlockBill?

BlockBill is a trustless invoicing platform built on Bitcoin L1 via OPNet. It enables anyone to:

- **Create** an on-chain invoice in 3 clicks (connect wallet → choose token → set amount)
- **Share** a public link — no wallet needed to view an invoice
- **Pay** with any OP-20 token — payment goes directly to the creator
- **Prove** payment immutably — every transaction is recorded on Bitcoin L1

### Why BlockBill?

Traditional invoicing requires trust: "Did they pay? When? How much?" BlockBill eliminates this by putting every invoice and payment on-chain. The blockchain is the single source of truth.

## Features

- **On-Chain Invoices** — All invoice data stored in a smart contract on Bitcoin L1
- **OP-20 Payments** — Pay with any OP-20 token, trustless via `transferFrom`
- **BTC Native Support** — For BTC payments, creator marks as paid with the BTC txHash as proof
- **0.5% Platform Fee** — Mainnet-viable revenue model, deducted automatically on payment
- **Shareable Links** — Public invoice pages readable without a wallet
- **Printable Receipts** — On-chain proof of payment, ready to print
- **Paper/Stationery Theme** — A unique, warm design that stands out from dark-mode crypto UIs

## Architecture

```
┌──────────────────────┐      ┌───────────────────────┐
│   React Frontend     │─RPC─▶│   OPNet Testnet Node   │
│   (Vite + TS)        │      │                         │
└──────────────────────┘      │   BlockBillContract     │
                              │   ├─ createInvoice()    │
                              │   ├─ payInvoice()       │
                              │   ├─ cancelInvoice()    │
                              │   ├─ markAsPaidBTC()    │
                              │   └─ getInvoice()       │
                              └───────────────────────┘
```

**Single contract architecture.** All invoice data (fields, line items, indexes) stored on-chain. No IPFS, no off-chain storage.

## Smart Contract

| Method | Description |
|--------|-------------|
| `createInvoice()` | Create an invoice with token, amount, optional memo/deadline/tax/line items |
| `payInvoice()` | Pay via OP-20 transferFrom — 99.5% to creator, 0.5% fee |
| `cancelInvoice()` | Creator-only cancellation (if still pending) |
| `markAsPaidBTC()` | Creator marks BTC payment with txHash proof |
| `getInvoice()` | Read all invoice details |
| `getLineItems()` | Read line items for an invoice |
| `getInvoicesByCreator()` | List invoices created by an address |
| `getInvoicesByRecipient()` | List invoices received by an address |

### Invoice Fields

**Required:** creator (auto), token address, total amount

**Optional:** recipient, memo (~200 chars), deadline (block number), tax rate (basis points), line items (up to 10)

## Frontend

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Project pitch + CTAs |
| Create | `/create` | Split-layout invoice form with live preview |
| Invoice | `/invoice/:id` | Public invoice view (no wallet needed) |
| Pay | `/pay/:id` | Payment flow with approve + pay steps |
| Dashboard | `/dashboard` | My invoices (created + received), filter by status |
| Receipt | `/invoice/:id/receipt` | Printable payment receipt with on-chain proof |

### Paper/Stationery Theme

A deliberately warm, light design using cream backgrounds, serif typography (Playfair Display), and rubber stamp status badges — designed to look like real paper invoices, not another dark-mode crypto app.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | AssemblyScript (OPNet btc-runtime) |
| Frontend | React 19, Vite 7, TypeScript (strict) |
| Styling | Tailwind CSS + CSS custom properties |
| Wallet | @btc-vision/walletconnect v2 |
| OPNet SDK | opnet, @btc-vision/bitcoin, @btc-vision/transaction |
| Network | OPNet Testnet (Signet fork) |
| Deployment | Vercel (frontend), OPNet testnet (contract) |

## Development

### Contract

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
3. Redeploy contract on mainnet

No code changes needed — the architecture is network-agnostic.

## Contest

Built for [vibecode.finance](https://vibecodedotfinance.vercel.app/challenge) Week 2: "The DeFi Signal"

**#opnetvibecode** [@opnetbtc](https://x.com/opnetbtc)

## License

MIT
