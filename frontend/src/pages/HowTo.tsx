import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PaperCard } from '../components/common/PaperCard';

/* ═══════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════ */

interface GuideStep {
    readonly title: string;
    readonly description: string;
    readonly tips: readonly string[];
    readonly icon: React.JSX.Element;
}

interface FaqItem {
    readonly q: string;
    readonly a: string;
}

type TabId = 'invoicing' | 'streams' | 'faq';

interface SectionIntro {
    readonly what: string;
    readonly example: string;
    readonly exampleLabel: string;
}

/* ═══════════════════════════════════════════════════════════
   Step Icons (Heroicon-style, theme-matched)
   ═══════════════════════════════════════════════════════════ */

const ico = (d: string): React.JSX.Element => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

/* ═══════════════════════════════════════════════════════════
   Data — Invoicing Steps
   ═══════════════════════════════════════════════════════════ */

const INVOICE_STEPS: readonly GuideStep[] = [
    {
        title: 'Install OP_WALLET',
        description: 'BlockBill runs on OPNet, Bitcoin\'s smart contract layer. You need the OP_WALLET browser extension to interact with the blockchain.',
        tips: [
            'Install OP_WALLET from the Chrome Web Store',
            'Create a new wallet or import an existing one',
            'Switch to OPNet Testnet to try BlockBill for free',
        ],
        icon: ico('M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.491 48.491 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z'),
    },
    {
        title: 'Connect Your Wallet',
        description: 'Click "Connect Wallet" in the top-right corner of BlockBill. OP_WALLET will ask you to approve the connection.',
        tips: [
            'Click the gold "Connect Wallet" button in the header',
            'Approve the connection in the OP_WALLET popup',
            'Your address and network badge will appear in the header',
        ],
        icon: ico('M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244'),
    },
    {
        title: 'Create an Invoice',
        description: 'Use the Create dropdown in the header and select "New Invoice". A live preview updates as you type.',
        tips: [
            'Select the payment token (e.g., MOTO)',
            'Enter the total amount',
            'Optionally: add a recipient, memo, expiration, or line items',
            'Toggle "Open Invoice" if anyone should be able to pay',
            'Check the live preview on the right',
            'Click "Create Invoice" — the transaction is submitted on-chain',
        ],
        icon: ico('M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z'),
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
        icon: ico('M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z'),
    },
    {
        title: 'Pay an Invoice',
        description: 'When you receive an invoice, connect your wallet and pay in two simple steps.',
        tips: [
            'Open the invoice link and click "Pay Invoice"',
            'Step 1: Approve the token spend (one-time per token, or use unlimited approval)',
            'Step 2: Confirm the payment — funds go directly to the creator',
            'A 0.5% platform fee is deducted automatically',
            'The payment is recorded permanently on Bitcoin L1',
        ],
        icon: ico('M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z'),
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
        icon: ico('M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75'),
    },
];

/* ═══════════════════════════════════════════════════════════
   Data — Stream Steps (includes Dashboard)
   ═══════════════════════════════════════════════════════════ */

const STREAM_STEPS: readonly GuideStep[] = [
    {
        title: 'Create a Stream',
        description: 'Use the Create dropdown in the header and select "New Stream". Configure your payment stream parameters.',
        tips: [
            'Select the token to stream (e.g., MOTO)',
            'Enter the total deposit and rate per block',
            'Choose "Until Exhausted" (deposit runs out) or "Fixed End Block"',
            'Add an optional encrypted memo — only you and the recipient can read it',
            'The live preview shows estimated duration (blocks + approximate time)',
            'Approve the token spend, then create the stream on-chain',
        ],
        icon: ico('M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z'),
    },
    {
        title: 'Share & Stream in Real-Time',
        description: 'Once confirmed, tokens are streamed block-by-block to the recipient. Share the stream link — the encrypted memo is embedded in it.',
        tips: [
            'Click "Share Link" to copy the URL with the encrypted memo inside',
            'The recipient opens the link, connects their wallet, and sees the memo',
            'The stream page shows a live progress bar of tokens streamed',
            'Rate per block and estimated daily rate are displayed',
            'Both sender and recipient can monitor from the Dashboard',
        ],
        icon: ico('M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605'),
    },
    {
        title: 'Withdraw, Pause, or Cancel',
        description: 'Recipients withdraw anytime. Senders can pause, resume, top up, or cancel the stream.',
        tips: [
            'Recipient: click "Withdraw" to claim all accrued tokens at any time',
            'Sender: click "Pause" to freeze the stream, "Resume" to restart it',
            'Sender: "Top Up" adds more tokens to extend the stream duration',
            'Sender: "Cancel" stops the stream and returns unstreamed tokens',
            'Optionally add a reason when pausing or cancelling (stored locally)',
            'All actions are on-chain — fully verifiable and immutable',
        ],
        icon: ico('M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75'),
    },
    {
        title: 'Manage from the Dashboard',
        description: 'Your Dashboard shows all invoices and streams in one place, with tabs, filters, and CSV export.',
        tips: [
            'Switch between "Invoices" and "Streams" using the top toggle',
            'Invoices: filter by Created/Received, then by status (All, Pending, Paid)',
            'Streams: filter by Sending/Receiving, then by status (All, Active, Paused, Cancelled)',
            'Stream progress bars show visual effects: shimmer for active, orange for paused, grey stripes for cancelled',
            'Expired invoices are automatically detected and marked',
            'Use "Export CSV" to download invoice or stream data for accounting',
        ],
        icon: ico('M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z'),
    },
];

/* ═══════════════════════════════════════════════════════════
   Data — FAQ
   ═══════════════════════════════════════════════════════════ */

const FAQ: readonly FaqItem[] = [
    {
        q: 'What tokens can I use?',
        a: 'Any OP-20 token on OPNet. MOTO and BLOCK are available on testnet. More tokens will be supported as the OPNet ecosystem grows.',
    },
    {
        q: 'Is there a fee?',
        a: 'BlockBill charges a 0.5% fee, once, on invoice or stream creation. The fee is deducted automatically on-chain. No monthly fees, no subscriptions.',
    },
    {
        q: 'How do invoice deadlines work?',
        a: 'Deadlines are set as a number of blocks from the transaction confirmation. For example, "1 Day" = 144 blocks (~10 min per block). Expired invoices are automatically locked and cannot be paid.',
    },
    {
        q: 'What is an "Open Invoice"?',
        a: 'An open invoice has no specific recipient — anyone with the link can pay it. Useful for donations, tips, or when you don\'t know the payer\'s address.',
    },
    {
        q: 'How does streaming work?',
        a: 'Token streams release funds block-by-block from a deposit. The sender sets the rate (tokens per block). Recipients can withdraw accrued tokens at any time. Think of it as LlamaPay on Bitcoin.',
    },
    {
        q: 'Can I cancel or pause a stream?',
        a: 'Yes. The sender can pause, resume, or cancel a stream at any time. When pausing or cancelling, you can optionally add a reason (stored locally in your browser). Cancelling returns all unstreamed tokens to the sender. The recipient can always withdraw what has already accrued.',
    },
    {
        q: 'What network does BlockBill run on?',
        a: 'BlockBill runs on OPNet Testnet (a Bitcoin Signet fork). The architecture is mainnet-ready — switching requires only a 3-line configuration change.',
    },
    {
        q: 'What is the encrypted memo on streams?',
        a: 'When you create a stream, you can add an optional memo that is encrypted with AES-256-GCM. The encryption key is derived from the sender and recipient addresses, so only these two parties can decrypt and read the memo. The encrypted data is embedded in the share link — no one else can read it, even if they intercept the URL.',
    },
    {
        q: 'Is my data private?',
        a: 'Invoice and stream details (amounts, addresses, status) are stored on-chain and publicly visible, like all blockchain data. However, stream memos are encrypted off-chain — only the sender and recipient can decrypt them. Your Dashboard only shows items you\'re involved in.',
    },
];

/* ═══════════════════════════════════════════════════════════
   Section Intros — "What is it?" + real-world example
   ═══════════════════════════════════════════════════════════ */

const SECTION_INTROS: Record<Exclude<TabId, 'faq'>, SectionIntro> = {
    invoicing: {
        what: 'An invoice is a payment request recorded on Bitcoin. You create it on-chain, share a link, and the recipient pays directly — no bank, no middleman. The payment is settled on Bitcoin L1 and permanently recorded as proof.',
        exampleLabel: 'Example',
        example: 'Alice is a freelance designer. She finishes a logo for Bob and creates a BlockBill invoice for 500 MOTO with a 3-day deadline. She sends the link to Bob. Bob opens the link, connects his wallet, and pays in two clicks. Both get an on-chain receipt they can use for accounting.',
    },
    streams: {
        what: 'A payment stream is a continuous flow of tokens from sender to recipient, released block-by-block. Instead of paying a lump sum, you deposit tokens and they drip out at a fixed rate — like a salary that arrives every ~10 minutes instead of once a month.',
        exampleLabel: 'Example',
        example: 'A DAO wants to pay a developer 30,000 MOTO per month. Instead of a single monthly payment, they create a stream that releases ~1,000 MOTO per day (≈7 MOTO per block). The developer can withdraw accrued tokens at any time. If the DAO pauses the project, they pause the stream — no tokens wasted.',
    },
};

/* ═══════════════════════════════════════════════════════════
   Tab Definitions
   ═══════════════════════════════════════════════════════════ */

const TABS: { id: TabId; label: string; icon: string }[] = [
    {
        id: 'invoicing',
        label: 'Invoicing',
        icon: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
    },
    {
        id: 'streams',
        label: 'Streams',
        icon: 'M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605',
    },
    {
        id: 'faq',
        label: 'FAQ',
        icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z',
    },
];

/* ═══════════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════════ */

function CheckIcon(): React.JSX.Element {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    );
}

/* ─── Section Intro Card ──────────────────────────────── */

function SectionIntroCard({ intro }: { readonly intro: SectionIntro }): React.JSX.Element {
    return (
        <PaperCard className="mb-8 animate-fade-in">
            <div className="space-y-4">
                {/* What is it? */}
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-gold)] mb-2">
                        What is it?
                    </h3>
                    <p className="text-[var(--ink-medium)] leading-relaxed text-sm">
                        {intro.what}
                    </p>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-[var(--border-paper)]" />

                {/* Example */}
                <div className="relative pl-4 border-l-2 border-[var(--accent-gold)]/40">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-gold)] mb-2">
                        {intro.exampleLabel}
                    </h3>
                    <p className="text-[var(--ink-medium)] leading-relaxed text-sm italic">
                        {intro.example}
                    </p>
                </div>
            </div>
        </PaperCard>
    );
}

/* ─── Tab Bar ─────────────────────────────────────────── */

function TabBar({ active, onChange }: {
    readonly active: TabId;
    readonly onChange: (tab: TabId) => void;
}): React.JSX.Element {
    return (
        <div className="flex justify-center gap-2 mb-10">
            {TABS.map((tab) => {
                const isActive = active === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`
                            group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                            transition-all duration-200 cursor-pointer
                            ${isActive
                                ? 'bg-[var(--accent-gold)] text-white shadow-lg shadow-[var(--accent-gold)]/20'
                                : 'bg-[var(--paper-card)] border border-[var(--border-paper)] text-[var(--ink-medium)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]'
                            }
                        `}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                        </svg>
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

/* ─── Progress Dots ───────────────────────────────────── */

function ProgressBar({ total, current, onSelect }: {
    readonly total: number;
    readonly current: number;
    readonly onSelect: (i: number) => void;
}): React.JSX.Element {
    return (
        <div className="flex items-center justify-center gap-1 mb-8 px-4">
            {Array.from({ length: total }, (_, i) => (
                <div key={i} className="flex items-center">
                    <button
                        onClick={() => onSelect(i)}
                        className={`
                            w-8 h-8 sm:w-9 sm:h-9 rounded-full font-serif text-sm font-bold
                            transition-all duration-300 cursor-pointer shrink-0
                            ${i === current
                                ? 'bg-[var(--accent-gold)] text-white shadow-md scale-110'
                                : i < current
                                    ? 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/30'
                                    : 'bg-[var(--paper-card-dark)] text-[var(--ink-light)] hover:bg-[var(--border-paper)]'
                            }
                        `}
                        aria-label={`Go to step ${i + 1}`}
                    >
                        {i + 1}
                    </button>
                    {i < total - 1 && (
                        <div className={`
                            w-4 sm:w-8 h-0.5 mx-0.5 transition-colors duration-300
                            ${i < current ? 'bg-[var(--accent-gold)]' : 'bg-[var(--border-paper)]'}
                        `} />
                    )}
                </div>
            ))}
        </div>
    );
}

/* ─── Step Card (single animated step) ────────────────── */

function StepView({ step, num, total, dir, onNext, onPrev }: {
    readonly step: GuideStep;
    readonly num: number;
    readonly total: number;
    readonly dir: 1 | -1;
    readonly onNext: () => void;
    readonly onPrev: () => void;
}): React.JSX.Element {
    const isFirst = num === 1;
    const isLast = num === total;

    return (
        <div
            key={`${num}-${dir}`}
            className={dir === 1 ? 'animate-step-right' : 'animate-step-left'}
        >
            <PaperCard className="relative overflow-hidden">
                {/* Step header */}
                <div className="flex items-start gap-5 mb-5">
                    {/* Large icon circle */}
                    <div className="shrink-0 w-16 h-16 rounded-2xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center">
                        {step.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-[var(--ink-light)] uppercase tracking-wider mb-1">
                            Step {num} of {total}
                        </div>
                        <h2 className="text-2xl font-serif text-[var(--ink-dark)] leading-tight">
                            {step.title}
                        </h2>
                    </div>
                </div>

                {/* Description */}
                <p className="text-[var(--ink-medium)] leading-relaxed mb-5">
                    {step.description}
                </p>

                {/* Tips */}
                <ul className="space-y-2.5 mb-8">
                    {step.tips.map((tip) => (
                        <li key={tip} className="flex items-start gap-2.5 text-sm text-[var(--ink-medium)]">
                            <span className="text-[var(--accent-gold)]">
                                <CheckIcon />
                            </span>
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-5 border-t border-[var(--border-paper)]">
                    <button
                        onClick={onPrev}
                        disabled={isFirst}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${isFirst
                                ? 'opacity-0 pointer-events-none'
                                : 'text-[var(--ink-medium)] hover:text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/5 cursor-pointer'
                            }
                        `}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Previous
                    </button>

                    <span className="text-xs text-[var(--ink-light)] hidden sm:block">
                        Use ← → arrow keys
                    </span>

                    <button
                        onClick={onNext}
                        disabled={isLast}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                            ${isLast
                                ? 'opacity-0 pointer-events-none'
                                : 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-white'
                            }
                        `}
                    >
                        Next
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                    </button>
                </div>
            </PaperCard>
        </div>
    );
}

/* ─── FAQ Accordion ───────────────────────────────────── */

function FaqAccordion({ items, openIndex, onToggle }: {
    readonly items: readonly FaqItem[];
    readonly openIndex: number | null;
    readonly onToggle: (i: number) => void;
}): React.JSX.Element {
    return (
        <div className="space-y-3 animate-fade-in">
            {items.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                    <PaperCard key={item.q} className="!p-0 overflow-hidden">
                        <button
                            onClick={() => onToggle(i)}
                            className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer group"
                        >
                            <h3 className="text-sm font-semibold text-[var(--ink-dark)] group-hover:text-[var(--accent-gold)] transition-colors">
                                {item.q}
                            </h3>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`w-5 h-5 shrink-0 text-[var(--ink-light)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                        <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                            <div>
                                <p className="px-5 pb-5 text-sm text-[var(--ink-medium)] leading-relaxed">
                                    {item.a}
                                </p>
                            </div>
                        </div>
                    </PaperCard>
                );
            })}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════ */

export function HowTo(): React.JSX.Element {
    const [tab, setTab] = useState<TabId>('invoicing');
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState<1 | -1>(1);
    const [faqOpen, setFaqOpen] = useState<number | null>(null);

    const steps = tab === 'invoicing' ? INVOICE_STEPS : STREAM_STEPS;
    const total = steps.length;

    /* ── Navigation helpers ────────────────────────────── */

    const goTo = useCallback((idx: number) => {
        setDir(idx >= step ? 1 : -1);
        setStep(idx);
    }, [step]);

    const next = useCallback(() => {
        if (step < total - 1) {
            setDir(1);
            setStep((s) => s + 1);
        }
    }, [step, total]);

    const prev = useCallback(() => {
        if (step > 0) {
            setDir(-1);
            setStep((s) => s - 1);
        }
    }, [step]);

    /* ── Reset step on tab change ─────────────────────── */

    useEffect(() => {
        setStep(0);
        setDir(1);
    }, [tab]);

    /* ── Keyboard navigation ──────────────────────────── */

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (tab === 'faq') return;
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [tab, next, prev]);

    /* ── Render ────────────────────────────────────────── */

    return (
        <div className="max-w-3xl mx-auto pb-16">
            {/* Header */}
            <div className="text-center space-y-3 mb-8 animate-fade-in">
                <h1 className="text-4xl font-serif text-[var(--ink-dark)]">
                    How to Use BlockBill
                </h1>
                <p className="text-[var(--ink-medium)] max-w-xl mx-auto leading-relaxed">
                    An interactive guide to invoicing, streaming payments, and managing your finances on Bitcoin.
                </p>
            </div>

            {/* Tabs */}
            <TabBar active={tab} onChange={setTab} />

            {/* Step content (Invoicing / Streams) */}
            {tab !== 'faq' ? (
                <>
                    {/* Section intro — what is it + example */}
                    <SectionIntroCard intro={SECTION_INTROS[tab]} />

                    <ProgressBar total={total} current={step} onSelect={goTo} />
                    <StepView
                        step={steps[step]}
                        num={step + 1}
                        total={total}
                        dir={dir}
                        onNext={next}
                        onPrev={prev}
                    />

                    {/* CTA on last step */}
                    {step === total - 1 && (
                        <div className="text-center mt-8 animate-fade-in">
                            <p className="text-lg font-serif text-[var(--ink-dark)] mb-4">Ready to get started?</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to={tab === 'invoicing' ? '/create' : '/create/stream'}
                                    className="group inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent-gold)] text-white font-medium rounded-xl hover:bg-[var(--accent-gold-light)] transition-all text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    {tab === 'invoicing' ? 'Create Invoice' : 'Create Stream'}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </Link>
                                <Link
                                    to="/dashboard"
                                    className="inline-flex items-center px-7 py-3.5 border-2 border-[var(--border-paper)] text-[var(--ink-medium)] font-medium rounded-xl hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-all"
                                >
                                    View Dashboard
                                </Link>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* FAQ accordion */
                <>
                    <FaqAccordion
                        items={FAQ}
                        openIndex={faqOpen}
                        onToggle={(i) => setFaqOpen(faqOpen === i ? null : i)}
                    />

                    {/* CTA after FAQ */}
                    <div className="text-center mt-10 animate-fade-in">
                        <p className="text-lg font-serif text-[var(--ink-dark)] mb-4">Ready to get started?</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/dashboard"
                                className="group inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent-gold)] text-white font-medium rounded-xl hover:bg-[var(--accent-gold-light)] transition-all text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Launch App
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
