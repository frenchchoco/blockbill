import { Link } from 'react-router-dom';
import { PaperCard } from '../components/common/PaperCard';

/* ─── Data ─────────────────────────────────────────────── */

interface GuideStep {
    readonly title: string;
    readonly description: string;
    readonly tips: readonly string[];
}

const GUIDE_STEPS: readonly GuideStep[] = [
    {
        title: 'Install OP_WALLET',
        description: 'BlockBill runs on OPNet, Bitcoin\'s smart contract layer. You need the OP_WALLET browser extension to interact with the blockchain.',
        tips: [
            'Install OP_WALLET from the Chrome Web Store',
            'Create a new wallet or import an existing one',
            'Switch to OPNet Testnet to try BlockBill for free',
        ],
    },
    {
        title: 'Connect Your Wallet',
        description: 'Click "Connect Wallet" in the top-right corner of BlockBill. OP_WALLET will ask you to approve the connection.',
        tips: [
            'Click the gold "Connect Wallet" button in the header',
            'Approve the connection in the OP_WALLET popup',
            'Your address and network badge will appear in the header',
        ],
    },
    {
        title: 'Create an Invoice',
        description: 'Navigate to the Create page and fill in your invoice details. A live preview updates as you type.',
        tips: [
            'Select the payment token (e.g., MOTO)',
            'Enter the total amount',
            'Optionally: add a recipient address, memo, deadline, tax rate, or up to 10 line items',
            'Check the live preview on the right',
            'Toggle "Open Invoice" if anyone should be able to pay (not just the recipient)',
            'Click "Create Invoice" — the transaction is submitted on-chain',
        ],
    },
    {
        title: 'Share Your Invoice',
        description: 'Once created, you\'ll see the invoice detail page with a shareable link and QR code.',
        tips: [
            'Click "Share Link" to copy the URL to your clipboard',
            'Send it by email, chat, or any messaging channel',
            'Your client can view the full invoice without connecting a wallet',
            'A QR code is available on the invoice page for easy scanning',
        ],
    },
    {
        title: 'Pay an Invoice',
        description: 'When you receive an invoice, connect your wallet and pay in two simple steps.',
        tips: [
            'Open the invoice link and click "Pay Invoice"',
            'Step 1: Approve the token spend (one-time per token)',
            'Step 2: Confirm the payment — funds go directly to the creator',
            'A 0.5% platform fee is deducted automatically',
            'The payment is recorded permanently on Bitcoin L1',
        ],
    },
    {
        title: 'Get Your Receipt',
        description: 'After payment, an on-chain receipt is automatically available with full proof of payment.',
        tips: [
            'The invoice status changes to "PAID" with a stamp badge',
            'Click "View Receipt" for a printable version',
            'The receipt shows: payer address, payment block number, and all amounts',
            'Print or save as PDF for your accounting records',
        ],
    },
    {
        title: 'Manage from the Dashboard',
        description: 'Your Dashboard shows all invoices you\'ve created or received, with filters and CSV export.',
        tips: [
            'Switch between "Created" and "Received" tabs',
            'Filter by status: All, Pending, Paid, or Cancelled',
            'Click "View" on any invoice for full details',
            'Use "Export CSV" to download your invoice data for accounting',
            'Refresh to check for new payments',
        ],
    },
];

interface FaqItem {
    readonly q: string;
    readonly a: string;
}

const FAQ: readonly FaqItem[] = [
    {
        q: 'What tokens can I use to pay?',
        a: 'Any OP-20 token on OPNet. Currently MOTO is available on testnet. More tokens will be supported as the OPNet ecosystem grows.',
    },
    {
        q: 'Can I pay with native BTC?',
        a: 'Yes! For BTC payments, the payer sends BTC directly via their wallet. Then the invoice creator clicks "Mark as Paid (BTC)" and provides the BTC transaction hash as proof.',
    },
    {
        q: 'Is there a fee?',
        a: 'BlockBill charges 0.5% per OP-20 payment, deducted automatically from the payment amount. No monthly fees, no subscriptions. BTC manual payments have no platform fee.',
    },
    {
        q: 'Can I cancel an invoice?',
        a: 'Yes. If you created the invoice and it hasn\'t been paid yet, you can cancel it from the invoice detail page. Only the creator can cancel.',
    },
    {
        q: 'What if I entered the wrong amount?',
        a: 'Invoices are immutable once created on-chain. If there\'s an error, cancel the invoice and create a new one with the correct details.',
    },
    {
        q: 'What is an "Open Invoice"?',
        a: 'An open invoice has no specific recipient — anyone with the link can pay it. Useful for donations, tips, or when you don\'t know the payer\'s address.',
    },
    {
        q: 'What network does BlockBill run on?',
        a: 'BlockBill runs on OPNet Testnet (a Bitcoin Signet fork). The architecture is mainnet-ready — switching requires only a 3-line configuration change.',
    },
    {
        q: 'Is my invoice data private?',
        a: 'Invoice details are stored on-chain and are publicly visible (like all blockchain data). Anyone with the invoice link can view it. Your Dashboard only shows invoices you\'re involved in.',
    },
];

/* ─── Components ───────────────────────────────────────── */

function CheckIcon(): React.JSX.Element {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    );
}

/* ─── Page ─────────────────────────────────────────────── */

export function HowTo(): React.JSX.Element {
    return (
        <div className="max-w-3xl mx-auto space-y-12 pb-16">
            {/* Header */}
            <div className="text-center space-y-3 animate-fade-in">
                <h1 className="text-4xl font-serif text-[var(--ink-dark)]">How to Use BlockBill</h1>
                <p className="text-lg text-[var(--ink-medium)] max-w-xl mx-auto leading-relaxed">
                    A step-by-step guide to creating, sharing, and settling invoices on Bitcoin.
                </p>
            </div>

            {/* Steps */}
            <div className="space-y-5">
                {GUIDE_STEPS.map((step, i) => (
                    <PaperCard key={step.title} className="relative">
                        <div className="flex gap-5">
                            {/* Step number */}
                            <div className="shrink-0">
                                <div className="w-10 h-10 rounded-full bg-[var(--accent-gold)] text-white font-serif text-lg font-bold flex items-center justify-center shadow-sm">
                                    {i + 1}
                                </div>
                            </div>
                            {/* Content */}
                            <div className="space-y-3 min-w-0">
                                <h2 className="text-xl font-serif text-[var(--ink-dark)]">{step.title}</h2>
                                <p className="text-sm text-[var(--ink-medium)] leading-relaxed">{step.description}</p>
                                <ul className="space-y-1.5">
                                    {step.tips.map((tip) => (
                                        <li key={tip} className="flex items-start gap-2 text-sm text-[var(--ink-medium)]">
                                            <span className="text-[var(--accent-gold)]">
                                                <CheckIcon />
                                            </span>
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </PaperCard>
                ))}
            </div>

            {/* FAQ */}
            <div className="space-y-6">
                <h2 className="text-2xl font-serif text-[var(--ink-dark)] text-center">Frequently Asked Questions</h2>
                <PaperCard>
                    <div className="divide-y divide-[var(--border-paper)]">
                        {FAQ.map((item) => (
                            <div key={item.q} className="py-4 first:pt-0 last:pb-0">
                                <h3 className="text-sm font-semibold text-[var(--ink-dark)] mb-1.5">{item.q}</h3>
                                <p className="text-sm text-[var(--ink-medium)] leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </PaperCard>
            </div>

            {/* CTA */}
            <div className="text-center space-y-4 pt-4">
                <p className="text-lg font-serif text-[var(--ink-dark)]">Ready to create your first invoice?</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/create"
                        className="group inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent-gold)] text-white font-medium rounded-xl hover:bg-[var(--accent-gold-light)] transition-all text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                        Create Invoice
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                    <Link to="/dashboard"
                        className="inline-flex items-center px-7 py-3.5 border-2 border-[var(--border-paper)] text-[var(--ink-medium)] font-medium rounded-xl hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-all">
                        View Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
