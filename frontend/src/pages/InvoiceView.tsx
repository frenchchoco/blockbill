import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PaperCard } from '../components/common/PaperCard';
import { StampBadge } from '../components/common/StampBadge';
import { InvoiceStatus } from '../types/invoice';
import type { InvoiceData, LineItem } from '../types/invoice';

const MOCK_INVOICE: InvoiceData = {
    id: 1n,
    creator: 'tb1q...creator',
    token: 'tb1q...token',
    totalAmount: 100000000n,
    recipient: '',
    memo: 'Web development services - March 2026',
    deadline: 0n,
    taxBps: 2000,
    status: InvoiceStatus.Pending,
    paidBy: '',
    paidAtBlock: 0n,
    createdAtBlock: 12345n,
    btcTxHash: '',
    lineItemCount: 2,
};

const MOCK_LINE_ITEMS: readonly LineItem[] = [
    { description: 'Frontend Development', amount: 60000000n },
    { description: 'Backend API', amount: 40000000n },
];

function formatAddress(addr: string): string {
    if (!addr || addr.length <= 16) return addr || '--';
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
}

function formatAmount(amount: bigint): string {
    return amount.toString();
}

export function InvoiceView(): React.JSX.Element {
    const { id } = useParams<{ id: string }>();
    const [copied, setCopied] = useState(false);

    // For now, use mock data regardless of the ID
    const invoice = MOCK_INVOICE;
    const lineItems = MOCK_LINE_ITEMS;

    const handleCopyLink = useCallback(() => {
        void navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, []);

    const isPaid = invoice.status === InvoiceStatus.Paid;
    const hasMemo = invoice.memo.length > 0;
    const hasLineItems = lineItems.length > 0;
    const hasTax = invoice.taxBps > 0;
    const hasDeadline = invoice.deadline > 0n;
    const hasRecipient = invoice.recipient.length > 0;
    const hasBtcTx = invoice.btcTxHash.length > 0;

    return (
        <div className="max-w-2xl mx-auto">
            <PaperCard className="relative">
                {/* Invoice Header */}
                <div className="flex items-start justify-between mb-8 pb-6 border-b border-[var(--border-paper)]">
                    <div>
                        <h1 className="text-3xl font-serif text-[var(--ink-dark)]">
                            INVOICE #{id ?? '?'}
                        </h1>
                        <p className="text-sm text-[var(--ink-light)] mt-1">
                            Created at Block #{invoice.createdAtBlock.toString()}
                        </p>
                    </div>
                    <StampBadge status={invoice.status} size="lg" />
                </div>

                {/* Parties */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-[var(--ink-light)] font-medium mb-1">
                            From
                        </p>
                        <p className="font-mono text-sm text-[var(--ink-dark)] break-all">
                            {invoice.creator}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-[var(--ink-light)] font-medium mb-1">
                            To
                        </p>
                        <p className="font-mono text-sm text-[var(--ink-dark)] break-all">
                            {hasRecipient ? invoice.recipient : 'Open Invoice'}
                        </p>
                    </div>
                </div>

                {/* Details */}
                <div className="mb-8 space-y-3">
                    <h2 className="text-lg font-serif text-[var(--ink-dark)] mb-3">Details</h2>

                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <span className="text-[var(--ink-light)]">Token</span>
                        <span className="font-mono text-[var(--ink-dark)] text-right break-all">
                            {formatAddress(invoice.token)}
                        </span>

                        <span className="text-[var(--ink-light)]">Amount</span>
                        <span className="font-mono text-[var(--ink-dark)] text-right font-medium">
                            {formatAmount(invoice.totalAmount)}
                        </span>

                        {hasTax && (
                            <>
                                <span className="text-[var(--ink-light)]">Tax</span>
                                <span className="font-mono text-[var(--ink-dark)] text-right">
                                    {invoice.taxBps / 100}%
                                </span>
                            </>
                        )}

                        {hasDeadline && (
                            <>
                                <span className="text-[var(--ink-light)]">Deadline</span>
                                <span className="font-mono text-[var(--ink-dark)] text-right">
                                    Block #{invoice.deadline.toString()}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Memo */}
                {hasMemo && (
                    <div className="mb-8">
                        <h2 className="text-lg font-serif text-[var(--ink-dark)] mb-2">Memo</h2>
                        <div className="p-4 bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded-lg">
                            <p className="text-sm text-[var(--ink-medium)] italic leading-relaxed">
                                {invoice.memo}
                            </p>
                        </div>
                    </div>
                )}

                {/* Line Items */}
                {hasLineItems && (
                    <div className="mb-8">
                        <h2 className="text-lg font-serif text-[var(--ink-dark)] mb-3">Line Items</h2>
                        <div className="border border-[var(--border-paper)] rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[var(--paper-card-dark)]">
                                        <th className="text-left px-4 py-2.5 font-serif font-medium text-[var(--ink-dark)] w-12">
                                            #
                                        </th>
                                        <th className="text-left px-4 py-2.5 font-serif font-medium text-[var(--ink-dark)]">
                                            Description
                                        </th>
                                        <th className="text-right px-4 py-2.5 font-serif font-medium text-[var(--ink-dark)]">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lineItems.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="border-t border-[var(--border-paper)]"
                                        >
                                            <td className="px-4 py-2.5 text-[var(--ink-light)]">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-2.5 text-[var(--ink-dark)]">
                                                {item.description}
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono text-[var(--ink-dark)]">
                                                {formatAmount(item.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Payment Info */}
                {isPaid && (
                    <div className="mb-8 p-4 bg-[var(--paper-bg)] border border-[var(--stamp-green)] rounded-lg">
                        <h2 className="text-lg font-serif text-[var(--stamp-green)] mb-3">
                            Payment Information
                        </h2>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <span className="text-[var(--ink-light)]">Paid by</span>
                            <span className="font-mono text-[var(--ink-dark)] text-right break-all">
                                {formatAddress(invoice.paidBy)}
                            </span>

                            <span className="text-[var(--ink-light)]">Paid at</span>
                            <span className="font-mono text-[var(--ink-dark)] text-right">
                                Block #{invoice.paidAtBlock.toString()}
                            </span>

                            {hasBtcTx && (
                                <>
                                    <span className="text-[var(--ink-light)]">BTC Tx</span>
                                    <span className="font-mono text-[var(--ink-dark)] text-right break-all">
                                        {formatAddress(invoice.btcTxHash)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[var(--border-paper)]">
                    <Link
                        to={`/pay/${id ?? ''}`}
                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-md text-center"
                    >
                        Pay Invoice
                    </Link>
                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-[var(--border-paper)] text-[var(--ink-medium)] font-medium rounded-lg hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors"
                    >
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>
            </PaperCard>
        </div>
    );
}
