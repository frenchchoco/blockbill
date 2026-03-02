import { Link } from 'react-router-dom';
import { PaperCard } from '../components/common/PaperCard';

interface FeatureItem {
    readonly title: string;
    readonly description: string;
    readonly icon: string;
}

interface StepItem {
    readonly number: number;
    readonly title: string;
    readonly description: string;
}

const FEATURES: readonly FeatureItem[] = [
    {
        title: 'On-Chain Proof',
        description: 'Every invoice and payment is immutably recorded on Bitcoin L1 via OPNet. No intermediary, no trust required.',
        icon: 'shield',
    },
    {
        title: 'OP-20 Payments',
        description: 'Accept any OP-20 token (MOTO, wBTC, stablecoins). Approve once, pay in one click.',
        icon: 'coins',
    },
    {
        title: 'Shareable Links',
        description: 'Share invoice links or QR codes. Anyone can view without a wallet, and pay by connecting theirs.',
        icon: 'link',
    },
];

const STEPS: readonly StepItem[] = [
    { number: 1, title: 'Create', description: 'Connect wallet, fill in details, preview live, and submit on-chain.' },
    { number: 2, title: 'Share', description: 'Send the invoice link or QR code to your client.' },
    { number: 3, title: 'Settle', description: 'Client approves tokens and pays. You receive instantly.' },
];

function FeatureIcon({ type }: { readonly type: string }): React.JSX.Element {
    switch (type) {
        case 'shield':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
            );
        case 'coins':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
            );
        case 'link':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-3.03a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374" />
                </svg>
            );
        default:
            return <span />;
    }
}

export function Landing(): React.JSX.Element {
    return (
        <div className="space-y-24">
            {/* Hero Section */}
            <section className="text-center py-20 space-y-6 animate-fade-in">
                <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[var(--accent-gold)]/30 text-xs text-[var(--accent-gold)] font-medium tracking-wider uppercase">
                    Built on Bitcoin L1 via OPNet
                </div>
                <h1 className="text-5xl md:text-7xl font-serif text-[var(--ink-dark)] leading-tight">
                    Trustless Invoicing<br />
                    <span className="text-[var(--accent-gold)]">on Bitcoin</span>
                </h1>
                <p className="text-lg md:text-xl text-[var(--ink-medium)] max-w-2xl mx-auto leading-relaxed">
                    BlockBill lets you create invoices that live on Bitcoin. Your client pays in OP-20 tokens,
                    and the transaction is permanently recorded on-chain &mdash; no middleman, no dispute,
                    just an immutable proof of payment on the most secure blockchain.
                </p>
                <p className="text-sm text-[var(--ink-light)] max-w-xl mx-auto">
                    Freelancers, businesses, DAOs &mdash; anyone who needs verifiable, tamper-proof invoicing
                    with CSV export for accounting and QR codes for instant sharing.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                    <Link to="/create"
                        className="group inline-flex items-center px-8 py-4 bg-[var(--accent-gold)] text-white font-medium rounded-xl hover:bg-[var(--accent-gold-light)] transition-all text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                        Create Invoice
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                    <Link to="/dashboard"
                        className="inline-flex items-center px-8 py-4 border-2 border-[var(--accent-gold)] text-[var(--accent-gold)] font-medium rounded-xl hover:bg-[var(--accent-gold)] hover:text-white transition-all text-lg">
                        View Dashboard
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="space-y-10">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-serif text-[var(--ink-dark)]">Why BlockBill?</h2>
                    <p className="text-[var(--ink-light)] mt-2">The first trustless invoicing protocol on Bitcoin.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {FEATURES.map((feature) => (
                        <PaperCard key={feature.title} className="text-center space-y-4 hover:shadow-lg transition-shadow">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] mx-auto">
                                <FeatureIcon type={feature.icon} />
                            </div>
                            <h3 className="text-xl font-serif text-[var(--ink-dark)]">{feature.title}</h3>
                            <p className="text-[var(--ink-medium)] leading-relaxed">{feature.description}</p>
                        </PaperCard>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="space-y-10">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-serif text-[var(--ink-dark)]">How It Works</h2>
                    <p className="text-[var(--ink-light)] mt-2">Three steps. Fully on-chain.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {STEPS.map((step, i) => (
                        <div key={step.number} className="text-center space-y-4 relative">
                            {i < STEPS.length - 1 && (
                                <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-px border-t-2 border-dashed border-[var(--border-paper)]" />
                            )}
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--accent-gold)] text-white font-serif text-xl font-bold shadow-md relative z-10">
                                {step.number}
                            </div>
                            <h3 className="text-xl font-serif text-[var(--ink-dark)]">{step.title}</h3>
                            <p className="text-[var(--ink-medium)] leading-relaxed max-w-xs mx-auto">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Fee Section */}
            <section className="text-center pb-12">
                <PaperCard className="max-w-xl mx-auto text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/5 to-transparent" />
                    <div className="relative">
                        <h2 className="text-2xl font-serif text-[var(--ink-dark)] mb-2">Simple Pricing</h2>
                        <p className="text-5xl font-serif text-[var(--accent-gold)] font-bold my-4">0.5%</p>
                        <p className="text-lg text-[var(--ink-medium)]">per transaction. That&apos;s it.</p>
                        <p className="text-sm text-[var(--ink-light)] mt-3">No hidden fees. No subscriptions. Pay only when you get paid.</p>
                    </div>
                </PaperCard>
            </section>
        </div>
    );
}
