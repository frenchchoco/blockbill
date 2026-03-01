import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { PaperCard } from '../components/common/PaperCard';
import { StampBadge } from '../components/common/StampBadge';
import { InvoiceStatus } from '../types/invoice';
import type { InvoiceData } from '../types/invoice';

const MOCK_WALLET = 'tb1q...me';

const MOCK_INVOICES: readonly InvoiceData[] = [
    {
        id: 1n,
        creator: 'tb1q...me',
        token: 'tb1q...pill',
        totalAmount: 50000000n,
        recipient: 'tb1q...client1',
        memo: 'Logo design project',
        deadline: 0n,
        taxBps: 0,
        status: InvoiceStatus.Paid,
        paidBy: 'tb1q...client1',
        paidAtBlock: 12400n,
        createdAtBlock: 12300n,
        btcTxHash: 'abc123def456...',
        lineItemCount: 1,
    },
    {
        id: 2n,
        creator: 'tb1q...me',
        token: 'tb1q...pill',
        totalAmount: 100000000n,
        recipient: '',
        memo: 'Consulting - Q1 2026',
        deadline: 15000n,
        taxBps: 2000,
        status: InvoiceStatus.Pending,
        paidBy: '',
        paidAtBlock: 0n,
        createdAtBlock: 12350n,
        btcTxHash: '',
        lineItemCount: 3,
    },
    {
        id: 3n,
        creator: 'tb1q...me',
        token: 'tb1q...pill',
        totalAmount: 25000000n,
        recipient: 'tb1q...client2',
        memo: 'Cancelled project',
        deadline: 0n,
        taxBps: 0,
        status: InvoiceStatus.Cancelled,
        paidBy: '',
        paidAtBlock: 0n,
        createdAtBlock: 12200n,
        btcTxHash: '',
        lineItemCount: 0,
    },
    {
        id: 4n,
        creator: 'tb1q...other',
        token: 'tb1q...pill',
        totalAmount: 75000000n,
        recipient: 'tb1q...me',
        memo: 'Server hosting fees',
        deadline: 0n,
        taxBps: 1000,
        status: InvoiceStatus.Pending,
        paidBy: '',
        paidAtBlock: 0n,
        createdAtBlock: 12380n,
        btcTxHash: '',
        lineItemCount: 2,
    },
    {
        id: 5n,
        creator: 'tb1q...other2',
        token: 'tb1q...pill',
        totalAmount: 200000000n,
        recipient: 'tb1q...me',
        memo: 'Smart contract audit',
        deadline: 16000n,
        taxBps: 0,
        status: InvoiceStatus.Paid,
        paidBy: 'tb1q...me',
        paidAtBlock: 12420n,
        createdAtBlock: 12390n,
        btcTxHash: 'def789abc012...',
        lineItemCount: 1,
    },
];

type Tab = 'created' | 'received';
type StatusFilter = 'all' | 'pending' | 'paid' | 'cancelled';

interface FilterOption {
    readonly key: StatusFilter;
    readonly label: string;
    readonly status: InvoiceStatus | null;
}

const FILTER_OPTIONS: readonly FilterOption[] = [
    { key: 'all', label: 'All', status: null },
    { key: 'pending', label: 'Pending', status: InvoiceStatus.Pending },
    { key: 'paid', label: 'Paid', status: InvoiceStatus.Paid },
    { key: 'cancelled', label: 'Cancelled', status: InvoiceStatus.Cancelled },
];

function formatAmount(amount: bigint): string {
    const whole = amount / 100000000n;
    const frac = amount % 100000000n;
    const fracStr = frac.toString().padStart(8, '0').replace(/0+$/, '');
    if (fracStr.length === 0) return whole.toString();
    return `${whole.toString()}.${fracStr}`;
}

function formatAddress(addr: string): string {
    if (!addr || addr.length <= 16) return addr || '--';
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
}

export function Dashboard(): React.JSX.Element {
    const { walletAddress, openConnectModal } = useWalletConnect();
    const [activeTab, setActiveTab] = useState<Tab>('created');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    // Use mock wallet address for filtering when wallet is connected
    const currentWallet = walletAddress ?? MOCK_WALLET;

    const filteredInvoices = useMemo(() => {
        let invoices = MOCK_INVOICES.filter((inv) => {
            if (activeTab === 'created') {
                return inv.creator === currentWallet;
            }
            return inv.recipient === currentWallet;
        });

        const filterOption = FILTER_OPTIONS.find((f) => f.key === statusFilter);
        if (filterOption?.status !== null && filterOption?.status !== undefined) {
            invoices = invoices.filter((inv) => inv.status === filterOption.status);
        }

        return invoices;
    }, [activeTab, statusFilter, currentWallet]);

    if (!walletAddress) {
        return (
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-serif text-[var(--ink-dark)] mb-8 text-center">
                    My Invoices
                </h1>
                <PaperCard className="text-center py-12">
                    <p className="text-[var(--ink-medium)] mb-4">
                        Connect your wallet to see your invoices.
                    </p>
                    <button
                        type="button"
                        onClick={openConnectModal}
                        className="px-8 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-md"
                    >
                        Connect Wallet
                    </button>
                </PaperCard>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-serif text-[var(--ink-dark)] mb-8 text-center">
                My Invoices
            </h1>

            {/* Tabs */}
            <div className="flex gap-8 mb-6 border-b border-[var(--border-paper)]">
                <button
                    type="button"
                    onClick={() => { setActiveTab('created'); setStatusFilter('all'); }}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                        activeTab === 'created'
                            ? 'border-[var(--accent-gold)] text-[var(--ink-dark)]'
                            : 'border-transparent text-[var(--ink-light)] hover:text-[var(--ink-medium)]'
                    }`}
                >
                    Created
                </button>
                <button
                    type="button"
                    onClick={() => { setActiveTab('received'); setStatusFilter('all'); }}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                        activeTab === 'received'
                            ? 'border-[var(--accent-gold)] text-[var(--ink-dark)]'
                            : 'border-transparent text-[var(--ink-light)] hover:text-[var(--ink-medium)]'
                    }`}
                >
                    Received
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2 mb-6">
                {FILTER_OPTIONS.map((option) => {
                    const isActive = statusFilter === option.key;
                    return (
                        <button
                            key={option.key}
                            type="button"
                            onClick={() => setStatusFilter(option.key)}
                            className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-[var(--accent-gold)] text-white'
                                    : 'border border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-white'
                            }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>

            {/* Invoice List */}
            {filteredInvoices.length === 0 ? (
                <PaperCard className="text-center py-12">
                    <p className="text-[var(--ink-medium)] mb-4">
                        No invoices yet. Create your first invoice!
                    </p>
                    <Link
                        to="/create"
                        className="inline-flex items-center px-6 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-md"
                    >
                        Create Invoice
                    </Link>
                </PaperCard>
            ) : (
                <div className="space-y-3">
                    {/* Table Header */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-2 text-xs uppercase tracking-wider text-[var(--ink-light)] font-medium">
                        <div className="col-span-1">#</div>
                        <div className="col-span-3">Amount</div>
                        <div className="col-span-2">Token</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Block</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {/* Invoice Rows */}
                    {filteredInvoices.map((invoice) => (
                        <PaperCard key={invoice.id.toString()} className="!p-4">
                            <div className="grid grid-cols-12 gap-4 items-center">
                                {/* ID */}
                                <div className="col-span-12 sm:col-span-1">
                                    <span className="sm:hidden text-xs text-[var(--ink-light)]"># </span>
                                    <span className="font-mono text-sm text-[var(--ink-dark)]">
                                        {invoice.id.toString()}
                                    </span>
                                </div>

                                {/* Amount */}
                                <div className="col-span-6 sm:col-span-3">
                                    <span className="sm:hidden text-xs text-[var(--ink-light)] block">Amount</span>
                                    <span className="font-mono text-sm text-[var(--ink-dark)] font-medium">
                                        {formatAmount(invoice.totalAmount)}
                                    </span>
                                </div>

                                {/* Token */}
                                <div className="col-span-6 sm:col-span-2">
                                    <span className="sm:hidden text-xs text-[var(--ink-light)] block">Token</span>
                                    <span className="font-mono text-xs text-[var(--ink-medium)]">
                                        {formatAddress(invoice.token)}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="col-span-4 sm:col-span-2">
                                    <StampBadge status={invoice.status} size="sm" />
                                </div>

                                {/* Created Block */}
                                <div className="col-span-4 sm:col-span-2">
                                    <span className="sm:hidden text-xs text-[var(--ink-light)] block">Block</span>
                                    <span className="font-mono text-xs text-[var(--ink-light)]">
                                        #{invoice.createdAtBlock.toString()}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-3">
                                    <Link
                                        to={`/invoice/${invoice.id.toString()}`}
                                        className="text-sm text-[var(--accent-gold)] hover:text-[var(--accent-gold-light)] transition-colors"
                                    >
                                        View
                                    </Link>
                                    {invoice.status === InvoiceStatus.Pending && (
                                        <Link
                                            to={`/pay/${invoice.id.toString()}`}
                                            className="text-sm text-white bg-[var(--accent-gold)] px-3 py-1 rounded hover:bg-[var(--accent-gold-light)] transition-colors"
                                        >
                                            Pay
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </PaperCard>
                    ))}
                </div>
            )}
        </div>
    );
}
