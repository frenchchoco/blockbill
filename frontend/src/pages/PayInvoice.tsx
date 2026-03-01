import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { PaperCard } from '../components/common/PaperCard';
import { StampBadge } from '../components/common/StampBadge';
import { InvoiceStatus } from '../types/invoice';
import type { InvoiceData } from '../types/invoice';

// When contract is deployed, the payment flow will be:
// 1. const approveSim = await tokenContract.approve(blockbillAddress, totalAmount);
//    await approveSim.sendTransaction({ signer: null, mldsaSigner: null, refundTo, maximumAllowedSatToSpend: 10000n, network });
// 2. const paySim = await blockbillContract.payInvoice(invoiceId);
//    await paySim.sendTransaction({ signer: null, mldsaSigner: null, refundTo, maximumAllowedSatToSpend: 10000n, network });

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

const FEE_BPS = 50; // 0.5%

type FeeRate = 'economy' | 'normal' | 'fast';

interface FeeOption {
    readonly label: string;
    readonly rate: number;
    readonly unit: string;
}

const FEE_OPTIONS: Record<FeeRate, FeeOption> = {
    economy: { label: 'Economy', rate: 1, unit: 'sat/vB' },
    normal: { label: 'Normal', rate: 5, unit: 'sat/vB' },
    fast: { label: 'Fast', rate: 10, unit: 'sat/vB' },
};

type StepStatus = 'waiting' | 'processing' | 'done';

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

export function PayInvoice(): React.JSX.Element {
    const { id } = useParams<{ id: string }>();
    const { walletAddress, openConnectModal } = useWalletConnect();

    const [feeRate, setFeeRate] = useState<FeeRate>('normal');
    const [approveStatus, setApproveStatus] = useState<StepStatus>('waiting');
    const [payStatus, setPayStatus] = useState<StepStatus>('waiting');
    const [txSubmitted, setTxSubmitted] = useState(false);

    // For now, use mock data regardless of the ID
    const invoice = MOCK_INVOICE;

    const feeAmount = (invoice.totalAmount * BigInt(FEE_BPS)) / 10000n;
    const totalWithFee = invoice.totalAmount + feeAmount;

    const handleApprove = useCallback(() => {
        setApproveStatus('processing');
        console.log('Approving token spend...', {
            token: invoice.token,
            amount: totalWithFee.toString(),
            feeRate: FEE_OPTIONS[feeRate].rate,
        });

        // Simulate async approval
        setTimeout(() => {
            setApproveStatus('done');
            console.log('Token approved.');
        }, 1500);
    }, [invoice.token, totalWithFee, feeRate]);

    const handlePay = useCallback(() => {
        setPayStatus('processing');
        console.log('Paying invoice...', {
            invoiceId: id,
            feeRate: FEE_OPTIONS[feeRate].rate,
        });

        // Simulate async payment
        setTimeout(() => {
            setPayStatus('done');
            setTxSubmitted(true);
            console.log('Transaction submitted.');
        }, 1500);
    }, [id, feeRate]);

    const getStepIcon = (status: StepStatus): string => {
        switch (status) {
            case 'waiting': return '';
            case 'processing': return '...';
            case 'done': return 'Done';
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <PaperCard className="relative">
                {/* Invoice Summary */}
                <div className="flex items-start justify-between mb-8 pb-6 border-b border-[var(--border-paper)]">
                    <div>
                        <h1 className="text-3xl font-serif text-[var(--ink-dark)]">
                            Pay Invoice #{id ?? '?'}
                        </h1>
                        <p className="text-sm text-[var(--ink-light)] mt-1">
                            From: {formatAddress(invoice.creator)}
                        </p>
                    </div>
                    <StampBadge status={invoice.status} size="lg" />
                </div>

                {/* Amount Summary */}
                <div className="mb-8 space-y-3">
                    <h2 className="text-lg font-serif text-[var(--ink-dark)] mb-3">Payment Summary</h2>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <span className="text-[var(--ink-light)]">Amount Due</span>
                        <span className="font-mono text-[var(--ink-dark)] text-right font-medium">
                            {formatAmount(invoice.totalAmount)}
                        </span>

                        <span className="text-[var(--ink-light)]">Token</span>
                        <span className="font-mono text-[var(--ink-dark)] text-right break-all">
                            {formatAddress(invoice.token)}
                        </span>

                        <span className="text-[var(--ink-light)]">Fee (0.5%)</span>
                        <span className="font-mono text-[var(--ink-dark)] text-right">
                            {formatAmount(feeAmount)}
                        </span>

                        <span className="text-[var(--ink-dark)] font-medium border-t border-[var(--border-paper)] pt-2">
                            Total
                        </span>
                        <span className="font-mono text-[var(--ink-dark)] text-right font-bold border-t border-[var(--border-paper)] pt-2">
                            {formatAmount(totalWithFee)}
                        </span>
                    </div>
                </div>

                {/* Wallet Check */}
                {!walletAddress ? (
                    <div className="text-center py-8">
                        <p className="text-[var(--ink-medium)] mb-4">
                            Connect your wallet to pay this invoice.
                        </p>
                        <button
                            type="button"
                            onClick={openConnectModal}
                            className="px-8 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-md"
                        >
                            Connect Wallet
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Fee Selector */}
                        <div className="mb-8">
                            <h2 className="text-lg font-serif text-[var(--ink-dark)] mb-3">
                                BTC Fee Rate
                            </h2>
                            <div className="grid grid-cols-3 gap-3">
                                {(Object.keys(FEE_OPTIONS) as readonly FeeRate[]).map((key) => {
                                    const option = FEE_OPTIONS[key];
                                    const isActive = feeRate === key;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setFeeRate(key)}
                                            disabled={txSubmitted}
                                            className={`py-3 px-4 rounded-lg text-center transition-colors border ${
                                                isActive
                                                    ? 'bg-[var(--accent-gold)] text-white border-[var(--accent-gold)]'
                                                    : 'border-[var(--border-paper)] text-[var(--ink-medium)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <span className="block text-sm font-medium">
                                                {option.label}
                                            </span>
                                            <span className="block text-xs mt-0.5 opacity-75">
                                                {option.rate} {option.unit}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Payment Steps */}
                        {!txSubmitted ? (
                            <div className="space-y-4">
                                <h2 className="text-lg font-serif text-[var(--ink-dark)] mb-3">
                                    Payment Steps
                                </h2>

                                {/* Step 1: Approve */}
                                <div className="flex items-center gap-4 p-4 bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded-lg">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        approveStatus === 'done'
                                            ? 'bg-[var(--stamp-green)] text-white'
                                            : 'bg-[var(--paper-card-dark)] text-[var(--ink-medium)]'
                                    }`}>
                                        {approveStatus === 'done' ? '\u2713' : '1'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[var(--ink-dark)]">
                                            Approve Token
                                        </p>
                                        <p className="text-xs text-[var(--ink-light)]">
                                            Allow BlockBill to spend tokens on your behalf
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {approveStatus !== 'waiting' && (
                                            <span className={`text-xs font-medium ${
                                                approveStatus === 'done'
                                                    ? 'text-[var(--stamp-green)]'
                                                    : 'text-[var(--stamp-orange)]'
                                            }`}>
                                                {getStepIcon(approveStatus)}
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleApprove}
                                            disabled={approveStatus !== 'waiting'}
                                            className="px-4 py-2 bg-[var(--accent-gold)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-gold-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                </div>

                                {/* Step 2: Pay */}
                                <div className="flex items-center gap-4 p-4 bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded-lg">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        payStatus === 'done'
                                            ? 'bg-[var(--stamp-green)] text-white'
                                            : 'bg-[var(--paper-card-dark)] text-[var(--ink-medium)]'
                                    }`}>
                                        {payStatus === 'done' ? '\u2713' : '2'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[var(--ink-dark)]">
                                            Pay Invoice
                                        </p>
                                        <p className="text-xs text-[var(--ink-light)]">
                                            Execute the payment transaction
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {payStatus !== 'waiting' && (
                                            <span className={`text-xs font-medium ${
                                                payStatus === 'done'
                                                    ? 'text-[var(--stamp-green)]'
                                                    : 'text-[var(--stamp-orange)]'
                                            }`}>
                                                {getStepIcon(payStatus)}
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handlePay}
                                            disabled={approveStatus !== 'done' || payStatus !== 'waiting'}
                                            className="px-4 py-2 bg-[var(--accent-gold)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-gold-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Pay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Transaction Result */
                            <div className="text-center py-8 space-y-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--stamp-green)] text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-serif text-[var(--stamp-green)]">
                                    Transaction Submitted
                                </h2>
                                <p className="text-[var(--ink-medium)]">
                                    Your payment has been submitted and will be confirmed on Bitcoin L1.
                                </p>
                                <Link
                                    to={`/invoice/${id ?? ''}/receipt`}
                                    className="inline-flex items-center px-6 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-md"
                                >
                                    View Receipt
                                </Link>
                            </div>
                        )}
                    </>
                )}

                {/* Back Link */}
                <div className="mt-8 pt-6 border-t border-[var(--border-paper)] text-center">
                    <Link
                        to={`/invoice/${id ?? ''}`}
                        className="text-sm text-[var(--accent-gold)] hover:text-[var(--accent-gold-light)] transition-colors"
                    >
                        Back to Invoice
                    </Link>
                </div>
            </PaperCard>
        </div>
    );
}
