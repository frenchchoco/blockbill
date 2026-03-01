import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { PaperCard } from '../components/common/PaperCard';
import { StampBadge } from '../components/common/StampBadge';
import { InvoiceStatus } from '../types/invoice';
import type { InvoiceData } from '../types/invoice';
import { useNetwork } from '../hooks/useNetwork';
import { contractService } from '../services/ContractService';
import { findToken, formatTokenAmount, formatAddress } from '../config/tokens';
import type { Address } from '@btc-vision/transaction';

type Tab = 'created' | 'received';
type StatusFilter = 'all' | 'pending' | 'paid' | 'cancelled';

const FILTER_OPTIONS: readonly { key: StatusFilter; label: string; status: InvoiceStatus | null }[] = [
    { key: 'all', label: 'All', status: null },
    { key: 'pending', label: 'Pending', status: InvoiceStatus.Pending },
    { key: 'paid', label: 'Paid', status: InvoiceStatus.Paid },
    { key: 'cancelled', label: 'Cancelled', status: InvoiceStatus.Cancelled },
];

export function Dashboard(): React.JSX.Element {
    const { walletAddress, address, openConnectModal } = useWalletConnect();
    const { network } = useNetwork();
    const [activeTab, setActiveTab] = useState<Tab>('created');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0n);

    // Clear invoices immediately when wallet changes
    useEffect(() => {
        setInvoices([]);
        setTotalCount(0n);
        contractService.clearCache();
    }, [walletAddress]);

    const fetchInvoices = useCallback(async () => {
        if (!walletAddress || !address) return;
        setLoading(true);

        try {
            const contract = contractService.getBlockBillContract(network);

            // Pass the wallet's Address object (not string) for ABI ADDRESS params
            const result = activeTab === 'created'
                ? await contract.getInvoicesByCreator(address)
                : await contract.getInvoicesByRecipient(address);

            const count = result?.properties?.count ?? 0n;
            setTotalCount(count);

            if (count === 0n) {
                setInvoices([]);
                return;
            }

            // Fetch all invoices in parallel (Promise.all per OPNet guidelines)
            const countNum = Math.min(Number(count), 50);
            const walletHex = address.toHex().toLowerCase();

            const promises = Array.from({ length: countNum }, (_, i) =>
                contract.getInvoice(BigInt(i + 1)).catch(() => null),
            );
            const results = await Promise.all(promises);

            const fetchedInvoices: InvoiceData[] = [];
            for (let i = 0; i < results.length; i++) {
                const invResult = results[i];
                if (!invResult?.properties) continue;
                const p = invResult.properties;

                const inv: InvoiceData = {
                    id: BigInt(i + 1),
                    creator: (p.creator as Address | undefined)?.toHex() ?? '',
                    token: (p.token as Address | undefined)?.toHex() ?? '',
                    totalAmount: p.totalAmount ?? 0n,
                    recipient: (p.recipient as Address | undefined)?.toHex() ?? '',
                    memo: p.memo ?? '',
                    deadline: p.deadline ?? 0n,
                    taxBps: p.taxBps ?? 0,
                    status: (p.status ?? 0) as InvoiceStatus,
                    paidBy: (p.paidBy as Address | undefined)?.toHex() ?? '',
                    paidAtBlock: p.paidAtBlock ?? 0n,
                    createdAtBlock: p.createdAtBlock ?? 0n,
                    btcTxHash: p.btcTxHash ?? '',
                    lineItemCount: p.lineItemCount ?? 0,
                };

                const isCreator = inv.creator.toLowerCase() === walletHex;
                const isRecipient = inv.recipient.toLowerCase() === walletHex;
                if (activeTab === 'created' && isCreator) fetchedInvoices.push(inv);
                else if (activeTab === 'received' && isRecipient) fetchedInvoices.push(inv);
            }

            setInvoices(fetchedInvoices);
        } catch {
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    }, [walletAddress, address, activeTab, network]);

    useEffect(() => {
        void fetchInvoices();
    }, [fetchInvoices]);

    const filteredInvoices = statusFilter === 'all'
        ? invoices
        : invoices.filter((inv) => {
            const opt = FILTER_OPTIONS.find(f => f.key === statusFilter);
            return opt?.status !== null && opt?.status !== undefined && inv.status === opt.status;
        });

    if (!walletAddress) {
        return (
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-serif text-[var(--ink-dark)] mb-8 text-center">My Invoices</h1>
                <PaperCard className="text-center py-12">
                    <p className="text-[var(--ink-medium)] mb-4">Connect your wallet to see your invoices.</p>
                    <button type="button" onClick={openConnectModal}
                        className="px-8 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-md">
                        Connect Wallet
                    </button>
                </PaperCard>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-serif text-[var(--ink-dark)] mb-8 text-center">My Invoices</h1>

            {/* Tabs */}
            <div className="flex gap-8 mb-6 border-b border-[var(--border-paper)]">
                {(['created', 'received'] as const).map((tab) => (
                    <button key={tab} type="button"
                        onClick={() => { setActiveTab(tab); setStatusFilter('all'); }}
                        className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
                            activeTab === tab
                                ? 'border-[var(--accent-gold)] text-[var(--ink-dark)]'
                                : 'border-transparent text-[var(--ink-light)] hover:text-[var(--ink-medium)]'
                        }`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {FILTER_OPTIONS.map((option) => (
                    <button key={option.key} type="button" onClick={() => setStatusFilter(option.key)}
                        className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                            statusFilter === option.key
                                ? 'bg-[var(--accent-gold)] text-white'
                                : 'border border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-white'
                        }`}>
                        {option.label}
                    </button>
                ))}
                <span className="text-xs text-[var(--ink-light)] self-center ml-2">
                    {totalCount.toString()} total
                </span>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[var(--ink-light)] mt-4 font-serif">Loading invoices...</p>
                </div>
            ) : filteredInvoices.length === 0 ? (
                <PaperCard className="text-center py-12">
                    <p className="text-[var(--ink-medium)] mb-4">
                        {invoices.length === 0 ? 'No invoices yet.' : 'No matching invoices.'}
                    </p>
                    <Link to="/create"
                        className="inline-flex items-center px-6 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-md">
                        Create Invoice
                    </Link>
                </PaperCard>
            ) : (
                <div className="space-y-3">
                    <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-2 text-xs uppercase tracking-wider text-[var(--ink-light)] font-medium">
                        <div className="col-span-1">#</div>
                        <div className="col-span-3">Amount</div>
                        <div className="col-span-2">Token</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Block</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {filteredInvoices.map((invoice) => {
                        const tok = findToken(invoice.token, network);
                        const dec = tok?.decimals ?? 8;
                        return (
                            <PaperCard key={invoice.id.toString()} className="!p-4 hover:shadow-lg transition-shadow">
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-12 sm:col-span-1">
                                        <span className="font-mono text-sm text-[var(--ink-dark)]">{invoice.id.toString()}</span>
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <span className="sm:hidden text-xs text-[var(--ink-light)] block">Amount</span>
                                        <span className="font-mono text-sm text-[var(--ink-dark)] font-medium">
                                            {formatTokenAmount(invoice.totalAmount, dec)}
                                        </span>
                                    </div>
                                    <div className="col-span-6 sm:col-span-2">
                                        <span className="sm:hidden text-xs text-[var(--ink-light)] block">Token</span>
                                        <span className="text-xs text-[var(--ink-medium)]">
                                            {tok ? `${tok.icon} ${tok.symbol}` : formatAddress(invoice.token)}
                                        </span>
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <StampBadge status={invoice.status} size="sm" />
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <span className="sm:hidden text-xs text-[var(--ink-light)] block">Block</span>
                                        <span className="font-mono text-xs text-[var(--ink-light)]">#{invoice.createdAtBlock.toString()}</span>
                                    </div>
                                    <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-3">
                                        <Link to={`/invoice/${invoice.id.toString()}`}
                                            className="text-sm text-[var(--accent-gold)] hover:text-[var(--accent-gold-light)] transition-colors">
                                            View
                                        </Link>
                                        {invoice.status === InvoiceStatus.Pending && activeTab === 'received' && (
                                            <Link to={`/pay/${invoice.id.toString()}`}
                                                className="text-sm text-white bg-[var(--accent-gold)] px-3 py-1 rounded hover:bg-[var(--accent-gold-light)] transition-colors">
                                                Pay
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </PaperCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
