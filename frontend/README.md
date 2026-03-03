# BlockBill Frontend

React frontend for BlockBill — on-chain invoicing and payment streaming on Bitcoin L1 via OPNet.

> See the [root README](../README.md) for the full project documentation.

## Quick Start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # Production build → dist/
```

## Stack

- **React 19** + **TypeScript** (strict mode, zero `any`)
- **Vite 7** — build toolchain
- **Tailwind CSS 4** — utility-first styling with CSS custom properties
- **OPNet SDK** — `opnet`, `@btc-vision/transaction`, `@btc-vision/walletconnect`
- **react-router-dom 7** — client-side routing
- **react-hot-toast** — notifications
- **qrcode** — shareable QR codes for invoice and stream links

## Project Structure

```
src/
  abi/            # BlockBillABI, BlockBillStreamABI — contract interface definitions
  components/
    common/       # FeeConfirmSheet, GasSettings, SealAnimation, PaperCard, StampBadge, Toast
    layout/       # Header, Footer, Layout
  config/         # networks (RPC, fee tiers), tokens (known OP-20 list), contracts (addresses)
  hooks/          # useBlockNumber, useNetwork, useSendTransaction, useTokenApproval,
                  # useStreamApproval, useAddressValidation
  pages/          # Landing, Dashboard, DashboardPage, CreateInvoice, CreateStream,
                  # InvoiceView, PayInvoice, Receipt, StreamDashboard, StreamView, HowTo, Admin
  services/       # ContractService (contract instances + address resolution),
                  # ProviderService (RPC provider singleton)
  types/          # invoice.ts (InvoiceStatus, InvoiceData), stream.ts (StreamStatus, StreamData)
  utils/          # fee (0.5% calculation), errors (friendly messages),
                  # invoice (parsing), invoicePending (optimistic dashboard),
                  # streamDrafts (localStorage memo drafts), streamMemo (AES-GCM encryption),
                  # streamParser (on-chain → typed), streamPendingActions, streamReasons
```

## Key Patterns

### Fee Selector
Every transaction goes through `useSendTransaction()` which opens a `FeeConfirmSheet` with live Economy/Standard/Priority fee rates from the network RPC. Users choose their fee rate before signing.

### Token Approval + Action (2-step flows)
Invoice payments and stream creation use a 2-step flow: approve token spend → execute action. Each step opens its own fee selector. The approval hooks (`useTokenApproval`, `useStreamApproval`) accept an optional `sendFn` to integrate with the fee selector.

### Encrypted Stream Memos
Stream memos are encrypted with AES-256-GCM using a key derived from `SHA-256(senderHex || recipientHex)`. The ciphertext is embedded in the share URL hash. Only sender and recipient wallets can decrypt.

### Line Item Validation
Invoice line items require both a description and a non-zero amount. The total of all line items must exactly match the invoice amount. The Create button stays disabled until validation passes.

## Environment

No `.env` required. Network and RPC configuration is in `src/config/networks.ts`. The app connects to OPNet Testnet by default.
