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
        description: 'Every invoice and payment is recorded on Bitcoin L1.',
        icon: 'shield',
    },
    {
        title: 'OP-20 Payments',
        description: 'Accept any OP-20 token with automatic fee handling.',
        icon: 'coins',
    },
    {
        title: 'Shareable Links',
        description: 'One-click sharing, no wallet needed to view.',
        icon: 'link',
    },
];

const STEPS: readonly StepItem[] = [
    {
        number: 1,
        title: 'Create',
        description: 'Connect your wallet and create an invoice in 3 clicks.',
    },
    {
        number: 2,
        title: 'Share',
        description: 'Send the invoice link to your client.',
    },
    {
        number: 3,
        title: 'Settle',
        description: 'Client pays with OP-20 tokens, you receive instantly.',
    },
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
        <div className="space-y-20">
            {/* Hero Section */}
            <section className="text-center py-16 space-y-6">
                <h1 className="text-5xl md:text-6xl font-serif text-[var(--ink-dark)] leading-tight">
                    Trustless Invoicing<br />on Bitcoin
                </h1>
                <p className="text-lg md:text-xl text-[var(--ink-medium)] max-w-2xl mx-auto leading-relaxed">
                    Create, share, and settle invoices on-chain. Immutable proof of payment on Bitcoin L1.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Link
                        to="/create"
                        className="inline-flex items-center px-8 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors text-lg shadow-md"
                    >
                        Create Invoice
                    </Link>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center px-8 py-3 border-2 border-[var(--accent-gold)] text-[var(--accent-gold)] font-medium rounded-lg hover:bg-[var(--accent-gold)] hover:text-white transition-colors text-lg"
                    >
                        View Dashboard
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="space-y-8">
                <h2 className="text-3xl font-serif text-[var(--ink-dark)] text-center">
                    Why BlockBill?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {FEATURES.map((feature) => (
                        <PaperCard key={feature.title} className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--paper-bg)] text-[var(--accent-gold)] mx-auto">
                                <FeatureIcon type={feature.icon} />
                            </div>
                            <h3 className="text-xl font-serif text-[var(--ink-dark)]">
                                {feature.title}
                            </h3>
                            <p className="text-[var(--ink-medium)] leading-relaxed">
                                {feature.description}
                            </p>
                        </PaperCard>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="space-y-8">
                <h2 className="text-3xl font-serif text-[var(--ink-dark)] text-center">
                    How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {STEPS.map((step) => (
                        <div key={step.number} className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-3 border-[var(--accent-gold)] text-[var(--accent-gold)] font-serif text-xl font-bold">
                                {step.number}
                            </div>
                            <h3 className="text-xl font-serif text-[var(--ink-dark)]">
                                {step.title}
                            </h3>
                            <p className="text-[var(--ink-medium)] leading-relaxed max-w-xs mx-auto">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Fee Section */}
            <section className="text-center py-12">
                <PaperCard className="max-w-xl mx-auto text-center">
                    <h2 className="text-2xl font-serif text-[var(--ink-dark)] mb-2">
                        Simple Pricing
                    </h2>
                    <p className="text-4xl font-serif text-[var(--accent-gold)] font-bold my-4">
                        0.5%
                    </p>
                    <p className="text-lg text-[var(--ink-medium)]">
                        per transaction. That&apos;s it.
                    </p>
                </PaperCard>
            </section>
        </div>
    );
}
