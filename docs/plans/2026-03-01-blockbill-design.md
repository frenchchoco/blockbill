# BlockBill - On-chain Invoicing on Bitcoin L1

**Date:** 2026-03-01
**Status:** Approved
**Network:** OPNet Testnet (mainnet-ready)

## Concept

Trustless invoicing platform on Bitcoin L1 via OPNet. A creator generates an on-chain invoice, shares a link, and the payer settles in OP-20 tokens. Proof of payment is immutable. BTC native payments are supported via manual confirmation with txHash.

No competitor exists in the OPNet ecosystem.

## Architecture

Single smart contract (`BlockBillContract`) deployed on OPNet testnet. All data on-chain, no IPFS. Frontend reads contract state via OPNet RPC. Mainnet deployment requires only changing network config and redeploying.

```
[React Frontend] --RPC--> [OPNet Testnet Node]
                               |
                    [BlockBillContract]
                      - invoices map
                      - lineItems map
                      - creator index
                      - recipient index
```

## Smart Contract

### Storage

| Field | Type | Description |
|-------|------|-------------|
| invoiceCount | u256 | Auto-increment counter |
| invoices | Map<u256, Invoice> | Invoice ID → Invoice data |
| lineItems | Map<u256, LineItem[]> | Invoice ID → Line items (max 10) |
| creatorInvoices | Map<Address, u256[]> | Creator → Invoice IDs |
| recipientInvoices | Map<Address, u256[]> | Recipient → Invoice IDs |
| feeRecipient | Address | Platform fee wallet |
| feeBps | u16 | Fee rate (50 = 0.5%) |

### Invoice struct

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| creator | yes | Address | Who receives payment (auto from caller) |
| token | yes | Address | Which OP-20 token |
| totalAmount | yes | u256 | Total amount due |
| recipient | no | Address | Who should pay (Address.dead() = anyone) |
| memo | no | string | Description/reference (~200 chars) |
| deadline | no | u64 | Block number deadline (0 = none) |
| taxBps | no | u16 | Tax rate in basis points (0 = no tax) |
| status | auto | u8 | 0=pending, 1=paid, 2=expired, 3=cancelled |
| paidBy | auto | Address | Who paid |
| paidAtBlock | auto | u64 | Block when paid |
| createdAtBlock | auto | u64 | Block when created |
| btcTxHash | auto | string | BTC payment txHash (if BTC native) |

### LineItem struct

| Field | Type | Description |
|-------|------|-------------|
| description | string | Item description (~100 chars) |
| amount | u256 | Item amount |

### Methods

| Method | Access | Description |
|--------|--------|-------------|
| `createInvoice(token, totalAmount, recipient?, memo?, deadline?, taxBps?, lineItems?)` | Anyone | Create invoice, returns invoiceId |
| `payInvoice(invoiceId)` | Anyone (or specific recipient) | Transfer OP-20 to creator (minus fee) |
| `cancelInvoice(invoiceId)` | Creator only | Cancel if still pending |
| `markAsPaidBTC(invoiceId, txHash)` | Creator only | Mark as paid with BTC txHash proof |
| `getInvoice(invoiceId)` | View | Read invoice details |
| `getLineItems(invoiceId)` | View | Read line items |
| `getInvoicesByCreator(address)` | View | List creator's invoices |
| `getInvoicesByRecipient(address)` | View | List recipient's invoices |

### Payment flow

1. Payer calls `payInvoice(id)`
2. Contract verifies: status=pending, deadline not passed, caller=recipient (if set)
3. Contract calls OP-20 `transferFrom(payer, creator, totalAmount * 9950 / 10000)`
4. Contract calls OP-20 `transferFrom(payer, feeRecipient, totalAmount * 50 / 10000)`
5. Status set to `paid`, paidBy and paidAtBlock recorded

### BTC native flow

1. Invoice page displays creator's BTC address
2. Payer sends BTC directly (off-chain)
3. Creator calls `markAsPaidBTC(invoiceId, txHash)` to record proof on-chain

## Frontend

### Stack
- React 19, Vite, TypeScript (strict)
- React Router for navigation
- OPNet SDK (`opnet` npm package)
- `@btc-vision/walletconnect` for wallet connection
- `@btc-vision/bitcoin` with `networks.opnetTestnet`
- Tailwind CSS for styling

### Pages

| Route | Description | Wallet required |
|-------|-------------|-----------------|
| `/` | Landing page - pitch + CTA | No |
| `/create` | Invoice creation form | Yes (creator) |
| `/invoice/:id` | Public invoice view (shareable) | No (read-only) |
| `/pay/:id` | Payment flow | Yes (payer) |
| `/dashboard` | My invoices (created + received) | Yes |
| `/invoice/:id/receipt` | Post-payment receipt (printable) | No |

### Theme: Paper / Stationery

- **Background:** Cream/ivory (#FFFEF7), subtle paper texture
- **Typography:** Serif for headings (Playfair Display), sans-serif for body (Inter)
- **Status stamps:** PAID = red ink stamp, PENDING = orange, EXPIRED = grey, CANCELLED = strikethrough
- **Accents:** Warm brown (#8B6914), dark brown (#3E2723)
- **Cards:** Paper-like with subtle shadow, slightly off-white
- **Buttons:** Warm, muted tones - not neon
- **Dark variant:** Parchment dark (dark warm brown background, cream text)

### Key UX features

- 3-click minimum flow: connect → token + amount → create
- Advanced fields in collapsible "Details" panel
- Copy invoice link in 1 click
- Real-time status updates
- Multi-wallet: OP_WALLET, Unisat, OKX
- Fee selector: economy / normal / fast
- Responsive (mobile-friendly)
- Print-friendly receipt page

## Fee model

- 0.5% (50 basis points) on every OP-20 payment
- Fee recipient address configurable (owner-only setter)
- Mainnet viable revenue model

## Testnet → Mainnet transition

Only changes needed:
1. Network config: `networks.opnetTestnet` → `networks.mainnet`
2. RPC URL: testnet → mainnet endpoint
3. Contract redeployment on mainnet
4. Fee recipient address update

No code changes required - architecture is network-agnostic.

## Success criteria

- [ ] Contract deployed on OPNet testnet
- [ ] Create, pay, cancel invoice flows working
- [ ] BTC mark-as-paid flow working
- [ ] All 6 frontend pages functional
- [ ] Paper/Stationery theme polished
- [ ] Live URL deployed (Vercel)
- [ ] Public GitHub repo
- [ ] Screenshot + X post with #opnetvibecode @opnetbtc
