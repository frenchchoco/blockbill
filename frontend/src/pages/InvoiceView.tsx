import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';
import QRCode from 'qrcode';
import { PaperCard } from '../components/common/PaperCard';
import { StampBadge } from '../components/common/StampBadge';
import { InvoiceStatus, isInvoiceExpired } from '../types/invoice';
import type { InvoiceData, LineItem } from '../types/invoice';
import { useNetwork } from '../hooks/useNetwork';
import { useBlockNumber } from '../hooks/useBlockNumber';
import { contractService } from '../services/ContractService';
import { findToken, formatTokenAmount, formatAddress, formatRecipient } from '../config/tokens';
import { parseInvoiceProperties } from '../utils/invoice';
import { netFromGross, calculateFee, FEE_PERCENT } from '../utils/fee';

export function InvoiceView(): React.JSX.Element {
    const { id } = useParams<{ id: string }>();
    const { network } = useNetwork();
    const { address } = useWalletConnect();
    const currentBlock = useBlockNumber();
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [lineItems, setLineItems] = useState<readonly LineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [onChainDecimals, setOnChainDecimals] = useState<number | null>(null);

    const fetchInvoice = useCallback(async (showLoading = true): Promise<void> => {
        if (!id || !/^\d+$/.test(id)) { setError('Invalid invoice ID'); setLoading(false); return; }
        if (showLoading) { setLoading(true); setError(''); }

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
    }, [id, network]);

    useEffect(() => { void fetchInvoice(); }, [fetchInvoice]);

    // Auto-refresh every 30s while invoice is pending
    useEffect(() => {
        if (!invoice || invoice.status !== InvoiceStatus.Pending) return;
        const interval = setInterval(() => void fetchInvoice(false), 30_000);
        return () => clearInterval(interval);
    }, [invoice?.status, fetchInvoice]);

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
    const decimals = onChainDecimals ?? token?.decimals ?? 8;
    const isPaid = invoice.status === InvoiceStatus.Paid;
    const expired = currentBlock > 0n && isInvoiceExpired(invoice, currentBlock);
    const normalizeHex = (h: string): string => h.replace(/^(0x)+/i, '').toLowerCase();
    const walletHex = address ? normalizeHex(address.toHex()) : '';
    const isCreator = walletHex !== '' && normalizeHex(invoice.creator) === walletHex;
    const canPay = !!address && invoice.status === InvoiceStatus.Pending && !isCreator && !expired;

    return (
        <div className="max-w-2xl mx-auto">
            <PaperCard className="relative">
                <div className="flex items-start justify-between mb-8 pb-6 border-b border-[var(--border-paper)]">
                    <div>
                        <h1 className="text-3xl font-serif text-[var(--ink-dark)]">INVOICE #{id}</h1>
                        <p className="text-sm text-[var(--ink-light)] mt-1">Created at Block #{invoice.createdAtBlock.toString()}</p>
                    </div>
                    <StampBadge status={invoice.status} size="lg" expired={expired} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
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
                        <span className="text-[var(--ink-light)] text-xs">Creator receives</span>
                        <span className="font-mono text-[var(--ink-dark)] text-right text-xs">{formatTokenAmount(netFromGross(invoice.totalAmount), decimals)}</span>
                        <span className="text-[var(--ink-light)] text-xs">Platform fee ({FEE_PERCENT})</span>
                        <span className="font-mono text-[var(--ink-light)] text-right text-xs">{formatTokenAmount(calculateFee(invoice.totalAmount), decimals)}</span>
                        {invoice.deadline > 0n && (<>
                            <span className="text-[var(--ink-light)]">Deadline</span>
                            <span className={`font-mono text-right ${expired ? 'text-[var(--stamp-grey)]' : 'text-[var(--ink-dark)]'}`}>
                                Block #{invoice.deadline.toString()}
                                {expired && <span className="text-xs ml-1">(passed)</span>}
                            </span>
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
                                <span className="text-[var(--ink-light)]">Transaction</span>
                                <span className="text-right">
                                    <a href={`https://mempool.opnet.org/fr/testnet4/tx/${invoice.btcTxHash}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="font-mono text-xs text-[var(--accent-gold)] hover:underline">
                                        {formatAddress(invoice.btcTxHash)}
                                    </a>
                                </span>
                            </>)}
                        </div>
                        <div className="mt-3 pt-2 border-t border-[var(--stamp-green)]/30">
                            <p className="text-xs text-[var(--stamp-green)] italic text-center">Permanently recorded on Bitcoin L1</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[var(--border-paper)]">
                    {canPay && (
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
