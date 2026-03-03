import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';
import toast from 'react-hot-toast';
import { PaperCard } from '../components/common/PaperCard';
import { StampBadge } from '../components/common/StampBadge';
import { InvoiceStatus, isInvoiceExpired } from '../types/invoice';
import type { InvoiceData } from '../types/invoice';
import { useNetwork } from '../hooks/useNetwork';
import { useBlockNumber } from '../hooks/useBlockNumber';
import { useTokenApproval } from '../hooks/useTokenApproval';
import { contractService } from '../services/ContractService';
import { findToken, formatTokenAmount, formatAddress } from '../config/tokens';
import { friendlyError } from '../utils/errors';
import { parseInvoiceProperties } from '../utils/invoice';
import { getTxGasParams } from '../config/networks';
import { netFromGross, calculateFee, FEE_PERCENT } from '../utils/fee';
const APPROVAL_KEY_PREFIX = 'bb_approve_';

type StepStatus = 'waiting' | 'processing' | 'broadcast' | 'done' | 'error';

export function PayInvoice(): React.JSX.Element {
    const { id } = useParams<{ id: string }>();
    const { walletAddress, address, openConnectModal } = useWalletConnect();
    const { network } = useNetwork();
    const currentBlock = useBlockNumber();

    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { approve: approveToken, checkAllowance } = useTokenApproval();
    const [approveStatus, setApproveStatus] = useState<StepStatus>('waiting');
    const [payStatus, setPayStatus] = useState<StepStatus>('waiting');
    const [onChainDecimals, setOnChainDecimals] = useState<number | null>(null);
    const [unlimitedApproval, setUnlimitedApproval] = useState(false);
    const payingRef = useRef(false);

    // Reset payingRef on unmount to prevent stale lock
    useEffect(() => {
        return () => { payingRef.current = false; };
    }, []);

    useEffect(() => {
        if (!id || !/^\d+$/.test(id)) { setError('Invalid invoice ID'); setLoading(false); return; }
        setLoading(true);
        const fetchInvoice = async (): Promise<void> => {
            try {
                const contract = contractService.getBlockBillContract(network);
                const result = await contract.getInvoice(BigInt(id));
                if (!result?.properties) { setError('Invoice not found'); return; }
                setInvoice(parseInvoiceProperties(BigInt(id), result.properties));
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

    // Check allowance on load and poll every 30s after broadcast
    useEffect(() => {
        if (!invoice || !address) return;
        if (approveStatus === 'done' || approveStatus === 'processing') return;

        const storageKey = `${APPROVAL_KEY_PREFIX}${invoice.token}_${id}`;
        let cancelled = false;

        const check = async (): Promise<void> => {
            try {
                const allowance = await checkAllowance(invoice.token);
                if (!cancelled && allowance >= invoice.totalAmount) {
                    setApproveStatus('done');
                    localStorage.removeItem(storageKey);
                }
            } catch {
                // allowance check failed
            }
        };

        // Restore broadcast state from localStorage (survives page refresh)
        if (approveStatus === 'waiting') {
            const stored = localStorage.getItem(storageKey);
            if (stored && Date.now() - parseInt(stored, 10) < 30 * 60 * 1000) {
                setApproveStatus('broadcast');
                // Still run check() — approval may have already confirmed on-chain
                void check();
                return () => { cancelled = true; };
            }
            if (stored) localStorage.removeItem(storageKey);
        }

        void check();

        // Poll every 30s while waiting for broadcast confirmation
        if (approveStatus === 'broadcast') {
            const interval = setInterval(() => void check(), 30_000);
            return () => { cancelled = true; clearInterval(interval); };
        }

        return () => { cancelled = true; };
    }, [invoice, address, checkAllowance, approveStatus]);

    const handleApprove = useCallback(async () => {
        if (!walletAddress || !invoice) return;
        setApproveStatus('processing');

        try {
            await approveToken(invoice.token, unlimitedApproval ? undefined : invoice.totalAmount);

            toast.dismiss('approve-confirm');
            setApproveStatus('broadcast');
            localStorage.setItem(`${APPROVAL_KEY_PREFIX}${invoice.token}_${id}`, Date.now().toString());
            toast.success('Approval broadcast — waiting for block confirmation');
        } catch (err: unknown) {
            toast.dismiss('approve-confirm');
            setApproveStatus('error');
            toast.error(friendlyError(err instanceof Error ? err.message : 'Approval failed'));
        }
    }, [walletAddress, invoice, approveToken, unlimitedApproval]);

    const handlePay = useCallback(async () => {
        if (!walletAddress || !id || payingRef.current) return;
        payingRef.current = true;
        setPayStatus('processing');

        try {
            const contract = contractService.getBlockBillContract(network, address ?? undefined);

            // Step 1: Simulate
            const simulation = await contract.payInvoice(BigInt(id));

            // Step 2: Check revert
            if (simulation.revert) {
                throw new Error(friendlyError(simulation.revert));
            }

            // Step 3: Send transaction (wallet handles signing)
            await simulation.sendTransaction({
                signer: null,
                mldsaSigner: null,
                refundTo: walletAddress,
                ...getTxGasParams(network),
                network,
            });

            setPayStatus('done');
        } catch (err: unknown) {
            payingRef.current = false;
            setPayStatus('error');
            toast.error(friendlyError(err instanceof Error ? err.message : 'Payment failed'));
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

    const expired = currentBlock > 0n && isInvoiceExpired(invoice, currentBlock);

    if (invoice.status !== InvoiceStatus.Pending || expired) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <StampBadge status={invoice.status} size="lg" expired={expired} />
                <p className="text-[var(--ink-medium)] mt-4 font-serif text-lg">
                    {expired ? 'This invoice has expired and can no longer be paid.'
                        : invoice.status === InvoiceStatus.Paid ? 'This invoice is already paid.'
                        : 'This invoice is not payable.'}
                </p>
                <Link to={`/invoice/${id}`} className="text-[var(--accent-gold)] hover:underline mt-4 inline-block">View Invoice</Link>
            </div>
        );
    }

    // Check if the connected wallet is the invoice creator
    const normalizeHex = (h: string): string => h.replace(/^(0x)+/i, '').toLowerCase();
    const walletHex = address ? normalizeHex(address.toHex()) : '';
    const isCreator = walletHex !== '' && normalizeHex(invoice.creator) === walletHex;

    if (isCreator) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <PaperCard>
                    <p className="text-lg text-[var(--ink-medium)] font-serif mb-4">You cannot pay your own invoice.</p>
                    <Link to={`/invoice/${id}`} className="text-[var(--accent-gold)] hover:underline">View Invoice</Link>
                </PaperCard>
            </div>
        );
    }

    const token = findToken(invoice.token, network);
    const decimals = onChainDecimals ?? token?.decimals ?? 8;
    // invoice.totalAmount is the gross (includes fee). Creator receives net.
    const feeAmount = calculateFee(invoice.totalAmount);
    const creatorReceives = netFromGross(invoice.totalAmount);

    // Payment was broadcast — show success with navigation options
    if (payStatus === 'done') {
        return (
            <div className="max-w-2xl mx-auto">
                <PaperCard className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--stamp-green)]/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[var(--stamp-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-serif text-[var(--ink-dark)] mb-2">Payment Broadcast</h2>
                    <p className="text-sm text-[var(--ink-medium)] mb-1">
                        Your transaction has been sent to the network.
                    </p>
                    <p className="text-sm text-[var(--ink-light)] mb-8">
                        The invoice status will update to <strong>PAID</strong> once the block is mined (~10 min).
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to={`/invoice/${id}`}
                            className="inline-flex items-center justify-center px-6 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-md">
                            Track Invoice Status
                        </Link>
                        <Link to="/dashboard"
                            className="inline-flex items-center justify-center px-6 py-3 border-2 border-[var(--border-paper)] text-[var(--ink-medium)] font-medium rounded-lg hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors">
                            Back to Dashboard
                        </Link>
                    </div>
                </PaperCard>
            </div>
        );
    }

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
                        <span>Creator receives</span>
                        <span className="text-right font-mono font-medium text-[var(--ink-dark)]">{formatTokenAmount(creatorReceives, decimals)}</span>
                        <span>Platform fee ({FEE_PERCENT})</span>
                        <span className="text-right font-mono">{formatTokenAmount(feeAmount, decimals)}</span>
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
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-lg font-serif text-[var(--ink-dark)] mb-3">Payment Steps</h2>

                        {/* Step 1: Approve */}
                        <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                            approveStatus === 'done' ? 'bg-[var(--stamp-green)]/5 border-[var(--stamp-green)]'
                            : approveStatus === 'broadcast' ? 'bg-[var(--accent-gold)]/5 border-[var(--accent-gold)]'
                            : approveStatus === 'error' ? 'bg-[var(--stamp-red)]/5 border-[var(--stamp-red)]'
                            : 'bg-[var(--paper-bg)] border-[var(--border-paper)]'
                        }`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                approveStatus === 'done' ? 'bg-[var(--stamp-green)] text-white'
                                : approveStatus === 'processing' || approveStatus === 'broadcast' ? 'bg-[var(--accent-gold)] text-white animate-pulse'
                                : 'bg-[var(--paper-card-dark)] text-[var(--ink-medium)]'
                            }`}>
                                {approveStatus === 'done' ? '\u2713' : '1'}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-[var(--ink-dark)]">Approve Token Spend</p>
                                <p className="text-xs text-[var(--ink-light)]">
                                    {approveStatus === 'done' ? 'Allowance confirmed on-chain'
                                        : approveStatus === 'broadcast' ? 'Waiting for block confirmation (~10 min)...'
                                        : 'Allow BlockBill contract to transfer tokens'}
                                </p>
                                {approveStatus !== 'done' && approveStatus !== 'broadcast' && (
                                    <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                                        <input type="checkbox" checked={unlimitedApproval}
                                            onChange={(e) => setUnlimitedApproval(e.target.checked)}
                                            className="w-3.5 h-3.5 accent-[var(--accent-gold)] cursor-pointer" />
                                        <span className="text-xs text-[var(--ink-light)]">Unlimited approval</span>
                                    </label>
                                )}
                            </div>
                            <button type="button" onClick={() => void handleApprove()}
                                disabled={approveStatus === 'done' || approveStatus === 'processing' || approveStatus === 'broadcast'}
                                className="px-5 py-2.5 bg-[var(--accent-gold)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-gold-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95">
                                {approveStatus === 'processing' ? 'Sending...'
                                    : approveStatus === 'broadcast' ? 'Pending...'
                                    : approveStatus === 'done' ? 'Approved' : approveStatus === 'error' ? 'Retry' : 'Approve'}
                            </button>
                        </div>

                        {/* Step 2: Pay */}
                        <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                            payStatus === 'error' ? 'bg-[var(--stamp-red)]/5 border-[var(--stamp-red)]'
                            : approveStatus !== 'done' ? 'opacity-50 bg-[var(--paper-bg)] border-[var(--border-paper)]'
                            : 'bg-[var(--paper-bg)] border-[var(--border-paper)]'
                        }`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                payStatus === 'processing' ? 'bg-[var(--accent-gold)] text-white animate-pulse'
                                : 'bg-[var(--paper-card-dark)] text-[var(--ink-medium)]'
                            }`}>
                                2
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-[var(--ink-dark)]">Pay Invoice</p>
                                <p className="text-xs text-[var(--ink-light)]">Execute payment transaction on Bitcoin L1</p>
                            </div>
                            <button type="button" onClick={() => void handlePay()}
                                disabled={approveStatus !== 'done' || payStatus === 'processing'}
                                className="px-5 py-2.5 bg-[var(--accent-gold)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-gold-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95">
                                {payStatus === 'processing' ? 'Paying...' : payStatus === 'error' ? 'Retry' : 'Pay'}
                            </button>
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
