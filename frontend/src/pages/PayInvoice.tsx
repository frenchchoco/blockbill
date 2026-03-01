import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { Address } from '@btc-vision/transaction';
import toast from 'react-hot-toast';
import { PaperCard } from '../components/common/PaperCard';
import { StampBadge } from '../components/common/StampBadge';
import { InvoiceStatus } from '../types/invoice';
import type { InvoiceData } from '../types/invoice';
import { useNetwork } from '../hooks/useNetwork';
import { useTokenApproval } from '../hooks/useTokenApproval';
import { contractService } from '../services/ContractService';
import { findToken, formatTokenAmount, formatAddress } from '../config/tokens';

const FEE_BPS = 50n;

type StepStatus = 'waiting' | 'processing' | 'done' | 'error';

export function PayInvoice(): React.JSX.Element {
    const { id } = useParams<{ id: string }>();
    const { walletAddress, address, openConnectModal } = useWalletConnect();
    const { network } = useNetwork();

    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { approve: approveToken } = useTokenApproval();
    const [approveStatus, setApproveStatus] = useState<StepStatus>('waiting');
    const [payStatus, setPayStatus] = useState<StepStatus>('waiting');
    const [txSubmitted, setTxSubmitted] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        const fetchInvoice = async (): Promise<void> => {
            try {
                const contract = contractService.getBlockBillContract(network);
                const result = await contract.getInvoice(BigInt(id));
                if (!result?.properties) { setError('Invoice not found'); return; }
                const p = result.properties;
                setInvoice({
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
                });
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                setError(msg.includes('unreachable') ? 'Invoice not found' : msg);
            } finally {
                setLoading(false);
            }
        };
        void fetchInvoice();
    }, [id, network]);

    const handleApprove = useCallback(async () => {
        if (!walletAddress || !invoice) return;
        setApproveStatus('processing');

        try {
            await approveToken(invoice.token, invoice.totalAmount);
            setApproveStatus('done');
            toast.success('Token approved!');
        } catch (err: unknown) {
            setApproveStatus('error');
            toast.error(err instanceof Error ? err.message : 'Approval failed');
        }
    }, [walletAddress, invoice, approveToken]);

    const handlePay = useCallback(async () => {
        if (!walletAddress || !id) return;
        setPayStatus('processing');

        try {
            const contract = contractService.getBlockBillContract(network, address ?? undefined);

            // Step 1: Simulate
            const simulation = await contract.payInvoice(BigInt(id));

            // Step 2: Check revert
            if (simulation.revert) {
                throw new Error(`Simulation reverted: ${simulation.revert}`);
            }

            // Step 3: Send transaction (wallet handles signing)
            await simulation.sendTransaction({
                signer: null,
                mldsaSigner: null,
                refundTo: walletAddress,
                maximumAllowedSatToSpend: 100_000n,
                network,
            });

            setPayStatus('done');
            setTxSubmitted(true);
            toast.success('Payment submitted!');
        } catch (err: unknown) {
            setPayStatus('error');
            toast.error(err instanceof Error ? err.message : 'Payment failed');
        }
    }, [walletAddress, address, id, network]);

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

    if (invoice.status !== InvoiceStatus.Pending) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <StampBadge status={invoice.status} size="lg" />
                <p className="text-[var(--ink-medium)] mt-4 font-serif text-lg">
                    This invoice is {invoice.status === InvoiceStatus.Paid ? 'already paid' : 'not payable'}.
                </p>
                <Link to={`/invoice/${id}`} className="text-[var(--accent-gold)] hover:underline mt-4 inline-block">View Invoice</Link>
            </div>
        );
    }

    const token = findToken(invoice.token, network);
    const decimals = token?.decimals ?? 8;
    const feeAmount = (invoice.totalAmount * FEE_BPS) / 10000n;
    const creatorReceives = invoice.totalAmount - feeAmount;

    return (
        <div className="max-w-2xl mx-auto">
            <PaperCard className="relative">
                <div className="flex items-start justify-between mb-8 pb-6 border-b border-[var(--border-paper)]">
                    <div>
                        <h1 className="text-3xl font-serif text-[var(--ink-dark)]">Pay Invoice #{id}</h1>
                        <p className="text-sm text-[var(--ink-light)] mt-1">From: {formatAddress(invoice.creator)}</p>
                    </div>
                    <StampBadge status={invoice.status} size="lg" />
                </div>

                {/* Amount Summary */}
                <div className="mb-8 p-5 bg-[var(--paper-bg)] rounded-lg border border-[var(--border-paper)]">
                    <div className="text-center mb-4">
                        <p className="text-xs uppercase tracking-wider text-[var(--ink-light)] mb-1">Amount Due</p>
                        <p className="text-4xl font-mono font-bold text-[var(--ink-dark)]">
                            {formatTokenAmount(invoice.totalAmount, decimals)}
                        </p>
                        <p className="text-sm text-[var(--ink-medium)] mt-1">
                            {token ? `${token.icon} ${token.symbol}` : formatAddress(invoice.token)}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-xs text-[var(--ink-light)] border-t border-[var(--border-paper)] pt-3">
                        <span>Platform fee (0.5%)</span>
                        <span className="text-right font-mono">{formatTokenAmount(feeAmount, decimals)}</span>
                        <span>Creator receives</span>
                        <span className="text-right font-mono">{formatTokenAmount(creatorReceives, decimals)}</span>
                    </div>
                </div>

                {!walletAddress ? (
                    <div className="text-center py-8">
                        <p className="text-[var(--ink-medium)] mb-4">Connect your wallet to pay this invoice.</p>
                        <button type="button" onClick={openConnectModal}
                            className="px-8 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-md">
                            Connect Wallet
                        </button>
                    </div>
                ) : !txSubmitted ? (
                    <div className="space-y-4">
                        <h2 className="text-lg font-serif text-[var(--ink-dark)] mb-3">Payment Steps</h2>

                        {/* Step 1: Approve */}
                        <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                            approveStatus === 'done' ? 'bg-[var(--stamp-green)]/5 border-[var(--stamp-green)]'
                            : approveStatus === 'error' ? 'bg-[var(--stamp-red)]/5 border-[var(--stamp-red)]'
                            : 'bg-[var(--paper-bg)] border-[var(--border-paper)]'
                        }`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                approveStatus === 'done' ? 'bg-[var(--stamp-green)] text-white'
                                : approveStatus === 'processing' ? 'bg-[var(--accent-gold)] text-white animate-pulse'
                                : 'bg-[var(--paper-card-dark)] text-[var(--ink-medium)]'
                            }`}>
                                {approveStatus === 'done' ? '\u2713' : '1'}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-[var(--ink-dark)]">Approve Token Spend</p>
                                <p className="text-xs text-[var(--ink-light)]">Allow BlockBill contract to transfer tokens</p>
                            </div>
                            <button type="button" onClick={() => void handleApprove()}
                                disabled={approveStatus === 'done' || approveStatus === 'processing'}
                                className="px-5 py-2.5 bg-[var(--accent-gold)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-gold-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95">
                                {approveStatus === 'processing' ? 'Approving...' : approveStatus === 'done' ? 'Approved' : approveStatus === 'error' ? 'Retry' : 'Approve'}
                            </button>
                        </div>

                        {/* Step 2: Pay */}
                        <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                            payStatus === 'done' ? 'bg-[var(--stamp-green)]/5 border-[var(--stamp-green)]'
                            : payStatus === 'error' ? 'bg-[var(--stamp-red)]/5 border-[var(--stamp-red)]'
                            : approveStatus !== 'done' ? 'opacity-50 bg-[var(--paper-bg)] border-[var(--border-paper)]'
                            : 'bg-[var(--paper-bg)] border-[var(--border-paper)]'
                        }`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                payStatus === 'done' ? 'bg-[var(--stamp-green)] text-white'
                                : payStatus === 'processing' ? 'bg-[var(--accent-gold)] text-white animate-pulse'
                                : 'bg-[var(--paper-card-dark)] text-[var(--ink-medium)]'
                            }`}>
                                {payStatus === 'done' ? '\u2713' : '2'}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-[var(--ink-dark)]">Pay Invoice</p>
                                <p className="text-xs text-[var(--ink-light)]">Execute payment transaction on Bitcoin L1</p>
                            </div>
                            <button type="button" onClick={() => void handlePay()}
                                disabled={approveStatus !== 'done' || payStatus === 'done' || payStatus === 'processing'}
                                className="px-5 py-2.5 bg-[var(--accent-gold)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-gold-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95">
                                {payStatus === 'processing' ? 'Paying...' : payStatus === 'done' ? 'Paid' : payStatus === 'error' ? 'Retry' : 'Pay'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--stamp-green)] text-white animate-[bounceIn_0.5s]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-serif text-[var(--stamp-green)]">Payment Submitted!</h2>
                        <p className="text-[var(--ink-medium)]">Your payment will be confirmed on Bitcoin L1.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                            <Link to={`/invoice/${id}/receipt`}
                                className="px-6 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-md">
                                View Receipt
                            </Link>
                            <Link to={`/invoice/${id}`}
                                className="px-6 py-3 border-2 border-[var(--border-paper)] text-[var(--ink-medium)] font-medium rounded-lg hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors">
                                Back to Invoice
                            </Link>
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-[var(--border-paper)] text-center">
                    <Link to={`/invoice/${id ?? ''}`} className="text-sm text-[var(--accent-gold)] hover:text-[var(--accent-gold-light)] transition-colors">
                        Back to Invoice
                    </Link>
                </div>
            </PaperCard>
        </div>
    );
}
