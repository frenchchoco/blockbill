import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { PaperCard } from '../components/common/PaperCard';
import { StreamStatus, getStreamStatusLabel, getStreamStampClass } from '../types/stream';
import type { StreamData } from '../types/stream';
import { useNetwork } from '../hooks/useNetwork';
import { contractService } from '../services/ContractService';
import { findToken, formatTokenAmount, formatAddress } from '../config/tokens';
import { friendlyError } from '../utils/errors';
import { getStreamDrafts, deleteStreamDraft, clearPendingDrafts } from '../utils/streamDrafts';
import type { StreamDraft } from '../utils/streamDrafts';
import { parseStreamProperties, normalizeHex } from '../utils/streamParser';
import { getAllPendingActions, clearPendingAction } from '../utils/streamPendingActions';
import type { PendingStreamAction } from '../utils/streamPendingActions';
import { getAllStreamReasons } from '../utils/streamReasons';
import type { StreamReason } from '../utils/streamReasons';
import type { RawStreamProperties } from '../utils/streamParser';

type Tab = 'sending' | 'receiving';
type StatusFilter = 'all' | 'draft' | 'active' | 'paused' | 'cancelled';

const FILTER_OPTIONS: readonly { key: StatusFilter; label: string; status: StreamStatus | null }[] = [
    { key: 'all', label: 'All', status: null },
    { key: 'draft', label: 'Draft', status: null },
    { key: 'active', label: 'Active', status: StreamStatus.Active },
    { key: 'paused', label: 'Paused', status: StreamStatus.Paused },
    { key: 'cancelled', label: 'Cancelled', status: StreamStatus.Cancelled },
];

const BLOCKS_PER_DAY = 144;

export function StreamDashboard(): React.JSX.Element {
    const { walletAddress, address, openConnectModal } = useWalletConnect();
    const { network } = useNetwork();
    const [activeTab, setActiveTab] = useState<Tab>('sending');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [streams, setStreams] = useState<StreamData[]>([]);
    const [withdrawables, setWithdrawables] = useState<Record<number, bigint>>({});
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [totalCount, setTotalCount] = useState(0n);
    const [tokenDecimals, setTokenDecimals] = useState<Record<string, number>>({});
    const fetchedDecimalsRef = useRef<Set<string>>(new Set());
    /** Track previous wallet stream count to detect growth (= tx confirmed). */
    const prevWalletCountRef = useRef<bigint | null>(null);
    const [drafts, setDrafts] = useState<StreamDraft[]>([]);
    const [pendingActions, setPendingActions] = useState<PendingStreamAction[]>([]);
    const [streamReasons, setStreamReasons] = useState<StreamReason[]>([]);

    // Load local drafts scoped to current wallet
    const walletHexForDrafts = address?.toHex();
    useEffect(() => {
        setDrafts(getStreamDrafts(walletHexForDrafts ?? undefined));
    }, [walletHexForDrafts]);

    const handleDeleteDraft = useCallback((draftId: string) => {
        deleteStreamDraft(draftId);
        setDrafts(getStreamDrafts(walletHexForDrafts ?? undefined));
    }, [walletHexForDrafts]);

    // Clear streams when wallet changes
    useEffect(() => {
        setStreams([]);
        setWithdrawables({});
        setTotalCount(0n);
        setFetchError('');
        setTokenDecimals({});
        fetchedDecimalsRef.current.clear();
        contractService.clearCache();
    }, [walletAddress]);

    const fetchStreams = useCallback(async () => {
        if (!walletAddress || !address) return;
        setLoading(true);
        setFetchError('');

        try {
            const contract = contractService.getStreamContract(network);

            // Get per-wallet count via index
            const indexResult = activeTab === 'sending'
                ? await contract.getStreamsBySender(address)
                : await contract.getStreamsByRecipient(address);

            const walletCount = indexResult?.properties?.count ?? 0n;
            setTotalCount(walletCount);

            // Clear pending drafts only when the on-chain count has grown (= new stream confirmed)
            if (activeTab === 'sending') {
                const walletHex = address.toHex();
                if (prevWalletCountRef.current !== null && walletCount > prevWalletCountRef.current) {
                    clearPendingDrafts(walletHex);
                }
                prevWalletCountRef.current = walletCount;
                setDrafts(getStreamDrafts(walletHex));
            }

            if (walletCount === 0n) {
                setStreams([]);
                return;
            }

            // Get global stream count and scan all
            const globalResult = await contract.getStreamCount();
            const globalCount = Math.min(Number(globalResult?.properties?.count ?? 0n), 200);

            if (globalCount === 0) {
                setStreams([]);
                return;
            }

            const walletNorm = normalizeHex(address.toHex());

            const promises = Array.from({ length: globalCount }, (_, i) =>
                contract.getStream(BigInt(i + 1)).catch(() => null),
            );
            const results = await Promise.all(promises);

            const fetchedStreams: StreamData[] = [];
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (!result?.properties) continue;

                const s = parseStreamProperties(i + 1, result.properties as RawStreamProperties);

                const senderNorm = normalizeHex(s.sender);
                const recipientNorm = normalizeHex(s.recipient);

                if (activeTab === 'sending' && senderNorm === walletNorm) fetchedStreams.push(s);
                else if (activeTab === 'receiving' && recipientNorm === walletNorm) fetchedStreams.push(s);
            }

            setStreams(fetchedStreams);

            // Refresh pending actions — clear any that have been confirmed on-chain
            const actions = getAllPendingActions();
            for (const pa of actions) {
                const s = fetchedStreams.find((fs) => fs.id === pa.streamId);
                if (!s) continue;
                // Withdraw confirmed: totalWithdrawn increased (action is stale)
                if (pa.action === 'withdraw') clearPendingAction(pa.streamId);
                // Pause/resume confirmed when status changed
                else if (pa.action === 'pause' && s.status === StreamStatus.Paused) clearPendingAction(pa.streamId);
                else if (pa.action === 'resume' && s.status === StreamStatus.Active) clearPendingAction(pa.streamId);
                // Cancel confirmed
                else if (pa.action === 'cancel' && s.status === StreamStatus.Cancelled) clearPendingAction(pa.streamId);
            }
            setPendingActions(getAllPendingActions());
            setStreamReasons(getAllStreamReasons());

            // Fetch withdrawable for active streams (both tabs — needed for accurate progress)
            const activeStreams = fetchedStreams.filter((s) => s.status === StreamStatus.Active);
            if (activeStreams.length > 0) {
                const wdPromises = activeStreams.map((s) =>
                    contract.getWithdrawable(BigInt(s.id)).then((r) => ({
                        id: s.id,
                        amount: r?.properties?.withdrawable ?? 0n,
                    })).catch(() => ({ id: s.id, amount: 0n })),
                );
                const wdResults = await Promise.all(wdPromises);
                const wdMap: Record<number, bigint> = {};
                for (const wd of wdResults) {
                    wdMap[wd.id] = wd.amount;
                }
                setWithdrawables(wdMap);
            }
        } catch (err: unknown) {
            setFetchError(friendlyError(err instanceof Error ? err.message : String(err)));
            setStreams([]);
        } finally {
            setLoading(false);
        }
    }, [walletAddress, address, activeTab, network]);

    useEffect(() => {
        void fetchStreams();
    }, [fetchStreams]);

    // Fetch on-chain decimals
    useEffect(() => {
        const uniqueTokens = [...new Set(streams.map((s) => s.token))];
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
                } catch { /* fallback to config decimals */ }
                fetchedDecimalsRef.current.add(tokenAddr);
            }));
            if (!cancelled && Object.keys(results).length > 0) {
                setTokenDecimals((prev) => ({ ...prev, ...results }));
            }
        };
        void fetchDecimals();
        return () => { cancelled = true; };
    }, [streams, network]);

    const filteredStreams = statusFilter === 'all' || statusFilter === 'draft'
        ? streams
        : streams.filter((s) => {
            const opt = FILTER_OPTIONS.find((f) => f.key === statusFilter);
            return opt?.status !== null && opt?.status !== undefined && s.status === opt.status;
        });

    const showDrafts = statusFilter === 'all' || statusFilter === 'draft';
    const displayedDraftCount = showDrafts ? drafts.length : 0;

    const exportCsv = useCallback(() => {
        if (filteredStreams.length === 0) return;
        const base = window.location.origin;
        const rows: string[][] = [['ID', 'Counterparty', 'Token', 'Status', 'Rate/Block', 'Total Deposited', 'Total Withdrawn', 'Start Block', 'End Block', 'Link']];
        for (const s of filteredStreams) {
            const tok = findToken(s.token, network);
            const dec = tokenDecimals[s.token] ?? tok?.decimals ?? 8;
            const counterparty = activeTab === 'sending' ? s.recipient : s.sender;
            rows.push([
                s.id.toString(),
                formatAddress(counterparty),
                tok?.symbol ?? formatAddress(s.token),
                getStreamStatusLabel(s.status),
                formatTokenAmount(s.ratePerBlock, dec),
                formatTokenAmount(s.totalDeposited, dec),
                formatTokenAmount(s.totalWithdrawn, dec),
                s.startBlock.toString(),
                s.endBlock.toString(),
                `${base}/stream/${s.id.toString()}`,
            ]);
        }
        const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blockbill-${activeTab}-streams.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [filteredStreams, activeTab, network, tokenDecimals]);

    if (!walletAddress) {
        return (
            <div className="max-w-4xl mx-auto">
                <PaperCard className="text-center py-12">
                    <p className="text-[var(--ink-medium)] mb-4">Connect your wallet to see your streams.</p>
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
            {/* Tabs */}
            <div className="flex gap-8 mb-6 border-b border-[var(--border-paper)]">
                {(['sending', 'receiving'] as const).map((tab) => (
                    <button key={tab} type="button"
                        onClick={() => { setActiveTab(tab); setStatusFilter('all'); setStreams([]); setWithdrawables({}); prevWalletCountRef.current = null; }}
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
                    {(Number(totalCount) + drafts.length).toString()} total{drafts.length > 0 && ` (${drafts.length} draft${drafts.length > 1 ? 's' : ''})`}
                </span>
                <button type="button" onClick={() => void fetchStreams()} disabled={loading}
                    title="Refresh"
                    className="ml-1 p-1 text-[var(--ink-light)] hover:text-[var(--accent-gold)] transition-colors disabled:opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
                {filteredStreams.length > 0 && (
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
                    <button type="button" onClick={() => void fetchStreams()}
                        className="text-sm text-[var(--accent-gold)] hover:underline ml-4 shrink-0">
                        Retry
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[var(--ink-light)] mt-4 font-serif">Loading streams...</p>
                </div>
            ) : filteredStreams.length === 0 && displayedDraftCount === 0 ? (
                <PaperCard className="text-center py-12">
                    <p className="text-[var(--ink-medium)] mb-4">
                        {streams.length === 0 && drafts.length === 0 ? 'No streams yet.' : 'No matching streams.'}
                    </p>
                    <Link to="/create/stream"
                        className="inline-flex items-center px-6 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-md">
                        Create Stream
                    </Link>
                </PaperCard>
            ) : (
                <div className="space-y-3">
                    {/* Draft & Pending cards */}
                    {showDrafts && drafts.map((draft) => {
                        const tok = findToken(draft.tokenAddress, network);
                        const isPending = draft.status === 'pending';
                        return (
                            <PaperCard key={draft.draftId} className={`!p-4 relative ${
                                isPending
                                    ? 'border-[var(--accent-gold)]/40'
                                    : 'border-dashed border-[var(--stamp-orange)]/40'
                            }`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-[var(--ink-light)] italic">
                                            {isPending ? 'Awaiting block' : 'Draft'}
                                        </span>
                                        <span className="text-xs text-[var(--ink-medium)]">
                                            {draft.tokenIcon || tok?.icon || ''} {draft.tokenSymbol || tok?.symbol || formatAddress(draft.tokenAddress)}
                                        </span>
                                    </div>
                                    {isPending ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-gold)] bg-[var(--accent-gold)]/10 px-2.5 py-1 rounded-full">
                                            <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent-gold)] animate-pulse" />
                                            PENDING
                                        </span>
                                    ) : (
                                        <span className="stamp stamp-pending">DRAFT</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-[var(--ink-light)]">
                                        To: <span className="font-mono">{draft.recipient ? formatAddress(draft.recipient) : '—'}</span>
                                    </span>
                                    <span className="text-xs font-mono text-[var(--ink-medium)]">
                                        {draft.ratePerBlock ? `${draft.ratePerBlock}/block` : '—'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-[var(--ink-light)]">
                                        Amount: <span className="font-mono font-medium text-[var(--ink-dark)]">{draft.totalAmount || '—'}</span>
                                    </span>
                                    {draft.durationBlocks && (
                                        <span className="text-xs text-[var(--ink-light)]">
                                            {Number(draft.durationBlocks).toLocaleString()} blocks
                                        </span>
                                    )}
                                </div>

                                {isPending ? (
                                    <div className="mt-3 pt-2 border-t border-[var(--border-paper)]">
                                        <p className="text-xs text-[var(--accent-gold)] text-center animate-pulse">
                                            Transaction broadcast — waiting for next block (~10 min)
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--border-paper)]">
                                        <Link to={`/create/stream?draft=${draft.draftId}`}
                                            className="flex-1 text-center text-sm text-white bg-[var(--accent-gold)] px-3 py-1.5 rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors">
                                            Continue Editing
                                        </Link>
                                        <button type="button" onClick={() => handleDeleteDraft(draft.draftId)}
                                            className="text-sm text-[var(--stamp-red)] hover:text-[var(--stamp-red)]/80 transition-colors px-3 py-1.5"
                                            title="Delete draft">
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </PaperCard>
                        );
                    })}

                    {/* On-chain stream cards */}
                    {(statusFilter !== 'draft') && filteredStreams.map((stream) => {
                        const tok = findToken(stream.token, network);
                        const dec = tokenDecimals[stream.token] ?? tok?.decimals ?? 8;
                        const wd = withdrawables[stream.id] ?? 0n;
                        const streamed = stream.totalWithdrawn + wd;
                        const withdrawnPct = stream.totalDeposited > 0n
                            ? Number((stream.totalWithdrawn * 10000n) / stream.totalDeposited) / 100
                            : 0;
                        const withdrawablePct = stream.totalDeposited > 0n
                            ? Number((wd * 10000n) / stream.totalDeposited) / 100
                            : 0;
                        const progressPercent = Math.min(withdrawnPct + withdrawablePct, 100);
                        const counterparty = activeTab === 'sending' ? stream.recipient : stream.sender;
                        const ratePerDay = stream.ratePerBlock * BigInt(BLOCKS_PER_DAY);
                        const pendingAction = pendingActions.find((pa) => pa.streamId === stream.id);
                        const reason = streamReasons.find((r) => r.streamId === stream.id);
                        const pendingLabel: Record<string, string> = {
                            withdraw: 'Withdrawing…', pause: 'Pausing…', resume: 'Resuming…',
                            cancel: 'Cancelling…', topUp: 'Topping up…',
                        };

                        return (
                            <Link key={stream.id} to={`/stream/${stream.id}`} className="block">
                                <PaperCard className={`!p-4 hover:shadow-lg transition-shadow ${pendingAction ? 'border-[var(--accent-gold)]/40' : ''}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-sm text-[var(--ink-dark)] font-medium">#{stream.id}</span>
                                            <span className="text-xs text-[var(--ink-medium)]">
                                                {tok ? `${tok.icon} ${tok.symbol}` : formatAddress(stream.token)}
                                            </span>
                                        </div>
                                        {pendingAction ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-gold)] bg-[var(--accent-gold)]/10 px-2.5 py-1 rounded-full">
                                                <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent-gold)] animate-pulse" />
                                                {pendingLabel[pendingAction.action] ?? 'Pending…'}
                                            </span>
                                        ) : (
                                            <span className={getStreamStampClass(stream.status)}>
                                                {getStreamStatusLabel(stream.status)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="text-xs text-[var(--ink-light)] truncate min-w-0">
                                            {activeTab === 'sending' ? 'To' : 'From'}: <span className="font-mono">{formatAddress(counterparty)}</span>
                                        </span>
                                        <span className="text-xs font-mono text-[var(--ink-medium)] shrink-0">
                                            {formatTokenAmount(stream.ratePerBlock, dec)}/block
                                            <span className="hidden sm:inline text-[var(--ink-light)]"> ≈ {formatTokenAmount(ratePerDay, dec)}/day</span>
                                        </span>
                                    </div>

                                    {/* Mini progress bar — two-tone: withdrawn (solid) + withdrawable (lighter) */}
                                    <div className="mb-2">
                                        <div className={`w-full h-2 bg-[var(--paper-bg)] rounded-full border overflow-hidden flex ${
                                            stream.status === StreamStatus.Cancelled
                                                ? 'border-[var(--stamp-grey)]/50 stream-bar-cancelled'
                                                : stream.status === StreamStatus.Paused
                                                    ? 'border-[var(--stamp-orange)]/50'
                                                    : 'border-[var(--border-paper)]'
                                        }`}>
                                            {withdrawnPct > 0 && (
                                                <div
                                                    className={`h-full ${
                                                        stream.status === StreamStatus.Cancelled
                                                            ? 'bg-[var(--stamp-grey)]'
                                                            : stream.status === StreamStatus.Paused
                                                                ? 'bg-[var(--stamp-orange)]'
                                                                : 'bg-[var(--accent-gold)] stream-bar-shimmer'
                                                    }`}
                                                    style={{ width: `${Math.min(withdrawnPct, 100)}%` }}
                                                />
                                            )}
                                            {withdrawablePct > 0 && (
                                                <div
                                                    className={`h-full ${
                                                        stream.status === StreamStatus.Cancelled
                                                            ? 'bg-[var(--stamp-grey)]/40'
                                                            : stream.status === StreamStatus.Paused
                                                                ? 'bg-[var(--stamp-orange)]/40'
                                                                : 'bg-[var(--accent-gold)]/40 stream-bar-shimmer'
                                                    }`}
                                                    style={{ width: `${Math.min(withdrawablePct, 100 - withdrawnPct)}%` }}
                                                />
                                            )}
                                        </div>
                                        <div className="flex justify-between text-[10px] mt-0.5">
                                            <span className="text-[var(--ink-light)]">
                                                {formatTokenAmount(stream.totalWithdrawn, dec)} withdrawn
                                                {wd > 0n && (
                                                    <span className="text-[var(--accent-gold)]"> + {formatTokenAmount(wd, dec)} claimable</span>
                                                )}
                                            </span>
                                            <span className="text-[var(--ink-light)]">{progressPercent.toFixed(1)}%</span>
                                        </div>
                                    </div>

                                    {/* Optional reason for paused/cancelled */}
                                    {reason?.reason && (stream.status === StreamStatus.Paused || stream.status === StreamStatus.Cancelled) && (
                                        <p className={`text-[10px] italic truncate ${
                                            stream.status === StreamStatus.Cancelled ? 'text-[var(--stamp-grey)]' : 'text-[var(--stamp-orange)]'
                                        }`}>
                                            💬 {reason.reason}
                                        </p>
                                    )}
                                </PaperCard>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
