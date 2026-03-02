import { Link } from 'react-router-dom';
import { PaperCard } from '../components/common/PaperCard';

/* ─── Data ─────────────────────────────────────────────── */

interface Feature {
    readonly title: string;
    readonly description: string;
    readonly icon: 'shield' | 'coins' | 'share';
}

const FEATURES: readonly Feature[] = [
    {
        title: 'Immutable Proof',
        description: 'Every invoice and payment lives on Bitcoin L1 forever. No disputes, no ambiguity — just verifiable truth on the most secure blockchain.',
        icon: 'shield',
    },
    {
        title: 'OP-20 Payments',
        description: 'Accept any OP-20 token — MOTO, wBTC, stablecoins. Approve once, pay in one click. Funds go directly to the creator.',
        icon: 'coins',
    },
    {
        title: 'Share Anywhere',
        description: 'Every invoice gets a public link and QR code. No wallet needed to view — share via email, chat, or print.',
        icon: 'share',
    },
];

interface Step {
    readonly num: number;
    readonly title: string;
    readonly description: string;
}

const STEPS: readonly Step[] = [
    { num: 1, title: 'Create', description: 'Connect wallet, choose token & amount, add optional details. Submit on-chain in one click.' },
    { num: 2, title: 'Share', description: 'Copy the invoice link or scan the QR code. Your client views it without any wallet.' },
    { num: 3, title: 'Settle', description: 'Client approves tokens and pays. You receive 99.5% instantly. On-chain receipt auto-generated.' },
];

/* ─── Sub-components ───────────────────────────────────── */

function FeatureIcon({ type }: { readonly type: Feature['icon'] }): React.JSX.Element {
    const cls = 'w-7 h-7';
    switch (type) {
        case 'shield':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
            );
        case 'coins':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
            );
        case 'share':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
            );
    }
}

function InvoiceMockup(): React.JSX.Element {
    return (
        <div className="relative max-w-sm mx-auto lg:ml-auto">
            {/* Soft shadow underneath */}
            <div className="absolute inset-4 bg-[var(--ink-dark)]/8 rounded-xl blur-xl -z-10 translate-y-4" />

            {/* Invoice card */}
            <div className="relative bg-[var(--paper-card)] border border-[var(--border-paper)] rounded-xl shadow-lg p-6 paper-texture transform -rotate-1 animate-float">
                {/* Header */}
                <div className="flex items-start justify-between mb-5 pb-4 border-b-2 border-dashed border-[var(--border-paper)]">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--ink-light)] font-semibold">Invoice</p>
                        <h3 className="text-2xl font-serif text-[var(--ink-dark)] -mt-0.5">#42</h3>
                        <p className="text-[10px] text-[var(--ink-light)] mt-0.5">Block #850,234</p>
                    </div>
                    <div className="stamp stamp-paid animate-stamp-drop" style={{ animationDelay: '1.2s' }}>PAID</div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--ink-light)] font-medium">From</p>
                        <p className="text-[11px] font-mono text-[var(--ink-dark)] mt-0.5">0x3e9f...2aff</p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--ink-light)] font-medium">To</p>
                        <p className="text-[11px] font-mono text-[var(--ink-dark)] mt-0.5">0x8e02...072a</p>
                    </div>
                </div>

                {/* Line items table */}
                <div className="border border-[var(--border-paper)] rounded-lg overflow-hidden mb-4">
                    <div className="bg-[var(--paper-card-dark)] px-3 py-1.5 flex justify-between text-[9px] uppercase tracking-[0.15em] text-[var(--ink-light)] font-semibold">
                        <span>Description</span><span>Amount</span>
                    </div>
                    <div className="px-3 py-2 flex justify-between text-xs border-t border-[var(--border-paper)]">
                        <span className="text-[var(--ink-medium)]">Design Work</span>
                        <span className="font-mono text-[var(--ink-dark)]">1,000.00</span>
                    </div>
                    <div className="px-3 py-2 flex justify-between text-xs border-t border-[var(--border-paper)]">
                        <span className="text-[var(--ink-medium)]">Revisions</span>
                        <span className="font-mono text-[var(--ink-dark)]">500.00</span>
                    </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-baseline pt-3 border-t-2 border-[var(--border-paper)]">
                    <span className="text-sm font-serif text-[var(--ink-light)]">Total</span>
                    <div>
                        <span className="text-xl font-serif font-bold text-[var(--ink-dark)]">1,500.00</span>
                        <span className="text-xs text-[var(--accent-gold)] ml-1.5 font-semibold">MOTO</span>
                    </div>
                </div>
            </div>

            {/* Handwritten annotation */}
            <p className="absolute -bottom-8 right-2 text-base text-[var(--accent-gold)] -rotate-2 whitespace-nowrap" style={{ fontFamily: "'Caveat', cursive" }}>
                recorded on Bitcoin forever
            </p>
        </div>
    );
}

/* ─── Page ─────────────────────────────────────────────── */

export function Landing(): React.JSX.Element {
    return (
        <div className="space-y-20 pb-16">
            {/* ── Hero ── */}
            <section className="pt-6 lg:pt-12 overflow-hidden pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    {/* Text */}
                    <div className="space-y-6 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--stamp-green)] animate-pulse" />
                            <span className="text-xs text-[var(--accent-gold)] font-medium tracking-wider uppercase">Live on Bitcoin L1 via OPNet</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif text-[var(--ink-dark)] leading-[1.1] tracking-tight">
                            Your invoices.<br />
                            <span className="text-[var(--accent-gold)]">On Bitcoin.</span><br />
                            Forever.
                        </h1>
                        <p className="text-lg text-[var(--ink-medium)] leading-relaxed max-w-lg">
                            Create verifiable invoices settled on Bitcoin L1. Your client pays in OP-20 tokens &mdash;
                            the payment is permanently recorded on the most secure blockchain.
                        </p>
                        <p className="text-sm text-[var(--ink-light)] max-w-md">
                            Freelancers, businesses, DAOs &mdash; anyone who needs tamper-proof invoicing with
                            CSV export, printable receipts, and QR code sharing.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <Link to="/create"
                                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--accent-gold)] text-white font-medium rounded-xl hover:bg-[var(--accent-gold-light)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base">
                                Create Invoice
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                            <Link to="/guide"
                                className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-[var(--border-paper)] text-[var(--ink-medium)] font-medium rounded-xl hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-all text-base">
                                How It Works
                            </Link>
                        </div>
                    </div>

                    {/* Invoice mockup */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <InvoiceMockup />
                    </div>
                </div>
            </section>

            {/* ── Trust Bar ── */}
            <section className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 border-y border-[var(--border-paper)] bg-[var(--paper-card-dark)]/40">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                    {([
                        { label: 'Bitcoin L1', sub: 'Secured by proof-of-work' },
                        { label: '100% On-Chain', sub: 'No off-chain dependencies' },
                        { label: 'Trustless', sub: 'No intermediary required' },
                        { label: '0.5% Fee', sub: 'Pay only when you get paid' },
                    ] as const).map((item) => (
                        <div key={item.label} className="text-center">
                            <p className="text-sm font-serif font-semibold text-[var(--ink-dark)]">{item.label}</p>
                            <p className="text-[11px] text-[var(--ink-light)] mt-0.5">{item.sub}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ── */}
            <section className="space-y-10">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-serif text-[var(--ink-dark)]">Why BlockBill?</h2>
                    <p className="text-[var(--ink-light)]">The first trustless invoicing protocol on Bitcoin.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {FEATURES.map((f) => (
                        <PaperCard key={f.title} className="text-center space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] mx-auto">
                                <FeatureIcon type={f.icon} />
                            </div>
                            <h3 className="text-xl font-serif text-[var(--ink-dark)]">{f.title}</h3>
                            <p className="text-sm text-[var(--ink-medium)] leading-relaxed">{f.description}</p>
                        </PaperCard>
                    ))}
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="space-y-10">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-serif text-[var(--ink-dark)]">How It Works</h2>
                    <p className="text-[var(--ink-light)]">Three steps. Fully on-chain.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {STEPS.map((step, i) => (
                        <div key={step.num} className="text-center space-y-4 relative">
                            {i < STEPS.length - 1 && (
                                <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-px border-t-2 border-dashed border-[var(--border-paper)]" />
                            )}
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--accent-gold)] text-white font-serif text-xl font-bold shadow-md relative z-10">
                                {step.num}
                            </div>
                            <h3 className="text-xl font-serif text-[var(--ink-dark)]">{step.title}</h3>
                            <p className="text-sm text-[var(--ink-medium)] leading-relaxed max-w-xs mx-auto">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Built For ── */}
            <section className="space-y-10">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-serif text-[var(--ink-dark)]">Built For</h2>
                    <p className="text-[var(--ink-light)]">Anyone who needs verifiable, tamper-proof invoicing.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {([
                        { title: 'Freelancers', desc: 'Bill global clients in crypto. Export CSV for accounting. Never chase payments again.' },
                        { title: 'Businesses', desc: 'Professional invoicing with immutable proof. No chargebacks, no disputes.' },
                        { title: 'DAOs', desc: 'Transparent treasury payouts with on-chain audit trails visible to every member.' },
                    ] as const).map((uc) => (
                        <div key={uc.title} className="text-center p-6 rounded-xl border border-[var(--border-paper)] hover:border-[var(--accent-gold)]/50 hover:shadow-md transition-all duration-300">
                            <h3 className="text-lg font-serif text-[var(--ink-dark)] mb-2">{uc.title}</h3>
                            <p className="text-sm text-[var(--ink-medium)] leading-relaxed">{uc.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Pricing ── */}
            <section className="text-center">
                <PaperCard className="max-w-lg mx-auto text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/5 to-transparent" />
                    <div className="relative space-y-3">
                        <h2 className="text-2xl font-serif text-[var(--ink-dark)]">Simple Pricing</h2>
                        <p className="text-5xl font-serif text-[var(--accent-gold)] font-bold">0.5%</p>
                        <p className="text-lg text-[var(--ink-medium)]">per transaction. That&apos;s it.</p>
                        <p className="text-sm text-[var(--ink-light)]">No subscriptions. No hidden fees. Pay only when you get paid.</p>
                    </div>
                </PaperCard>
            </section>

            {/* ── CTA ── */}
            <section className="text-center space-y-6 pb-8">
                <h2 className="text-3xl md:text-4xl font-serif text-[var(--ink-dark)]">Ready to get started?</h2>
                <p className="text-[var(--ink-medium)] max-w-lg mx-auto">
                    Create your first on-chain invoice in under a minute.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/create"
                        className="group inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent-gold)] text-white font-medium rounded-xl hover:bg-[var(--accent-gold-light)] transition-all text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                        Create Invoice
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                    <Link to="/guide"
                        className="text-[var(--accent-gold)] hover:text-[var(--accent-gold-light)] font-medium transition-colors underline underline-offset-4">
                        Read the Guide
                    </Link>
                </div>
            </section>
        </div>
    );
}
