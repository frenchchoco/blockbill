import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { PaperCard } from '../components/common/PaperCard';
import { StampBadge } from '../components/common/StampBadge';
import { InvoiceStatus } from '../types/invoice';
import type { InvoiceData, LineItem } from '../types/invoice';
import { useNetwork } from '../hooks/useNetwork';
import { contractService } from '../services/ContractService';
import { findToken, formatTokenAmount, formatAddress } from '../config/tokens';
import type { Address } from '@btc-vision/transaction';

export function InvoiceView(): React.JSX.Element {
    const { id } = useParams<{ id: string }>();
    const { network } = useNetwork();
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [lineItems, setLineItems] = useState<readonly LineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState('');

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError('');

        const fetchInvoice = async (): Promise<void> => {
            try {
                const contract = contractService.getBlockBillContract(network);
                const result = await contract.getInvoice(BigInt(id));
                if (!result?.properties) { setError('Invoice not found'); return; }

                const p = result.properties;
                const inv: InvoiceData = {
                    id: BigInt(id),
                    creator: (p.creator as Address)?.toHex() ?? '',
                    token: (p.token as Address)?.toHex() ?? '',
                    totalAmount: p.totalAmount ?? 0n,
                    recipient: (p.recipient as Address)?.toHex() ?? '',
                    memo: p.memo ?? '',
                    deadline: p.deadline ?? 0n,
                    taxBps: p.taxBps ?? 0,
                    status: (p.status ?? 0) as InvoiceStatus,
                    paidBy: (p.paidBy as Address)?.toHex() ?? '',
                    paidAtBlock: p.paidAtBlock ?? 0n,
                    createdAtBlock: p.createdAtBlock ?? 0n,
                    btcTxHash: p.btcTxHash ?? '',
                    lineItemCount: p.lineItemCount ?? 0,
                };
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

    useEffect(() => {
        const url = window.location.href;
        QRCode.toDataURL(url, { width: 160, margin: 2, color: { dark: '#3E2723', light: '#FFFEF7' } })
            .then(setQrDataUrl).catch(() => {});
    }, [id]);

    const handleCopyLink = useCallback(() => {
        void navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, []);

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <div className="inline-block w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
                <p className="text-[var(--ink-light)] mt-4 font-serif">Loading invoice...</p>
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

    const token = findToken(invoice.token, network);
    const decimals = token?.decimals ?? 8;
    const isPaid = invoice.status === InvoiceStatus.Paid;

    return (
        <div className="max-w-2xl mx-auto">
            <PaperCard className="relative">
                <div className="flex items-start justify-between mb-8 pb-6 border-b border-[var(--border-paper)]">
                    <div>
                        <h1 className="text-3xl font-serif text-[var(--ink-dark)]">INVOICE #{id}</h1>
                        <p className="text-sm text-[var(--ink-light)] mt-1">Created at Block #{invoice.createdAtBlock.toString()}</p>
                    </div>
                    <StampBadge status={invoice.status} size="lg" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-[var(--ink-light)] font-medium mb-1">From</p>
                        <p className="font-mono text-sm text-[var(--ink-dark)] break-all">{formatAddress(invoice.creator)}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-[var(--ink-light)] font-medium mb-1">To</p>
                        <p className="font-mono text-sm text-[var(--ink-dark)] break-all">
                            {invoice.recipient ? formatAddress(invoice.recipient) : 'Open Invoice'}
                        </p>
                    </div>
                    {qrDataUrl && (
                        <div className="flex justify-center sm:justify-end">
                            <div className="text-center">
                                <img src={qrDataUrl} alt="Share QR" className="w-24 h-24 rounded border border-[var(--border-paper)]" />
                                <p className="text-xs text-[var(--ink-light)] mt-1">Scan to view</p>
                            </div>
                        </div>
                    )}
                </div>

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
                        {invoice.deadline > 0n && (<>
                            <span className="text-[var(--ink-light)]">Deadline</span>
                            <span className="font-mono text-[var(--ink-dark)] text-right">Block #{invoice.deadline.toString()}</span>
                        </>)}
                    </div>
                </div>

                {invoice.memo && (
                    <div className="mb-8">
                        <h2 className="text-lg font-serif text-[var(--ink-dark)] mb-2">Memo</h2>
                        <div className="p-4 bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded-lg">
                            <p className="text-sm text-[var(--ink-medium)] italic leading-relaxed">{invoice.memo}</p>
                        </div>
                    </div>
                )}

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

                {isPaid && (
                    <div className="mb-8 p-4 bg-[var(--paper-bg)] border border-[var(--stamp-green)] rounded-lg">
                        <h2 className="text-lg font-serif text-[var(--stamp-green)] mb-3">Payment Proof</h2>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <span className="text-[var(--ink-light)]">Paid by</span>
                            <span className="font-mono text-[var(--ink-dark)] text-right break-all">{formatAddress(invoice.paidBy)}</span>
                            <span className="text-[var(--ink-light)]">Paid at</span>
                            <span className="font-mono text-[var(--ink-dark)] text-right">Block #{invoice.paidAtBlock.toString()}</span>
                            {invoice.btcTxHash && (<>
                                <span className="text-[var(--ink-light)]">BTC Tx</span>
                                <span className="font-mono text-[var(--ink-dark)] text-right break-all">{formatAddress(invoice.btcTxHash)}</span>
                            </>)}
                        </div>
                        <div className="mt-3 pt-2 border-t border-[var(--stamp-green)]/30">
                            <p className="text-xs text-[var(--stamp-green)] italic text-center">Permanently recorded on Bitcoin L1</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[var(--border-paper)]">
                    {invoice.status === InvoiceStatus.Pending && (
                        <Link to={`/pay/${id}`} className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-md text-center">
                            Pay Invoice
                        </Link>
                    )}
                    {isPaid && (
                        <Link to={`/invoice/${id}/receipt`} className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-[var(--stamp-green)] text-white font-medium rounded-lg hover:opacity-90 transition-colors shadow-md text-center">
                            View Receipt
                        </Link>
                    )}
                    <button type="button" onClick={handleCopyLink}
                        className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-[var(--border-paper)] text-[var(--ink-medium)] font-medium rounded-lg hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors">
                        {copied ? 'Copied!' : 'Share Link'}
                    </button>
                </div>
            </PaperCard>
        </div>
    );
}
