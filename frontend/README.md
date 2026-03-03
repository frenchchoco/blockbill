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
- **Tailwind CSS 4** — utility-first styling
- **OPNet SDK** — `opnet`, `@btc-vision/transaction`, `@btc-vision/walletconnect`
- **react-router-dom** — client-side routing
- **react-hot-toast** — notifications
- **qrcode** — shareable QR codes for invoice links

## Project Structure

```
src/
  components/
    common/       # GasSettings, SealAnimation, PaperCard
    layout/       # Header, Footer
  config/         # networks, tokens, contracts
  hooks/          # useBlockNumber, useNetwork, useStream, useStreamActions
  pages/          # Landing, Dashboard, Create*, *View, Pay*, Receipt, HowTo
  services/       # ContractService, ProviderService
  types/          # Invoice, Stream, Token interfaces
  utils/          # invoice parsing, stream drafts, address resolution
```

## Environment

No `.env` required. Network and RPC configuration is in `src/config/networks.ts`. The app connects to OPNet Testnet by default.
