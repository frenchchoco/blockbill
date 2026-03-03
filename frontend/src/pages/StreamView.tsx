import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import { PaperCard } from '../components/common/PaperCard';
import { StreamStatus, getStreamStatusLabel, getStreamStampClass, isStreamExhausted } from '../types/stream';
import type { StreamData } from '../types/stream';
import { useNetwork } from '../hooks/useNetwork';
import { useAddressValidation } from '../hooks/useAddressValidation';
import { contractService } from '../services/ContractService';
import { findToken, formatTokenAmount, formatAddress } from '../config/tokens';
import { friendlyError } from '../utils/errors';
import { getTxGasParams } from '../config/networks';
import { getMemoFromHash, decryptMemo, encryptMemo, buildMemoUrl } from '../utils/streamMemo';
import { getStreamDrafts } from '../utils/streamDrafts';
import { setPendingAction } from '../utils/streamPendingActions';
import { setStreamReason, getStreamReason } from '../utils/streamReasons';
import { parseStreamProperties, normalizeHex } from '../utils/streamParser';
import type { RawStreamProperties } from '../utils/streamParser';

const BLOCKS_PER_DAY = 144;

export function StreamView(): React.JSX.Element {
    const { id } = useParams<{ id: string }>();
    const { network } = useNetwork();
    const { walletAddress, address } = useWalletConnect();
    const [stream, setStream] = useState<StreamData | null>(null);
    const [withdrawable, setWithdrawable] = useState<bigint>(0n);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [onChainDecimals, setOnChainDecimals] = useState<number | null>(null);

    // Action states
    const [withdrawing, setWithdrawing] = useState(false);
    const [showWithdrawTo, setShowWithdrawTo] = useState(false);
    const [withdrawToAddr, setWithdrawToAddr] = useState('');
    const [topping, setTopping] = useState(false);
    const [showTopUp, setShowTopUp] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [topUpApproving, setTopUpApproving] = useState(false);
    const [topUpApproved, setTopUpApproved] = useState(false);
    const [topUpCheckingAllowance, setTopUpCheckingAllowance] = useState(false);
    const [pausing, setPausing] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showPauseConfirm, setShowPauseConfirm] = useState(false);
    const [pauseReason, setPauseReason] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    /** Stored reason loaded from localStorage. */
    const [storedReason, setStoredReason] = useState<string | null>(null);
    /** Non-null when a tx has been broadcast and is awaiting block confirmation. */
    const [pendingTx, setPendingTx] = useState<string | null>(null);
    /** Decrypted memo (from URL hash or localStorage draft). */
    const [memo, setMemo] = useState<string | null>(null);
    /** Whether the URL hash contains an encrypted memo (captured once at mount). */
    const hasHashMemo = useMemo(() => getMemoFromHash() !== null, []);

    const withdrawToValidation = useAddressValidation(withdrawToAddr, network);

    /** Set pendingTx with a 2-minute auto-clear timeout as safety valve. */
    const startPendingTx = useCallback((msg: string) => {
        setPendingTx(msg);
        if (pendingTxTimerRef.current) clearTimeout(pendingTxTimerRef.current);
        pendingTxTimerRef.current = setTimeout(() => setPendingTx(null), 120_000);
    }, []);

    // Cleanup pending-tx timer on unmount to avoid state updates on unmounted component
    useEffect(() => {
        return () => {
            if (pendingTxTimerRef.current) clearTimeout(pendingTxTimerRef.current);
        };
    }, []);

    const fetchStream = useCallback(async (showLoading = true): Promise<void> => {
        if (!id || !/^\d+$/.test(id)) { setError('Invalid stream ID'); setLoading(false); return; }
        if (showLoading) { setLoading(true); setError(''); }

        try {
            const contract = contractService.getStreamContract(network);
            const [streamResult, withdrawableResult] = await Promise.all([
                contract.getStream(BigInt(id)),
                contract.getWithdrawable(BigInt(id)),
            ]);

            if (!streamResult?.properties) { setError('Stream not found'); return; }

            const s = parseStreamProperties(Number(id), streamResult.properties as RawStreamProperties);
            setStream(s);
            setWithdrawable(withdrawableResult?.properties?.withdrawable ?? 0n);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg.includes('unreachable') ? 'Stream not found' : msg);
        } finally {
            setLoading(false);
        }
    }, [id, network]);

    useEffect(() => { void fetchStream(); }, [fetchStream]);

    // Poll stream data periodically.
    // - Every 10s: update withdrawable (for active streams)
    // - Every 30s: full re-fetch (detects status changes after tx confirms)
    useEffect(() => {
        if (!stream) return;
        let tick = 0;
        const interval = setInterval(async () => {
            tick++;
            try {
                // Full refresh every 3rd tick (30s) to pick up status changes
                if (tick % 3 === 0) {
                    await fetchStream(false);
                } else if (stream.status === StreamStatus.Active) {
                    const contract = contractService.getStreamContract(network);
                    const result = await contract.getWithdrawable(BigInt(stream.id));
                    if (result?.properties?.withdrawable !== undefined) {
                        setWithdrawable(result.properties.withdrawable);
                    }
                }
            } catch {
                // ignore polling errors
            }
        }, 10_000);
        return () => clearInterval(interval);
    }, [stream?.id, stream?.status, network, fetchStream]);

    // Clear pendingTx when stream data changes (status, amounts) or after 2-min timeout
    const prevStreamSnapshotRef = useRef<string | undefined>(undefined);
    const pendingTxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!stream) return;
        const snapshot = `${stream.status}:${stream.totalDeposited}:${stream.totalWithdrawn}`;
        if (prevStreamSnapshotRef.current !== undefined && prevStreamSnapshotRef.current !== snapshot) {
            setPendingTx(null);
            if (pendingTxTimerRef.current) { clearTimeout(pendingTxTimerRef.current); pendingTxTimerRef.current = null; }
        }
        prevStreamSnapshotRef.current = snapshot;
    }, [stream?.status, stream?.totalDeposited, stream?.totalWithdrawn]);

    // Resolve memo: try URL hash first (shared link), then localStorage draft
    useEffect(() => {
        if (!stream) return;
        let cancelled = false;

        const resolve = async (): Promise<void> => {
            // 1. Try encrypted memo from URL hash
            const hashMemo = getMemoFromHash();
            if (hashMemo) {
                const plain = await decryptMemo(hashMemo, stream.sender, stream.recipient);
                if (!cancelled && plain) { setMemo(plain); return; }
            }
            // 2. Fallback: check localStorage drafts (sender only)
            const drafts = getStreamDrafts();
            const match = drafts.find((d) =>
                d.memo && d.tokenAddress &&
                normalizeHex(d.tokenAddress) === normalizeHex(stream.token) &&
                d.recipient && normalizeHex(d.recipient) === normalizeHex(stream.recipient) &&
                (!d.senderAddress || normalizeHex(d.senderAddress) === normalizeHex(stream.sender)),
            );
            if (!cancelled && match?.memo) { setMemo(match.memo); }
        };

        void resolve();
        return () => { cancelled = true; };
    }, [stream?.id, stream?.sender, stream?.recipient, stream?.token]);

    // Fetch on-chain decimals
    useEffect(() => {
        if (!stream?.token) return;
        let cancelled = false;
        const fetchDec = async (): Promise<void> => {
            try {
                const tokenContract = contractService.getTokenContract(stream.token, network);
                const metadata = await tokenContract.metadata();
                if (!cancelled && metadata?.properties?.decimals != null) {
                    setOnChainDecimals(metadata.properties.decimals);
                }
            } catch { /* fallback to config decimals */ }
        };
        void fetchDec();
        return () => { cancelled = true; };
    }, [stream?.token, network]);

    // Load stored reason for paused/cancelled streams
    useEffect(() => {
        if (!stream) return;
        if (stream.status === StreamStatus.Paused || stream.status === StreamStatus.Cancelled) {
            const action = stream.status === StreamStatus.Cancelled ? 'cancel' : 'pause';
            const r = getStreamReason(stream.id, action);
            setStoredReason(r?.reason ?? null);
        } else {
            setStoredReason(null);
        }
    }, [stream?.id, stream?.status]);

    // QR code
    useEffect(() => {
        const url = window.location.href;
        QRCode.toDataURL(url, { width: 160, margin: 2, color: { dark: '#3E2723', light: '#FFFEF7' } })
            .then(setQrDataUrl).catch(() => {});
    }, [id]);

    const token = stream ? findToken(stream.token, network) : undefined;
    const decimals = onChainDecimals ?? token?.decimals ?? 8;

    const walletHex = address ? normalizeHex(address.toHex()) : '';
    const isSender = stream ? walletHex !== '' && normalizeHex(stream.sender) === walletHex : false;
    const isRecipient = stream ? walletHex !== '' && normalizeHex(stream.recipient) === walletHex : false;

    // Computed metrics (guard against BigInt underflow from stale RPC snapshots)
    const streamed = stream ? stream.totalWithdrawn + withdrawable : 0n;
    const remaining = stream
        ? (stream.totalDeposited > streamed ? stream.totalDeposited - streamed : 0n)
        : 0n;
    const progressPercent = stream && stream.totalDeposited > 0n
        ? Number((streamed * 10000n) / stream.totalDeposited) / 100
        : 0;

    const ratePerDay = stream ? stream.ratePerBlock * BigInt(BLOCKS_PER_DAY) : 0n;

    // --- Action handlers ---

    const handleWithdraw = useCallback(async () => {
        if (!address || !id || withdrawing || pendingTx) return;
        setWithdrawing(true);
        try {
            const contract = contractService.getStreamContract(network, address);
            const simulation = await contract.withdraw(BigInt(id));
            if (simulation.revert) throw new Error(friendlyError(simulation.revert));
            await simulation.sendTransaction({ signer: null, mldsaSigner: null, refundTo: walletAddress!, ...getTxGasParams(network), network });
            toast.success('Withdrawal broadcast! Will confirm in ~10 min.');
            setPendingAction(Number(id), 'withdraw');
            startPendingTx('Withdrawal pending confirmation…');
            void fetchStream(false);
        } catch (err: unknown) {
            toast.error(friendlyError(err instanceof Error ? err.message : String(err)));
        } finally {
            setWithdrawing(false);
        }
    }, [address, walletAddress, id, withdrawing, pendingTx, startPendingTx, network, fetchStream]);

    const handleWithdrawTo = useCallback(async () => {
        if (!address || !id || withdrawing || pendingTx || !withdrawToAddr || !withdrawToValidation.isValid) return;
        setWithdrawing(true);
        try {
            const toAddr = await contractService.resolveAddress(withdrawToAddr, network, false);
            const contract = contractService.getStreamContract(network, address);
            const simulation = await contract.withdrawTo(BigInt(id), toAddr);
            if (simulation.revert) throw new Error(friendlyError(simulation.revert));
            await simulation.sendTransaction({ signer: null, mldsaSigner: null, refundTo: walletAddress!, ...getTxGasParams(network), network });
            toast.success('WithdrawTo broadcast! Will confirm in ~10 min.');
            setPendingAction(Number(id), 'withdraw');
            startPendingTx('WithdrawTo pending confirmation…');
            setShowWithdrawTo(false);
            setWithdrawToAddr('');
            void fetchStream(false);
        } catch (err: unknown) {
            toast.error(friendlyError(err instanceof Error ? err.message : String(err)));
        } finally {
            setWithdrawing(false);
        }
    }, [address, walletAddress, id, withdrawing, pendingTx, startPendingTx, withdrawToAddr, withdrawToValidation, network, fetchStream]);

    // Check existing allowance when opening Top Up panel
    const handleOpenTopUp = useCallback(async () => {
        setShowTopUp(true);
        setTopUpApproved(false);
        if (!address || !stream) return;
        setTopUpCheckingAllowance(true);
        try {
            const { Address: AddrClass } = await import('@btc-vision/transaction');
            const { getBlockBillStreamAddress } = await import('../config/contracts');
            const streamContractAddr = getBlockBillStreamAddress(network);
            const tokenContract = contractService.getTokenContract(stream.token, network);
            const spender = AddrClass.fromString(streamContractAddr);
            const result = await tokenContract.allowance(address, spender);
            const currentAllowance = result?.properties?.remaining ?? 0n;
            // Only skip approve if allowance is very large (indicates unlimited approval).
            // A small residual allowance (e.g. 1n) is NOT enough to cover an arbitrary top-up.
            const UNLIMITED_THRESHOLD = 10n ** 18n; // 10^18 raw units
            if (currentAllowance >= UNLIMITED_THRESHOLD) {
                setTopUpApproved(true);
            }
        } catch {
            // If check fails, show approve step as fallback
        } finally {
            setTopUpCheckingAllowance(false);
        }
    }, [address, stream, network]);

    const handleTopUpApprove = useCallback(async () => {
        if (!address || !stream || !topUpAmount) return;
        setTopUpApproving(true);
        try {
            const { Address: AddrClass } = await import('@btc-vision/transaction');
            const { getBlockBillStreamAddress } = await import('../config/contracts');
            const parsedAmt = (await import('../config/tokens')).parseTokenAmount(topUpAmount, decimals);
            const streamContractAddr = getBlockBillStreamAddress(network);
            const tokenContract = contractService.getTokenContract(stream.token, network, address);
            const spender = AddrClass.fromString(streamContractAddr);
            const simulation = await tokenContract.increaseAllowance(spender, parsedAmt);
            if (simulation.revert) throw new Error(friendlyError(simulation.revert));
            await simulation.sendTransaction({ signer: null, mldsaSigner: null, refundTo: walletAddress!, ...getTxGasParams(network), network });
            toast.success('Token approved for top-up!');
            setTopUpApproved(true);
        } catch (err: unknown) {
            toast.error(friendlyError(err instanceof Error ? err.message : String(err)));
        } finally {
            setTopUpApproving(false);
        }
    }, [address, walletAddress, stream, topUpAmount, decimals, network]);

    const handleTopUp = useCallback(async () => {
        if (!address || !id || topping || pendingTx || !topUpAmount) return;
        setTopping(true);
        try {
            const { parseTokenAmount: parseAmt } = await import('../config/tokens');
            const parsedAmt = parseAmt(topUpAmount, decimals);
            const contract = contractService.getStreamContract(network, address);
            const simulation = await contract.topUp(BigInt(id), parsedAmt);
            if (simulation.revert) throw new Error(friendlyError(simulation.revert));
            await simulation.sendTransaction({ signer: null, mldsaSigner: null, refundTo: walletAddress!, ...getTxGasParams(network), network });
            toast.success('Top-up broadcast! Will confirm in ~10 min.');
            setPendingAction(Number(id), 'topUp');
            startPendingTx('Top-up pending confirmation…');
            setShowTopUp(false);
            setTopUpAmount('');
            setTopUpApproved(false);
            void fetchStream(false);
        } catch (err: unknown) {
            toast.error(friendlyError(err instanceof Error ? err.message : String(err)));
        } finally {
            setTopping(false);
        }
    }, [address, walletAddress, id, topping, pendingTx, startPendingTx, topUpAmount, decimals, network, fetchStream]);

    const handlePauseResume = useCallback(async (reason?: string) => {
        if (!address || !id || pausing || pendingTx || !stream) return;
        setPausing(true);
        const isPaused = stream.status === StreamStatus.Paused;
        try {
            const contract = contractService.getStreamContract(network, address);
            const simulation = isPaused
                ? await contract.resumeStream(BigInt(id))
                : await contract.pauseStream(BigInt(id));
            if (simulation.revert) throw new Error(friendlyError(simulation.revert));
            await simulation.sendTransaction({ signer: null, mldsaSigner: null, refundTo: walletAddress!, ...getTxGasParams(network), network });
            toast.success(`Stream ${isPaused ? 'resume' : 'pause'} broadcast!`);
            setPendingAction(Number(id), isPaused ? 'resume' : 'pause');
            if (!isPaused && reason?.trim()) setStreamReason(Number(id), 'pause', reason);
            startPendingTx(`${isPaused ? 'Resume' : 'Pause'} pending confirmation…`);
            setShowPauseConfirm(false);
            setPauseReason('');
            void fetchStream(false);
        } catch (err: unknown) {
            toast.error(friendlyError(err instanceof Error ? err.message : String(err)));
        } finally {
            setPausing(false);
        }
    }, [address, walletAddress, id, pausing, pendingTx, startPendingTx, stream, network, fetchStream]);

    const handleCancel = useCallback(async (reason?: string) => {
        if (!address || !id || cancelling || pendingTx) return;
        setCancelling(true);
        try {
            const contract = contractService.getStreamContract(network, address);
            const simulation = await contract.cancelStream(BigInt(id));
            if (simulation.revert) throw new Error(friendlyError(simulation.revert));
            await simulation.sendTransaction({ signer: null, mldsaSigner: null, refundTo: walletAddress!, ...getTxGasParams(network), network });
            toast.success('Cancellation broadcast! Will confirm in ~10 min.');
            setPendingAction(Number(id), 'cancel');
            if (reason?.trim()) setStreamReason(Number(id), 'cancel', reason);
            startPendingTx('Cancellation pending confirmation…');
            setShowCancelConfirm(false);
            setCancelReason('');
            void fetchStream(false);
        } catch (err: unknown) {
            toast.error(friendlyError(err instanceof Error ? err.message : String(err)));
        } finally {
            setCancelling(false);
        }
    }, [address, walletAddress, id, cancelling, pendingTx, startPendingTx, network, fetchStream]);

    /** Anyone can call withdraw() to route funds to the stored recipient. */
    const handleClaimForRecipient = useCallback(async () => {
        if (!address || !id || withdrawing || pendingTx || !stream) return;
        setWithdrawing(true);
        try {
            const contract = contractService.getStreamContract(network, address);
            // withdraw() has no caller restriction — funds always go to the on-chain recipient.
            const simulation = await contract.withdraw(BigInt(id));
            if (simulation.revert) throw new Error(friendlyError(simulation.revert));
            await simulation.sendTransaction({ signer: null, mldsaSigner: null, refundTo: walletAddress!, ...getTxGasParams(network), network });
            toast.success('Claim for recipient broadcast!');
            setPendingAction(Number(id), 'withdraw');
            startPendingTx('Claim pending confirmation…');
            void fetchStream(false);
        } catch (err: unknown) {
            toast.error(friendlyError(err instanceof Error ? err.message : String(err)));
        } finally {
            setWithdrawing(false);
        }
    }, [address, walletAddress, id, withdrawing, pendingTx, startPendingTx, stream, network, fetchStream]);

    const handleCopyLink = useCallback(async () => {
        try {
            let url = window.location.origin + window.location.pathname;
            // Include encrypted memo in share link if available
            if (memo && stream) {
                try {
                    const encrypted = await encryptMemo(memo, stream.sender, stream.recipient);
                    url = buildMemoUrl(url, encrypted);
                } catch { /* fallback to plain URL */ }
            }
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy link');
        }
    }, [memo, stream]);

    const inputCls = 'w-full px-4 py-2.5 bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded-lg text-[var(--ink-dark)] placeholder:text-[var(--ink-light)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors';

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <div className="inline-block w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
                <p className="text-[var(--ink-light)] mt-4 font-serif">Loading stream...</p>
            </div>
        );
    }

    if (error || !stream) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <p className="text-[var(--stamp-red)] text-lg font-serif">{error || 'Stream not found'}</p>
                <Link to="/dashboard?tab=streams" className="text-[var(--accent-gold)] hover:underline mt-4 inline-block">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <PaperCard className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-8 pb-6 border-b border-[var(--border-paper)]">
                    <div>
                        <h1 className="text-3xl font-serif text-[var(--ink-dark)]">STREAM #{id}</h1>
                        <p className="text-sm text-[var(--ink-light)] mt-1">Started at Block #{stream.startBlock.toString()}</p>
                    </div>
                    <span className={getStreamStampClass(stream.status, isStreamExhausted(stream))}>
                        {getStreamStatusLabel(stream.status, isStreamExhausted(stream))}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs text-[var(--ink-light)] mb-1.5">
                        <span>Streamed</span>
                        <span className="font-mono">{progressPercent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-4 bg-[var(--paper-bg)] rounded-full border border-[var(--border-paper)] overflow-hidden">
                        <div
                            className="stream-progress-bar h-full"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    <div className="p-3 bg-[var(--paper-bg)] rounded-lg border border-[var(--border-paper)]">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--ink-light)] font-medium mb-1">Total Deposited</p>
                        <p className="font-mono text-sm font-medium text-[var(--ink-dark)]">
                            {formatTokenAmount(stream.totalDeposited, decimals)}
                        </p>
                    </div>
                    <div className="p-3 bg-[var(--paper-bg)] rounded-lg border border-[var(--border-paper)]">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--ink-light)] font-medium mb-1">Streamed So Far</p>
                        <p className="font-mono text-sm font-medium text-[var(--ink-dark)]">
                            {formatTokenAmount(streamed, decimals)}
                        </p>
                    </div>
                    <div className="p-3 bg-[var(--paper-bg)] rounded-lg border border-[var(--border-paper)]">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--ink-light)] font-medium mb-1">Already Withdrawn</p>
                        <p className="font-mono text-sm font-medium text-[var(--ink-dark)]">
                            {formatTokenAmount(stream.totalWithdrawn, decimals)}
                        </p>
                    </div>
                    <div className="p-3 bg-[var(--accent-gold)]/5 rounded-lg border border-[var(--accent-gold)]/30">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--accent-gold)] font-medium mb-1">Currently Claimable</p>
                        <p className="font-mono text-sm font-bold text-[var(--accent-gold)] stream-claimable-pulse">
                            {formatTokenAmount(withdrawable, decimals)}
                        </p>
                    </div>
                    <div className="p-3 bg-[var(--paper-bg)] rounded-lg border border-[var(--border-paper)]">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--ink-light)] font-medium mb-1">Remaining</p>
                        <p className="font-mono text-sm font-medium text-[var(--ink-dark)]">
                            {formatTokenAmount(remaining > 0n ? remaining : 0n, decimals)}
                        </p>
                    </div>
                    <div className="p-3 bg-[var(--paper-bg)] rounded-lg border border-[var(--border-paper)]">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--ink-light)] font-medium mb-1">Rate</p>
                        <p className="font-mono text-xs font-medium text-[var(--ink-dark)]">
                            {formatTokenAmount(stream.ratePerBlock, decimals)}/block
                        </p>
                        <p className="font-mono text-[10px] text-[var(--ink-light)] mt-0.5">
                            ≈ {formatTokenAmount(ratePerDay, decimals)}/day
                        </p>
                    </div>
                </div>

                {/* Token and Counterparty Info */}
                <div className="mb-8 space-y-3">
                    <h2 className="text-lg font-serif text-[var(--ink-dark)] mb-3">Details</h2>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <span className="text-[var(--ink-light)]">Token</span>
                        <span className="font-mono text-[var(--ink-dark)] text-right">
                            {token ? `${token.icon} ${token.symbol}` : formatAddress(stream.token)}
                        </span>
                        <span className="text-[var(--ink-light)]">Sender</span>
                        <span className="font-mono text-xs text-[var(--ink-dark)] text-right break-all">
                            {formatAddress(stream.sender)}
                            {isSender && <span className="ml-1 text-[10px] text-[var(--accent-gold)]">(you)</span>}
                        </span>
                        <span className="text-[var(--ink-light)]">Recipient</span>
                        <span className="font-mono text-xs text-[var(--ink-dark)] text-right break-all">
                            {formatAddress(stream.recipient)}
                            {isRecipient && <span className="ml-1 text-[10px] text-[var(--accent-gold)]">(you)</span>}
                        </span>
                        <span className="text-[var(--ink-light)]">Start Block</span>
                        <span className="font-mono text-xs text-[var(--ink-dark)] text-right">#{stream.startBlock.toString()}</span>
                        <span className="text-[var(--ink-light)]">End Block</span>
                        <span className="font-mono text-xs text-[var(--ink-dark)] text-right">
                            {stream.endBlock > 0n ? `#${stream.endBlock.toString()}` : 'Until exhausted'}
                        </span>
                    </div>
                </div>

                {/* Stored reason for pause/cancel */}
                {storedReason && (stream.status === StreamStatus.Paused || stream.status === StreamStatus.Cancelled) && (
                    <div className={`mb-8 px-4 py-3 rounded-lg border border-dashed ${
                        stream.status === StreamStatus.Cancelled
                            ? 'bg-[var(--stamp-red)]/5 border-[var(--stamp-red)]/30'
                            : 'bg-[var(--stamp-orange)]/5 border-[var(--stamp-orange)]/30'
                    }`}>
                        <p className="text-xs text-[var(--ink-light)] font-serif mb-1">
                            {stream.status === StreamStatus.Cancelled ? '🚫 Cancellation reason' : '⏸ Pause reason'}
                        </p>
                        <p className="text-sm text-[var(--ink-dark)] italic">{storedReason}</p>
                        <p className="text-[10px] text-[var(--ink-light)] mt-1">Stored locally — clearing site data will erase this note.</p>
                    </div>
                )}

                {/* Encrypted Memo */}
                {memo && (isSender || isRecipient) && (
                    <div className="mb-8 px-4 py-3 bg-[var(--paper-bg)] rounded-lg border border-dashed border-[var(--border-paper)]">
                        <p className="text-xs text-[var(--ink-light)] font-serif mb-1 flex items-center gap-1">
                            <span>🔒</span> Private Memo
                        </p>
                        <p className="text-sm text-[var(--ink-dark)] italic whitespace-pre-wrap">{memo}</p>
                    </div>
                )}
                {hasHashMemo && !memo && !(isSender || isRecipient) && (
                    <div className="mb-8 px-4 py-3 bg-[var(--paper-bg)] rounded-lg border border-dashed border-[var(--border-paper)]">
                        <p className="text-xs text-[var(--ink-light)] font-serif flex items-center gap-1">
                            <span>🔒</span> Encrypted memo — connect sender or recipient wallet to view.
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-4 pt-6 border-t border-[var(--border-paper)]">
                    {/* Pending tx banner */}
                    {pendingTx && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 animate-pulse">
                            <span className="text-lg">⏳</span>
                            <span className="text-sm text-[var(--accent-gold)] font-medium">{pendingTx}</span>
                        </div>
                    )}

                    {!walletAddress ? (
                        <p className="text-center text-sm text-[var(--ink-light)] italic">Connect wallet to interact with this stream.</p>
                    ) : (
                        <>
                            {/* Recipient actions */}
                            {isRecipient && stream.status === StreamStatus.Active && (
                                <div className="space-y-3">
                                    <button type="button" onClick={() => void handleWithdraw()} disabled={withdrawing || !!pendingTx || withdrawable === 0n}
                                        className="w-full py-3.5 bg-[var(--accent-gold)] text-white font-medium rounded-lg text-lg hover:bg-[var(--accent-gold-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]">
                                        {withdrawing ? 'Withdrawing...' : `Withdraw ${formatTokenAmount(withdrawable, decimals)} ${token?.symbol ?? ''}`}
                                    </button>
                                    {!showWithdrawTo ? (
                                        <button type="button" onClick={() => setShowWithdrawTo(true)} disabled={!!pendingTx}
                                            className="w-full py-2.5 border-2 border-[var(--border-paper)] text-[var(--ink-medium)] font-medium rounded-lg text-sm hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                            Withdraw To Different Address
                                        </button>
                                    ) : (
                                        <div className="p-4 bg-[var(--paper-bg)] rounded-lg border border-[var(--border-paper)] space-y-3">
                                            <input type="text" value={withdrawToAddr}
                                                onChange={(e) => setWithdrawToAddr(e.target.value)}
                                                placeholder="opt1... or 0x..." className={inputCls} />
                                            {withdrawToAddr && !withdrawToValidation.isValid && withdrawToValidation.error && (
                                                <p className="text-xs text-[var(--stamp-red)]">{withdrawToValidation.error}</p>
                                            )}
                                            <p className="text-[10px] text-[var(--stamp-orange)] leading-snug">
                                                ⚠ The target address must have transacted on OPNet at least once. Transfers to inactive addresses will fail on-chain.
                                            </p>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => void handleWithdrawTo()}
                                                    disabled={withdrawing || !!pendingTx || !withdrawToValidation.isValid || withdrawable === 0n}
                                                    className="flex-1 py-2 bg-[var(--accent-gold)] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {withdrawing ? 'Sending...' : 'Withdraw To'}
                                                </button>
                                                <button type="button" onClick={() => { setShowWithdrawTo(false); setWithdrawToAddr(''); }}
                                                    className="px-4 py-2 text-[var(--ink-light)] text-sm hover:text-[var(--ink-dark)]">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sender actions */}
                            {isSender && stream.status !== StreamStatus.Cancelled && (
                                <div className="space-y-3">
                                    {/* Top Up */}
                                    {!showTopUp ? (
                                        <button type="button" onClick={() => void handleOpenTopUp()} disabled={!!pendingTx}
                                            className="w-full py-2.5 bg-[var(--accent-gold)] text-white font-medium rounded-lg text-sm hover:bg-[var(--accent-gold-light)] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                                            Top Up Stream
                                        </button>
                                    ) : (
                                        <div className="p-4 bg-[var(--paper-bg)] rounded-lg border border-[var(--border-paper)] space-y-3">
                                            <label className="block text-sm font-serif font-medium text-[var(--ink-dark)]">Top-Up Amount</label>
                                            <input type="text" inputMode="decimal" value={topUpAmount}
                                                onChange={(e) => { setTopUpAmount(e.target.value); setTopUpApproved(false); }}
                                                placeholder="0.00" className={inputCls + ' font-mono'} />
                                            {topUpCheckingAllowance ? (
                                                <p className="text-xs text-[var(--ink-light)] animate-pulse">Checking allowance...</p>
                                            ) : (
                                                <div className="flex gap-2">
                                                    {!topUpApproved ? (
                                                        <button type="button" onClick={() => void handleTopUpApprove()}
                                                            disabled={topUpApproving || !!pendingTx || !topUpAmount}
                                                            className="flex-1 py-2 bg-[var(--accent-gold)] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                                            {topUpApproving ? 'Approving...' : '1. Approve'}
                                                        </button>
                                                    ) : (
                                                        <button type="button" onClick={() => void handleTopUp()}
                                                            disabled={topping || !!pendingTx || !topUpAmount}
                                                            className="flex-1 py-2 bg-[var(--accent-gold)] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                                            {topping ? 'Sending...' : 'Top Up'}
                                                        </button>
                                                    )}
                                                    <button type="button" onClick={() => { setShowTopUp(false); setTopUpAmount(''); setTopUpApproved(false); }}
                                                        className="px-4 py-2 text-[var(--ink-light)] text-sm hover:text-[var(--ink-dark)]">
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Pause / Resume */}
                                    {stream.status === StreamStatus.Active && (
                                        !showPauseConfirm ? (
                                            <button type="button" onClick={() => setShowPauseConfirm(true)} disabled={!!pendingTx}
                                                className="w-full py-2.5 border-2 border-[var(--stamp-orange)] text-[var(--stamp-orange)] font-medium rounded-lg text-sm hover:bg-[var(--stamp-orange)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                Pause Stream
                                            </button>
                                        ) : (
                                            <div className="p-4 bg-[var(--stamp-orange)]/5 rounded-lg border border-[var(--stamp-orange)] space-y-3">
                                                <p className="text-sm text-[var(--stamp-orange)] font-medium">⏸ Pause this stream?</p>
                                                <input type="text" value={pauseReason} onChange={(e) => setPauseReason(e.target.value)}
                                                    placeholder="Reason (optional)" maxLength={200}
                                                    className={inputCls + ' text-sm'} />
                                                <p className="text-[10px] text-[var(--ink-light)]">Stored locally in your browser — clearing site data will erase it.</p>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => void handlePauseResume(pauseReason)} disabled={pausing || !!pendingTx}
                                                        className="flex-1 py-2 bg-[var(--stamp-orange)] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                                        {pausing ? 'Pausing...' : 'Confirm Pause'}
                                                    </button>
                                                    <button type="button" onClick={() => { setShowPauseConfirm(false); setPauseReason(''); }}
                                                        className="px-4 py-2 text-[var(--ink-light)] text-sm hover:text-[var(--ink-dark)]">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                    {stream.status === StreamStatus.Paused && (
                                        <button type="button" onClick={() => void handlePauseResume()} disabled={pausing || !!pendingTx}
                                            className="w-full py-2.5 bg-[var(--stamp-green)] text-white font-medium rounded-lg text-sm hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                            {pausing ? 'Processing...' : 'Resume Stream'}
                                        </button>
                                    )}

                                    {/* Cancel */}
                                    {!showCancelConfirm ? (
                                        <button type="button" onClick={() => setShowCancelConfirm(true)} disabled={!!pendingTx}
                                            className="w-full py-2.5 border-2 border-[var(--stamp-red)] text-[var(--stamp-red)] font-medium rounded-lg text-sm hover:bg-[var(--stamp-red)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                            Cancel Stream
                                        </button>
                                    ) : (
                                        <div className="p-4 bg-[var(--stamp-red)]/5 rounded-lg border border-[var(--stamp-red)] space-y-3">
                                            <p className="text-sm text-[var(--stamp-red)] font-medium">
                                                ⚠️ This action is irreversible.
                                            </p>
                                            <p className="text-sm text-[var(--ink-medium)]">
                                                Cancelling the stream will immediately stop all payments. Any remaining deposited funds will be returned to you (sender). The recipient keeps what has already been streamed.
                                            </p>
                                            <input type="text" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                                                placeholder="Reason (optional)" maxLength={200}
                                                className={inputCls + ' text-sm'} />
                                            <p className="text-[10px] text-[var(--ink-light)]">Stored locally in your browser — clearing site data will erase it.</p>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => void handleCancel(cancelReason)} disabled={cancelling || !!pendingTx}
                                                    className="flex-1 py-2 bg-[var(--stamp-red)] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {cancelling ? 'Cancelling...' : 'Yes, Cancel Stream'}
                                                </button>
                                                <button type="button" onClick={() => { setShowCancelConfirm(false); setCancelReason(''); }}
                                                    className="px-4 py-2 text-[var(--ink-light)] text-sm hover:text-[var(--ink-dark)]">
                                                    No, Keep It
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Third party: claim for recipient (uses withdrawTo to route funds correctly) */}
                            {!isSender && !isRecipient && stream.status === StreamStatus.Active && withdrawable > 0n && (
                                <button type="button" onClick={() => void handleClaimForRecipient()} disabled={withdrawing || !!pendingTx}
                                    className="w-full py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg text-sm hover:bg-[var(--accent-gold-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md">
                                    {withdrawing ? 'Claiming...' : `Claim ${formatTokenAmount(withdrawable, decimals)} for Recipient`}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Share Section */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-[var(--border-paper)]">
                    <button type="button" onClick={() => void handleCopyLink()} disabled={copied}
                        className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-[var(--border-paper)] text-[var(--ink-medium)] font-medium rounded-lg hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {copied ? 'Copied!' : 'Share Link'}
                    </button>
                    {qrDataUrl && (
                        <div className="flex justify-center">
                            <div className="text-center">
                                <img src={qrDataUrl} alt="Share QR" className="w-20 h-20 rounded border border-[var(--border-paper)]" />
                                <p className="text-xs text-[var(--ink-light)] mt-1">Scan to view</p>
                            </div>
                        </div>
                    )}
                </div>
            </PaperCard>
        </div>
    );
}
