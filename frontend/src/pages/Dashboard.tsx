import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { PaperCard } from '../components/common/PaperCard';
import { StampBadge } from '../components/common/StampBadge';
import { InvoiceStatus, isInvoiceExpired } from '../types/invoice';
import type { InvoiceData } from '../types/invoice';
import { useNetwork } from '../hooks/useNetwork';
import { useBlockNumber } from '../hooks/useBlockNumber';
import { contractService } from '../services/ContractService';
import { findToken, formatTokenAmount, formatAddress } from '../config/tokens';
import { parseInvoiceProperties } from '../utils/invoice';
import { friendlyError } from '../utils/errors';
import { getPendingInvoices, clearPendingInvoices, removePendingInvoice } from '../utils/invoicePending';
import type { PendingInvoice } from '../utils/invoicePending';

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
    const currentBlock = useBlockNumber();
    const [activeTab, setActiveTab] = useState<Tab>('created');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [totalCount, setTotalCount] = useState(0n);
    const [tokenDecimals, setTokenDecimals] = useState<Record<string, number>>({});
    const fetchedDecimalsRef = useRef<Set<string>>(new Set());
    const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>([]);
    /** Track previous wallet invoice count to detect growth (= tx confirmed). */
    const prevWalletCountRef = useRef<bigint | null>(null);

    // Load pending invoices from localStorage
    const walletHexForPending = address?.toHex();
    useEffect(() => {
        if (walletHexForPending) {
            setPendingInvoices(getPendingInvoices(walletHexForPending));
        } else {
            setPendingInvoices([]);
        }
    }, [walletHexForPending]);

    // Clear invoices immediately when wallet changes
    useEffect(() => {
        setInvoices([]);
        setTotalCount(0n);
        setFetchError('');
        setTokenDecimals({});
        fetchedDecimalsRef.current.clear();
        prevWalletCountRef.current = null;
        contractService.clearCache();
    }, [walletAddress]);

    const fetchInvoices = useCallback(async () => {
        if (!walletAddress || !address) return;
        setLoading(true);
        setFetchError('');

        try {
            const contract = contractService.getBlockBillContract(network);

            // Get per-wallet count (for display) using index query
            const indexResult = activeTab === 'created'
                ? await contract.getInvoicesByCreator(address)
                : await contract.getInvoicesByRecipient(address);

            const walletCount = indexResult?.properties?.count ?? 0n;
            setTotalCount(walletCount);

            // Refresh pending invoices from localStorage.
            // Clear entries older than 15 min (stale / abandoned — a Bitcoin block takes ~10 min).
            // Clear all pending only when on-chain wallet count GROWS (= new invoice confirmed).
            if (activeTab === 'created') {
                const walletHex = address.toHex();
                const current = getPendingInvoices(walletHex);
                const STALE_MS = 15 * 60 * 1000;
                const now = Date.now();
                const stale = current.filter((p) => now - p.createdAt > STALE_MS);
                stale.forEach((p) => removePendingInvoice(p.pendingId));

                if (prevWalletCountRef.current !== null && walletCount > prevWalletCountRef.current) {
                    // On-chain count grew — new invoice confirmed, clear all pending
                    clearPendingInvoices(walletHex);
                    setPendingInvoices([]);
                } else {
                    // Keep fresh pending as placeholder
                    setPendingInvoices(current.filter((p) => now - p.createdAt <= STALE_MS));
                }
                prevWalletCountRef.current = walletCount;
            }

            if (walletCount === 0n) {
                setInvoices([]);
                return;
            }

            // Get global invoice count and scan all invoices
            // (ABI only exposes count from index queries, not the actual IDs)
            const globalResult = await contract.getInvoiceCount();
            const globalCount = Math.min(Number(globalResult?.properties?.count ?? 0n), 200);

            if (globalCount === 0) {
                setInvoices([]);
                return;
            }

            const walletHex = address.toHex().replace(/^(0x)+/i, '').toLowerCase();

            const promises = Array.from({ length: globalCount }, (_, i) =>
                contract.getInvoice(BigInt(i + 1)).catch(() => null),
            );
            const results = await Promise.all(promises);

            const fetchedInvoices: InvoiceData[] = [];
            for (let i = 0; i < results.length; i++) {
                const invResult = results[i];
                if (!invResult?.properties) continue;

                const inv = parseInvoiceProperties(BigInt(i + 1), invResult.properties);

                const isCreator = inv.creator.replace(/^(0x)+/i, '').toLowerCase() === walletHex;
                const isRecipient = inv.recipient.replace(/^(0x)+/i, '').toLowerCase() === walletHex;
                if (activeTab === 'created' && isCreator) fetchedInvoices.push(inv);
                else if (activeTab === 'received' && isRecipient) fetchedInvoices.push(inv);
            }

            setInvoices(fetchedInvoices);
        } catch (err: unknown) {
            setFetchError(friendlyError(err instanceof Error ? err.message : String(err)));
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    }, [walletAddress, address, activeTab, network]);

    useEffect(() => {
        void fetchInvoices();
    }, [fetchInvoices]);

    // Auto-poll every 30s to pick up newly confirmed invoices
    useEffect(() => {
        if (!walletAddress) return;
        const interval = setInterval(() => { void fetchInvoices(); }, 30_000);
        return () => clearInterval(interval);
    }, [walletAddress, fetchInvoices]);

    // Fetch on-chain decimals for each unique token in the invoice list
    useEffect(() => {
        const uniqueTokens = [...new Set(invoices.map((inv) => inv.token))];
        const toFetch = uniqueTokens.filter((t) => t && !fetchedDecimalsRef.current.has(t));
        if (toFetch.length === 0) return;

        let cancelled = false;
        const fetchDecimals = async (): Promise<void> => {
            const results: Record<string, number> = {};
            await Promise.all(toFetch.map(async (tokenAddr) => {
                try {
                    const tokenContract = contractService.getTokenContract(tokenAddr, network);
                    const metadata = await tokenContract.metadata();
                    if (metadata?.properties?.decimals != null) {
                        results[tokenAddr] = metadata.properties.decimals;
                    }
                } catch {
                    // fallback to config decimals
                }
                fetchedDecimalsRef.current.add(tokenAddr);
            }));
            if (!cancelled && Object.keys(results).length > 0) {
                setTokenDecimals((prev) => ({ ...prev, ...results }));
            }
        };
        void fetchDecimals();
        return () => { cancelled = true; };
    }, [invoices, network]);

    const filteredInvoices = statusFilter === 'all'
        ? invoices
        : invoices.filter((inv) => {
            const opt = FILTER_OPTIONS.find(f => f.key === statusFilter);
            return opt?.status !== null && opt?.status !== undefined && inv.status === opt.status;
        });

    // Show pending cards on "all" and "pending" tabs, only for "created" tab
    const showPending = activeTab === 'created' && (statusFilter === 'all' || statusFilter === 'pending');
    const displayedPendingCount = showPending ? pendingInvoices.length : 0;

    const statusLabel = (inv: InvoiceData): string => {
        if (currentBlock > 0n && isInvoiceExpired(inv, currentBlock)) return 'Expired';
        return inv.status === InvoiceStatus.Paid ? 'Paid' : inv.status === InvoiceStatus.Cancelled ? 'Cancelled' : 'Pending';
    };

    const exportCsv = useCallback(() => {
        if (filteredInvoices.length === 0) return;
        const base = window.location.origin;
        const rows: string[][] = [['ID', 'Amount', 'Token', 'Status', 'Created Block', 'Paid By', 'Paid Block', 'Link']];
        for (const inv of filteredInvoices) {
            const tok = findToken(inv.token, network);
            const dec = tokenDecimals[inv.token] ?? tok?.decimals ?? 8;
            rows.push([
                inv.id.toString(),
                formatTokenAmount(inv.totalAmount, dec),
                tok?.symbol ?? formatAddress(inv.token),
                statusLabel(inv),
                inv.createdAtBlock.toString(),
                inv.paidBy && !/^0x0+$/.test(inv.paidBy) ? formatAddress(inv.paidBy) : '',
                inv.paidAtBlock > 0n ? inv.paidAtBlock.toString() : '',
                `${base}/invoice/${inv.id.toString()}`,
            ]);
        }
        const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blockbill-${activeTab}-invoices.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [filteredInvoices, activeTab, network, tokenDecimals]);

    const handleDeletePending = useCallback((pendingId: string) => {
        removePendingInvoice(pendingId);
        if (walletHexForPending) {
            setPendingInvoices(getPendingInvoices(walletHexForPending));
        }
    }, [walletHexForPending]);

    if (!walletAddress) {
        return (
            <div className="max-w-4xl mx-auto">
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

    const hasContent = filteredInvoices.length > 0 || displayedPendingCount > 0;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-8 mb-6 border-b border-[var(--border-paper)]">
                {(['created', 'received'] as const).map((tab) => (
                    <button key={tab} type="button"
                        onClick={() => { setActiveTab(tab); setStatusFilter('all'); prevWalletCountRef.current = null; }}
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
                    {(Number(totalCount) + pendingInvoices.length).toString()} total{pendingInvoices.length > 0 && ` (${pendingInvoices.length} broadcasting)`}
                </span>
                <button type="button" onClick={() => void fetchInvoices()} disabled={loading}
                    title="Refresh"
                    className="ml-1 p-1 text-[var(--ink-light)] hover:text-[var(--accent-gold)] transition-colors disabled:opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
                {filteredInvoices.length > 0 && (
                    <button type="button" onClick={exportCsv}
                        className="ml-auto text-xs text-[var(--accent-gold)] hover:text-[var(--accent-gold-light)] transition-colors flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export CSV
                    </button>
                )}
            </div>

            {/* Error */}
            {fetchError && (
                <div className="mb-4 px-4 py-3 bg-[var(--stamp-red)]/5 border border-[var(--stamp-red)] rounded-lg flex items-center justify-between">
                    <p className="text-sm text-[var(--stamp-red)]">{fetchError}</p>
                    <button type="button" onClick={() => void fetchInvoices()}
                        className="text-sm text-[var(--accent-gold)] hover:underline ml-4 shrink-0">
                        Retry
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading && !hasContent ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[var(--ink-light)] mt-4 font-serif">Loading invoices...</p>
                </div>
            ) : !hasContent ? (
                <PaperCard className="text-center py-12">
                    <p className="text-[var(--ink-medium)] mb-4">
                        {invoices.length === 0 && pendingInvoices.length === 0 ? 'No invoices yet.' : 'No matching invoices.'}
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

                    {/* ── Pending (broadcasting) invoice cards ───────────── */}
                    {showPending && pendingInvoices.map((pi) => {
                        const tok = findToken(pi.tokenAddress, network);
                        return (
                            <PaperCard key={pi.pendingId} className="!p-4 relative border-dashed border-[var(--accent-gold)]/40">
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-12 sm:col-span-1">
                                        <span className="font-mono text-sm text-[var(--ink-light)]">—</span>
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <span className="sm:hidden text-xs text-[var(--ink-light)] block">Amount</span>
                                        <span className="font-mono text-sm text-[var(--ink-dark)] font-medium">
                                            {pi.totalAmount}
                                        </span>
                                    </div>
                                    <div className="col-span-6 sm:col-span-2">
                                        <span className="sm:hidden text-xs text-[var(--ink-light)] block">Token</span>
                                        <span className="text-xs text-[var(--ink-medium)]">
                                            {pi.tokenIcon || tok?.icon || ''} {pi.tokenSymbol || tok?.symbol || formatAddress(pi.tokenAddress)}
                                        </span>
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-dashed border-[var(--accent-gold)] text-[var(--accent-gold)] bg-[var(--accent-gold)]/5">
                                            <span className="inline-block w-2 h-2 border border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
                                            Broadcasting
                                        </span>
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <span className="sm:hidden text-xs text-[var(--ink-light)] block">Block</span>
                                        <span className="font-mono text-xs text-[var(--ink-light)]">—</span>
                                    </div>
                                    <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-3">
                                        {pi.txId && (
                                            <a href={`https://mempool.opnet.org/fr/testnet4/tx/${pi.txId}`}
                                                target="_blank" rel="noopener noreferrer"
                                                className="text-xs text-[var(--accent-gold)] hover:underline"
                                                title="View on mempool">
                                                Tx
                                            </a>
                                        )}
                                        <button type="button" onClick={() => handleDeletePending(pi.pendingId)}
                                            className="text-xs text-[var(--ink-light)] hover:text-[var(--stamp-red)] transition-colors"
                                            title="Dismiss">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {pi.memo && (
                                    <p className="mt-2 text-xs text-[var(--ink-light)] italic truncate">{pi.memo}</p>
                                )}
                            </PaperCard>
                        );
                    })}

                    {/* ── On-chain invoice cards ─────────────────────────── */}
                    {filteredInvoices.map((invoice) => {
                        const tok = findToken(invoice.token, network);
                        const dec = tokenDecimals[invoice.token] ?? tok?.decimals ?? 8;
                        const expired = currentBlock > 0n && isInvoiceExpired(invoice, currentBlock);
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
                                        <StampBadge status={invoice.status} size="sm" expired={expired} />
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
                                        {invoice.status === InvoiceStatus.Pending && !expired && activeTab === 'received' && (() => {
                                            const broadcastTs = localStorage.getItem(`bb_pay_broadcast_${invoice.id.toString()}`);
                                            const isBroadcast = broadcastTs && Date.now() - parseInt(broadcastTs, 10) < 15 * 60 * 1000;
                                            return isBroadcast ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-gold)]">
                                                    <span className="inline-block w-2 h-2 border border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
                                                    Paying…
                                                </span>
                                            ) : (
                                                <Link to={`/pay/${invoice.id.toString()}`}
                                                    className="text-sm text-white bg-[var(--accent-gold)] px-3 py-1 rounded hover:bg-[var(--accent-gold-light)] transition-colors">
                                                    Pay
                                                </Link>
                                            );
                                        })()}
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
