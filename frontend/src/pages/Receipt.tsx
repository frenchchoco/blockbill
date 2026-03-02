import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { PaperCard } from '../components/common/PaperCard';
import { StampBadge } from '../components/common/StampBadge';
import { InvoiceStatus } from '../types/invoice';
import type { InvoiceData, LineItem } from '../types/invoice';
import { useNetwork } from '../hooks/useNetwork';
import { contractService } from '../services/ContractService';
import { findToken, formatTokenAmount, formatAddress, formatRecipient } from '../config/tokens';
import { parseInvoiceProperties } from '../utils/invoice';

export function Receipt(): React.JSX.Element {
    const { id } = useParams<{ id: string }>();
    const { network } = useNetwork();
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [lineItems, setLineItems] = useState<readonly LineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [onChainDecimals, setOnChainDecimals] = useState<number | null>(null);

    useEffect(() => {
        if (!id || !/^\d+$/.test(id)) { setError('Invalid invoice ID'); setLoading(false); return; }
        setLoading(true);

        const fetchInvoice = async (): Promise<void> => {
            try {
                const contract = contractService.getBlockBillContract(network);
                const result = await contract.getInvoice(BigInt(id));
                if (!result?.properties) { setError('Invoice not found'); return; }

                const inv = parseInvoiceProperties(BigInt(id), result.properties);
                setInvoice(inv);

                if (inv.lineItemCount > 0) {
                    try {
                        const liResult = await contract.getLineItems(BigInt(id));
                        if (liResult?.properties) {
                            const items: LineItem[] = [];
                            const descs = Array.isArray(liResult.properties.descriptions) ? liResult.properties.descriptions : [liResult.properties.descriptions];
                            const amounts = Array.isArray(liResult.properties.amounts) ? liResult.properties.amounts : [liResult.properties.amounts];
                            for (let i = 0; i < inv.lineItemCount; i++) {
                                items.push({ description: descs[i]?.toString() ?? `Item ${i + 1}`, amount: amounts[i] ?? 0n });
                            }
                            setLineItems(items);
                        }
                    } catch { /* line items non-critical */ }
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                setError(msg.includes('unreachable') ? 'Invoice not found' : msg);
            } finally {
                setLoading(false);
            }
        };
        void fetchInvoice();
    }, [id, network]);

    // Fetch on-chain decimals for the invoice token
    useEffect(() => {
        if (!invoice?.token) return;
        let cancelled = false;
        const fetchDec = async (): Promise<void> => {
            try {
                const tokenContract = contractService.getTokenContract(invoice.token, network);
                const metadata = await tokenContract.metadata();
                if (!cancelled && metadata?.properties?.decimals != null) {
                    setOnChainDecimals(metadata.properties.decimals);
                }
            } catch {
                // fallback to config decimals
            }
        };
        void fetchDec();
        return () => { cancelled = true; };
    }, [invoice?.token, network]);

    useEffect(() => {
        const url = window.location.href.replace('/receipt', '');
        QRCode.toDataURL(url, { width: 140, margin: 2, color: { dark: '#2E7D32', light: '#FFFEF7' } })
            .then(setQrDataUrl).catch(() => {});
    }, [id]);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <div className="inline-block w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
                <p className="text-[var(--ink-light)] mt-4 font-serif">Loading receipt...</p>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <p className="text-[var(--stamp-red)] text-lg font-serif">{error || 'Invoice not found'}</p>
                <Link to="/dashboard" className="text-[var(--accent-gold)] hover:underline mt-4 inline-block">Back to Dashboard</Link>
            </div>
        );
    }

    if (invoice.status !== InvoiceStatus.Paid) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <StampBadge status={invoice.status} size="lg" />
                <p className="text-[var(--ink-medium)] mt-4 font-serif text-lg">
                    No receipt available &mdash; this invoice has not been paid yet.
                </p>
                <Link to={`/invoice/${id}`} className="text-[var(--accent-gold)] hover:underline mt-4 inline-block">View Invoice</Link>
            </div>
        );
    }

    const token = findToken(invoice.token, network);
    const decimals = onChainDecimals ?? token?.decimals ?? 8;

    return (
        <>
            <style>{`
                @media print {
                    header, footer, .no-print { display: none !important; }
                    body { background: white !important; }
                    .print-card { box-shadow: none !important; border: 1px solid #ccc !important; }
                }
            `}</style>

            <div className="max-w-2xl mx-auto">
                <PaperCard className="relative print-card">
                    {/* Receipt Header */}
                    <div className="flex items-start justify-between mb-8 pb-6 border-b border-[var(--border-paper)]">
                        <div>
                            <h1 className="text-4xl font-serif text-[var(--ink-dark)] tracking-wide">RECEIPT</h1>
                            <p className="text-sm text-[var(--ink-light)] mt-1">Invoice #{id ?? '?'}</p>
                            <p className="text-xs text-[var(--ink-light)]">Block #{invoice.createdAtBlock.toString()}</p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <StampBadge status={InvoiceStatus.Paid} size="lg" />
                            {qrDataUrl && (
                                <img src={qrDataUrl} alt="Invoice QR" className="w-20 h-20 rounded border border-[var(--stamp-green)]/30" />
                            )}
                        </div>
                    </div>

                    {/* Parties */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-[var(--ink-light)] font-medium mb-1">From</p>
                            <p className="font-mono text-sm text-[var(--ink-dark)] break-all">{formatAddress(invoice.creator)}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-[var(--ink-light)] font-medium mb-1">To</p>
                            <p className="font-mono text-sm text-[var(--ink-dark)] break-all">
                                {formatRecipient(invoice.recipient)}
                            </p>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="mb-8 space-y-3">
                        <h2 className="text-lg font-serif text-[var(--ink-dark)] mb-3">Details</h2>
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                            <span className="text-[var(--ink-light)]">Token</span>
                            <span className="font-mono text-[var(--ink-dark)] text-right">
                                {token ? `${token.icon} ${token.symbol}` : formatAddress(invoice.token)}
                            </span>
                            <span className="text-[var(--ink-light)]">Amount</span>
                            <span className="font-mono text-[var(--ink-dark)] text-right font-bold text-lg">
                                {formatTokenAmount(invoice.totalAmount, decimals)}
                            </span>
                            {invoice.taxBps > 0 && (<>
                                <span className="text-[var(--ink-light)]">Tax</span>
                                <span className="font-mono text-[var(--ink-dark)] text-right">{invoice.taxBps / 100}%</span>
                            </>)}
                        </div>
                    </div>

                    {/* Memo */}
                    {invoice.memo && (
                        <div className="mb-8">
                            <h2 className="text-lg font-serif text-[var(--ink-dark)] mb-2">Memo</h2>
                            <div className="p-4 bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded-lg">
                                <p className="text-sm text-[var(--ink-medium)] italic leading-relaxed">{invoice.memo}</p>
                            </div>
                        </div>
                    )}

                    {/* Line Items */}
                    {lineItems.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-serif text-[var(--ink-dark)] mb-3">Line Items</h2>
                            <div className="border border-[var(--border-paper)] rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead><tr className="bg-[var(--paper-card-dark)]">
                                        <th className="text-left px-4 py-2.5 font-serif font-medium text-[var(--ink-dark)] w-12">#</th>
                                        <th className="text-left px-4 py-2.5 font-serif font-medium text-[var(--ink-dark)]">Description</th>
                                        <th className="text-right px-4 py-2.5 font-serif font-medium text-[var(--ink-dark)]">Amount</th>
                                    </tr></thead>
                                    <tbody>{lineItems.map((item, index) => (
                                        <tr key={index} className="border-t border-[var(--border-paper)]">
                                            <td className="px-4 py-2.5 text-[var(--ink-light)]">{index + 1}</td>
                                            <td className="px-4 py-2.5 text-[var(--ink-dark)]">{item.description}</td>
                                            <td className="px-4 py-2.5 text-right font-mono text-[var(--ink-dark)]">{formatTokenAmount(item.amount, decimals)}</td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Payment Proof */}
                    <div className="mb-8 p-5 bg-[var(--paper-bg)] border border-[var(--stamp-green)] rounded-lg">
                        <h2 className="text-lg font-serif text-[var(--stamp-green)] mb-3">Payment Proof</h2>
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                            <span className="text-[var(--ink-light)]">Paid by</span>
                            <span className="font-mono text-[var(--ink-dark)] text-right break-all">{formatAddress(invoice.paidBy)}</span>
                            <span className="text-[var(--ink-light)]">Paid at</span>
                            <span className="font-mono text-[var(--ink-dark)] text-right">Block #{invoice.paidAtBlock.toString()}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[var(--stamp-green)]/30">
                            <p className="text-xs text-[var(--stamp-green)] italic text-center">
                                Permanently recorded on Bitcoin L1
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[var(--border-paper)] no-print">
                        <button type="button" onClick={handlePrint}
                            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-md">
                            Print Receipt
                        </button>
                        <Link to={`/invoice/${id ?? ''}`}
                            className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-[var(--border-paper)] text-[var(--ink-medium)] font-medium rounded-lg hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors text-center">
                            Back to Invoice
                        </Link>
                    </div>
                </PaperCard>
            </div>
        </>
    );
}
