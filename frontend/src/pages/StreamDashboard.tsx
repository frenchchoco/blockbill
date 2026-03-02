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

type Tab = 'sending' | 'receiving';
type StatusFilter = 'all' | 'active' | 'paused' | 'cancelled';

const FILTER_OPTIONS: readonly { key: StatusFilter; label: string; status: StreamStatus | null }[] = [
    { key: 'all', label: 'All', status: null },
    { key: 'active', label: 'Active', status: StreamStatus.Active },
    { key: 'paused', label: 'Paused', status: StreamStatus.Paused },
    { key: 'cancelled', label: 'Cancelled', status: StreamStatus.Cancelled },
];

const BLOCKS_PER_DAY = 144;

/** Parse raw getStream result into StreamData. */
function parseStreamProperties(id: number, props: Record<string, unknown>): StreamData {
    return {
        id,
        sender: typeof props.sender === 'object' && props.sender !== null && 'toHex' in props.sender
            ? '0x' + (props.sender as { toHex(): string }).toHex()
            : String(props.sender ?? ''),
        recipient: typeof props.recipient === 'object' && props.recipient !== null && 'toHex' in props.recipient
            ? '0x' + (props.recipient as { toHex(): string }).toHex()
            : String(props.recipient ?? ''),
        token: typeof props.token === 'object' && props.token !== null && 'toHex' in props.token
            ? '0x' + (props.token as { toHex(): string }).toHex()
            : String(props.token ?? ''),
        totalDeposited: BigInt(props.totalDeposited as bigint ?? 0n),
        totalWithdrawn: BigInt(props.totalWithdrawn as bigint ?? 0n),
        ratePerBlock: BigInt(props.ratePerBlock as bigint ?? 0n),
        startBlock: BigInt(props.startBlock as bigint ?? 0n),
        endBlock: BigInt(props.endBlock as bigint ?? 0n),
        lastWithdrawBlock: BigInt(props.lastWithdrawBlock as bigint ?? 0n),
        pausedAtBlock: BigInt(props.pausedAtBlock as bigint ?? 0n),
        accumulatedBeforePause: BigInt(props.accumulatedBeforePause as bigint ?? 0n),
        status: Number(props.status ?? 0) as StreamData['status'],
    };
}

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

            const walletHex = address.toHex().toLowerCase();

            const promises = Array.from({ length: globalCount }, (_, i) =>
                contract.getStream(BigInt(i + 1)).catch(() => null),
            );
            const results = await Promise.all(promises);

            const fetchedStreams: StreamData[] = [];
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                if (!result?.properties) continue;

                const s = parseStreamProperties(i + 1, result.properties as unknown as Record<string, unknown>);

                const isSender = s.sender.replace(/^0x/i, '').toLowerCase() === walletHex;
                const isRecipient = s.recipient.replace(/^0x/i, '').toLowerCase() === walletHex;
                if (activeTab === 'sending' && isSender) fetchedStreams.push(s);
                else if (activeTab === 'receiving' && isRecipient) fetchedStreams.push(s);
            }

            setStreams(fetchedStreams);

            // Fetch withdrawable for active streams (receiving tab)
            if (activeTab === 'receiving') {
                const activeStreams = fetchedStreams.filter((s) => s.status === StreamStatus.Active);
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

    const filteredStreams = statusFilter === 'all'
        ? streams
        : streams.filter((s) => {
            const opt = FILTER_OPTIONS.find((f) => f.key === statusFilter);
            return opt?.status !== null && opt?.status !== undefined && s.status === opt.status;
        });

    if (!walletAddress) {
        return (
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-serif text-[var(--ink-dark)] mb-8 text-center">My Streams</h1>
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
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-serif text-[var(--ink-dark)]">My Streams</h1>
                <Link to="/streams/create"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-gold)] text-white font-medium rounded-lg text-sm hover:bg-[var(--accent-gold-light)] transition-colors shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create Stream
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 mb-6 border-b border-[var(--border-paper)]">
                {(['sending', 'receiving'] as const).map((tab) => (
                    <button key={tab} type="button"
                        onClick={() => { setActiveTab(tab); setStatusFilter('all'); }}
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
                    {totalCount.toString()} total
                </span>
                <button type="button" onClick={() => void fetchStreams()} disabled={loading}
                    title="Refresh"
                    className="ml-1 p-1 text-[var(--ink-light)] hover:text-[var(--accent-gold)] transition-colors disabled:opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
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
            ) : filteredStreams.length === 0 ? (
                <PaperCard className="text-center py-12">
                    <p className="text-[var(--ink-medium)] mb-4">
                        {streams.length === 0 ? 'No streams yet.' : 'No matching streams.'}
                    </p>
                    <Link to="/streams/create"
                        className="inline-flex items-center px-6 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-md">
                        Create Stream
                    </Link>
                </PaperCard>
            ) : (
                <div className="space-y-3">
                    {filteredStreams.map((stream) => {
                        const tok = findToken(stream.token, network);
                        const dec = tokenDecimals[stream.token] ?? tok?.decimals ?? 8;
                        const wd = withdrawables[stream.id] ?? 0n;
                        const streamed = stream.totalWithdrawn + wd;
                        const progressPercent = stream.totalDeposited > 0n
                            ? Number((streamed * 10000n) / stream.totalDeposited) / 100
                            : 0;
                        const counterparty = activeTab === 'sending' ? stream.recipient : stream.sender;
                        const ratePerDay = stream.ratePerBlock * BigInt(BLOCKS_PER_DAY);

                        return (
                            <Link key={stream.id} to={`/stream/${stream.id}`} className="block">
                                <PaperCard className="!p-4 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-sm text-[var(--ink-dark)] font-medium">#{stream.id}</span>
                                            <span className="text-xs text-[var(--ink-medium)]">
                                                {tok ? `${tok.icon} ${tok.symbol}` : formatAddress(stream.token)}
                                            </span>
                                        </div>
                                        <span className={getStreamStampClass(stream.status)}>
                                            {getStreamStatusLabel(stream.status)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-[var(--ink-light)]">
                                            {activeTab === 'sending' ? 'To' : 'From'}: <span className="font-mono">{formatAddress(counterparty)}</span>
                                        </span>
                                        <span className="text-xs font-mono text-[var(--ink-medium)]">
                                            {formatTokenAmount(stream.ratePerBlock, dec)}/block
                                            <span className="text-[var(--ink-light)]"> ≈ {formatTokenAmount(ratePerDay, dec)}/day</span>
                                        </span>
                                    </div>

                                    {/* Mini progress bar */}
                                    <div className="mb-2">
                                        <div className="w-full h-1.5 bg-[var(--paper-bg)] rounded-full border border-[var(--border-paper)] overflow-hidden">
                                            <div
                                                className="stream-progress-bar-mini h-full"
                                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-[var(--ink-light)] mt-0.5">
                                            <span>{formatTokenAmount(streamed, dec)} streamed</span>
                                            <span>{progressPercent.toFixed(1)}%</span>
                                        </div>
                                    </div>

                                    {/* Withdrawable highlight for receiving tab */}
                                    {activeTab === 'receiving' && stream.status === StreamStatus.Active && wd > 0n && (
                                        <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--accent-gold)]/5 rounded-lg border border-[var(--accent-gold)]/30 mt-2">
                                            <span className="text-xs text-[var(--accent-gold)] font-medium">Claimable now</span>
                                            <span className="font-mono text-sm font-bold text-[var(--accent-gold)] stream-claimable-pulse">
                                                {formatTokenAmount(wd, dec)} {tok?.symbol ?? ''}
                                            </span>
                                        </div>
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
