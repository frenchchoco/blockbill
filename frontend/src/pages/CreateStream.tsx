import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';
import toast from 'react-hot-toast';
import { PaperCard } from '../components/common/PaperCard';
import { useNetwork } from '../hooks/useNetwork';
import { useBlockNumber } from '../hooks/useBlockNumber';
import { useAddressValidation } from '../hooks/useAddressValidation';
import { useStreamApproval } from '../hooks/useStreamApproval';
import { contractService } from '../services/ContractService';
import { getKnownTokens, findToken, parseTokenAmount, formatTokenAmount, formatAddress } from '../config/tokens';
import type { TokenInfo } from '../config/tokens';
import { friendlyError } from '../utils/errors';
import { getTxGasParams } from '../config/networks';
import { saveStreamDraft, getStreamDrafts, markDraftPending } from '../utils/streamDrafts';
import { addFeeOnTop, FEE_PERCENT } from '../utils/fee';

const STREAM_APPROVAL_KEY_PREFIX = 'bb_stream_approve_';
const MAX_UINT256 = 2n ** 256n - 1n;

type ApproveStatus = 'waiting' | 'processing' | 'broadcast' | 'done' | 'error';

interface StreamFormData {
    readonly tokenAddress: string;
    readonly recipient: string;
    readonly totalAmount: string;
    readonly ratePerBlock: string;
    readonly durationType: 'infinite' | 'fixed';
    readonly durationBlocks: string;
    readonly memo: string;
}

const INITIAL_FORM: StreamFormData = {
    tokenAddress: '',
    recipient: '',
    totalAmount: '',
    ratePerBlock: '',
    durationType: 'infinite',
    durationBlocks: '',
    memo: '',
};

// Bitcoin block time estimates
const BLOCKS_PER_HOUR = 6;
const BLOCKS_PER_DAY = 144;
const BLOCKS_PER_MONTH = 4320;

type DurationPreset = '1w' | '1m' | '3m' | '6m' | '1y' | 'custom';

const DURATION_PRESETS: readonly { key: DurationPreset; label: string; blocks: number }[] = [
    { key: '1w', label: '1 Week', blocks: 1_008 },
    { key: '1m', label: '1 Month', blocks: 4_320 },
    { key: '3m', label: '3 Months', blocks: 12_960 },
    { key: '6m', label: '6 Months', blocks: 25_920 },
    { key: '1y', label: '1 Year', blocks: 52_560 },
];

export function CreateStream(): React.JSX.Element {
    const { walletAddress, address } = useWalletConnect();
    const { network } = useNetwork();
    const navigate = useNavigate();
    const currentBlock = useBlockNumber();
    const [searchParams, setSearchParams] = useSearchParams();
    const [form, setForm] = useState<StreamFormData>(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [_step, setStep] = useState<'form' | 'approve' | 'create'>('form');
    const [customToken, setCustomToken] = useState(false);
    const [tokenBalance, setTokenBalance] = useState<bigint | null>(null);
    const [onChainDecimals, setOnChainDecimals] = useState<number | null>(null);
    const [customTokenName, setCustomTokenName] = useState<string | null>(null);
    const [customTokenSymbol, setCustomTokenSymbol] = useState<string | null>(null);
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [approveStatus, setApproveStatus] = useState<ApproveStatus>('waiting');
    const [unlimitedApproval, setUnlimitedApproval] = useState(false);
    const [durationPreset, setDurationPreset] = useState<DurationPreset>('1m');
    const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
    const { checkAllowance } = useStreamApproval();

    // Load draft from URL ?draft=<id>
    useEffect(() => {
        const draftId = searchParams.get('draft');
        if (!draftId) return;
        const drafts = getStreamDrafts();
        const draft = drafts.find((d) => d.draftId === draftId);
        if (!draft) return;

        setEditingDraftId(draftId);
        setForm({
            tokenAddress: draft.tokenAddress,
            recipient: draft.recipient,
            totalAmount: draft.totalAmount,
            ratePerBlock: draft.ratePerBlock,
            durationType: draft.durationBlocks ? 'fixed' : 'infinite',
            durationBlocks: draft.durationBlocks,
            memo: draft.memo ?? '',
        });
        if (!findToken(draft.tokenAddress, network)) setCustomToken(true);
        // Clean the URL param
        setSearchParams({}, { replace: true });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const knownTokens = useMemo(() => getKnownTokens(network), [network]);

    const selectedToken: TokenInfo | undefined = useMemo(
        () => findToken(form.tokenAddress, network),
        [form.tokenAddress, network],
    );

    const decimals = onChainDecimals ?? selectedToken?.decimals ?? 8;

    const updateField = useCallback(<K extends keyof StreamFormData>(
        field: K, value: StreamFormData[K],
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const tokenValidation = useAddressValidation(
        customToken ? form.tokenAddress : '',
        network,
    );
    const recipientValidation = useAddressValidation(form.recipient, network);

    // Fetch token balance and metadata
    useEffect(() => {
        setTokenBalance(null);
        setOnChainDecimals(null);
        setCustomTokenName(null);
        setCustomTokenSymbol(null);
        if (!address || !form.tokenAddress) return;

        let cancelled = false;
        setBalanceLoading(true);

        const fetchBalance = async (): Promise<void> => {
            try {
                const resolvedHex = form.tokenAddress.startsWith('0x')
                    ? form.tokenAddress
                    : (await contractService.resolveAddress(form.tokenAddress, network, true)).toHex();

                const tokenContract = contractService.getTokenContract(resolvedHex, network);

                const [metadataResult, balanceResult] = await Promise.all([
                    tokenContract.metadata(),
                    tokenContract.balanceOf(address),
                ]);

                if (!cancelled && metadataResult?.properties) {
                    setOnChainDecimals(metadataResult.properties.decimals);
                    setCustomTokenName(metadataResult.properties.name || null);
                    setCustomTokenSymbol(metadataResult.properties.symbol || null);
                }
                if (!cancelled && balanceResult?.properties) {
                    setTokenBalance(balanceResult.properties.balance ?? 0n);
                }
            } catch {
                if (!cancelled) {
                    setTokenBalance(null);
                    setOnChainDecimals(null);
                }
            } finally {
                if (!cancelled) setBalanceLoading(false);
            }
        };
        void fetchBalance();

        return () => { cancelled = true; };
    }, [form.tokenAddress, address, network]);

    // Reset approval when token or amount changes
    useEffect(() => {
        setApproveStatus('waiting');
        setStep('form');
    }, [form.tokenAddress, form.totalAmount]);

    const parsedAmount = useMemo(
        () => parseTokenAmount(form.totalAmount || '0', decimals),
        [form.totalAmount, decimals],
    );

    const parsedRate = useMemo(
        () => parseTokenAmount(form.ratePerBlock || '0', decimals),
        [form.ratePerBlock, decimals],
    );

    const durationBlocks = useMemo((): number => {
        if (form.durationType === 'infinite') return 0;
        if (durationPreset === 'custom') return Math.max(0, Number(form.durationBlocks) || 0);
        const preset = DURATION_PRESETS.find(p => p.key === durationPreset);
        return preset?.blocks ?? 0;
    }, [form.durationType, durationPreset, form.durationBlocks]);

    // endBlock must be an ABSOLUTE block number (not a duration offset).
    // The contract rejects endBlock <= currentBlock, so we add durationBlocks to the current block.
    // If duration is 0 (infinite), we pass 0n (contract interprets as "until deposit runs out").
    const endBlock = useMemo(
        () => durationBlocks === 0 ? 0n : currentBlock + BigInt(durationBlocks),
        [durationBlocks, currentBlock],
    );

    const durationTimeEstimate = useMemo((): string => {
        if (durationBlocks === 0) return '';
        if (durationBlocks < BLOCKS_PER_DAY) return `${(durationBlocks / BLOCKS_PER_HOUR).toFixed(1)} hours`;
        if (durationBlocks < BLOCKS_PER_MONTH) return `${(durationBlocks / BLOCKS_PER_DAY).toFixed(1)} days`;
        return `${(durationBlocks / BLOCKS_PER_MONTH).toFixed(1)} months`;
    }, [durationBlocks]);

    // Fee is added ON TOP: the sender pays grossAmount, recipient receives parsedAmount.
    const grossAmount = useMemo(() => addFeeOnTop(parsedAmount), [parsedAmount]);
    const feeAmount = useMemo(() => grossAmount - parsedAmount, [grossAmount, parsedAmount]);

    // Rate display helpers
    const ratePerHour = useMemo(() => parsedRate * BigInt(BLOCKS_PER_HOUR), [parsedRate]);
    const ratePerDay = useMemo(() => parsedRate * BigInt(BLOCKS_PER_DAY), [parsedRate]);
    const ratePerMonth = useMemo(() => parsedRate * BigInt(BLOCKS_PER_MONTH), [parsedRate]);

    const tokenSymbol = selectedToken?.symbol ?? customTokenSymbol ?? '';

    // Estimated duration: how many blocks until deposit is exhausted
    const estimatedBlocks = useMemo((): bigint => {
        if (parsedRate === 0n) return 0n;
        return parsedAmount / parsedRate;
    }, [parsedAmount, parsedRate]);

    // Human-readable time estimate (approximate — block times vary)
    const estimatedTimeLabel = useMemo((): string => {
        if (estimatedBlocks === 0n) return '';
        const blocks = Number(estimatedBlocks);
        if (blocks < BLOCKS_PER_HOUR) return `≈ ${Math.round(blocks * 10)} min`;
        if (blocks < BLOCKS_PER_DAY) return `≈ ${(blocks / BLOCKS_PER_HOUR).toFixed(1)} hours`;
        if (blocks < BLOCKS_PER_MONTH) return `≈ ${(blocks / BLOCKS_PER_DAY).toFixed(1)} days`;
        return `≈ ${(blocks / BLOCKS_PER_MONTH).toFixed(1)} months`;
    }, [estimatedBlocks]);

    // Check allowance on load and poll every 30s after broadcast
    useEffect(() => {
        if (!address || !form.tokenAddress || grossAmount === 0n) return;
        if (approveStatus === 'done' || approveStatus === 'processing') return;

        const storageKey = `${STREAM_APPROVAL_KEY_PREFIX}${form.tokenAddress}`;
        let cancelled = false;

        const check = async (): Promise<void> => {
            try {
                const resolvedHex = form.tokenAddress.startsWith('0x')
                    ? form.tokenAddress
                    : (await contractService.resolveAddress(form.tokenAddress, network, true)).toHex();
                const allowance = await checkAllowance(resolvedHex);
                if (!cancelled && allowance >= grossAmount) {
                    setApproveStatus('done');
                    setStep('create');
                    localStorage.removeItem(storageKey);
                }
            } catch {
                // allowance check failed, will retry
            }
        };

        // Restore broadcast state from localStorage (survives page refresh)
        if (approveStatus === 'waiting') {
            const stored = localStorage.getItem(storageKey);
            if (stored && Date.now() - parseInt(stored, 10) < 30 * 60 * 1000) {
                setApproveStatus('broadcast');
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
    }, [address, form.tokenAddress, grossAmount, network, checkAllowance, approveStatus]);

    const handleApprove = useCallback(async () => {
        if (!walletAddress || !address || !form.tokenAddress || grossAmount === 0n) return;
        setApproveStatus('processing');

        try {
            const resolvedHex = form.tokenAddress.startsWith('0x')
                ? form.tokenAddress
                : '0x' + (await contractService.resolveAddress(form.tokenAddress, network, true)).toHex();

            const { getBlockBillStreamAddress } = await import('../config/contracts');
            const streamContractAddr = getBlockBillStreamAddress(network);

            const tokenContract = contractService.getTokenContract(resolvedHex, network, address);
            const spender = (await import('@btc-vision/transaction')).Address.fromString(streamContractAddr);

            const approveAmount = unlimitedApproval ? MAX_UINT256 : grossAmount;
            const simulation = await tokenContract.increaseAllowance(spender, approveAmount);
            if (simulation.revert) throw new Error(friendlyError(simulation.revert));

            toast.loading('Approve token spending in your wallet...');
            await simulation.sendTransaction({
                signer: null,
                mldsaSigner: null,
                refundTo: walletAddress,
                ...getTxGasParams(network),
                network,
            });

            toast.dismiss();
            toast.success('Approval broadcast — waiting for block confirmation');
            setApproveStatus('broadcast');
            localStorage.setItem(`${STREAM_APPROVAL_KEY_PREFIX}${form.tokenAddress}`, Date.now().toString());
        } catch (err: unknown) {
            toast.dismiss();
            setApproveStatus('error');
            toast.error(friendlyError(err instanceof Error ? err.message : String(err)));
        }
    }, [walletAddress, address, form.tokenAddress, grossAmount, network, unlimitedApproval]);

    const handleCreate = useCallback(async () => {
        if (!walletAddress || !address || submitting) return;
        if (parsedAmount === 0n) { toast.error('Amount must be greater than 0'); return; }
        if (parsedRate === 0n) { toast.error('Rate per block must be greater than 0'); return; }
        if (durationBlocks > 0 && currentBlock === 0n) { toast.error('Waiting for block number — please retry in a moment'); return; }
        if (!form.tokenAddress) { toast.error('Please select a token'); return; }
        if (customToken && !tokenValidation.isValid) { toast.error(tokenValidation.error ?? 'Invalid token address'); return; }
        if (!form.recipient) { toast.error('Please enter a recipient address'); return; }
        if (!recipientValidation.isValid) { toast.error(recipientValidation.error ?? 'Invalid recipient address'); return; }

        setSubmitting(true);
        const loadingToast = toast.loading('Creating stream on-chain...');

        try {
            const tokenAddr = await contractService.resolveAddress(form.tokenAddress, network, true);
            const recipientAddr = await contractService.resolveAddress(form.recipient, network, false);

            const contract = contractService.getStreamContract(network, address);

            // grossAmount = parsedAmount + fee; the contract deducts fee and deposits the net.
            const simulation = await contract.createStream(
                recipientAddr, tokenAddr, grossAmount, parsedRate, endBlock,
            );

            if (simulation.revert) {
                throw new Error(friendlyError(simulation.revert));
            }

            toast.dismiss(loadingToast);
            const submitToast = toast.loading('Submitting transaction...');

            const receipt = await simulation.sendTransaction({
                signer: null,
                mldsaSigner: null,
                refundTo: walletAddress,
                ...getTxGasParams(network),
                network,
            });

            toast.dismiss(submitToast);
            toast.success('Stream created! Waiting for confirmation...');

            const txId = receipt.transactionId;

            // Mark the draft as "pending" so the dashboard shows a waiting card.
            // If there was no draft, create one in pending state.
            if (editingDraftId) {
                markDraftPending(editingDraftId, txId);
            } else {
                const tok = findToken(form.tokenAddress, network);
                const newDraftId = saveStreamDraft({
                    senderAddress: address.toHex(),
                    tokenAddress: form.tokenAddress,
                    tokenSymbol: tok?.symbol ?? customTokenSymbol ?? '',
                    tokenIcon: tok?.icon ?? '',
                    recipient: form.recipient,
                    totalAmount: form.totalAmount,
                    ratePerBlock: form.ratePerBlock,
                    durationBlocks: form.durationType === 'fixed' ? String(durationBlocks) : '',
                    memo: form.memo || undefined,
                });
                markDraftPending(newDraftId, txId);
            }

            navigate('/dashboard?tab=streams');
        } catch (err: unknown) {
            toast.dismiss();
            toast.error(friendlyError(err instanceof Error ? err.message : String(err)));
        } finally {
            setSubmitting(false);
        }
    }, [walletAddress, address, submitting, form, parsedAmount, grossAmount, parsedRate, endBlock, network, customToken, tokenValidation, recipientValidation, navigate, editingDraftId, customTokenSymbol, durationBlocks, currentBlock]);

    const approved = approveStatus === 'done';

    const handleSaveDraft = useCallback(() => {
        const tok = selectedToken;
        const draftId = saveStreamDraft({
            draftId: editingDraftId ?? undefined,
            senderAddress: address?.toHex() ?? '',
            tokenAddress: form.tokenAddress,
            tokenSymbol: tok?.symbol ?? customTokenSymbol ?? '',
            tokenIcon: tok?.icon ?? '',
            recipient: form.recipient,
            totalAmount: form.totalAmount,
            ratePerBlock: form.ratePerBlock,
            durationBlocks: form.durationType === 'fixed' ? String(durationBlocks) : '',
            memo: form.memo || undefined,
        });
        setEditingDraftId(draftId);
        toast.success('Draft saved');
    }, [form, selectedToken, customTokenSymbol, editingDraftId, durationBlocks, address]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!approved) {
            setStep('approve');
            void handleApprove();
        } else {
            void handleCreate();
        }
    }, [approved, handleApprove, handleCreate]);

    const inputCls = 'w-full px-4 py-2.5 bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded-lg text-[var(--ink-dark)] placeholder:text-[var(--ink-light)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors';
    const labelCls = 'block text-sm font-serif font-medium text-[var(--ink-dark)] mb-1.5';

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-serif text-[var(--ink-dark)] mb-8 text-center">Create Stream</h1>

            {!walletAddress && (
                <div className="mb-6 px-4 py-3 bg-[var(--paper-card-dark)] border border-[var(--stamp-orange)] rounded-lg text-center text-[var(--stamp-orange)] text-sm">
                    Connect your wallet to create a payment stream.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form */}
                <PaperCard>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Token */}
                        <div>
                            <label className={labelCls}>Stream Token</label>
                            {!customToken ? (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        {knownTokens.map((token) => (
                                            <button key={token.address} type="button"
                                                onClick={() => updateField('tokenAddress', token.address)}
                                                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all ${
                                                    form.tokenAddress === token.address
                                                        ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--ink-dark)] ring-1 ring-[var(--accent-gold)]'
                                                        : 'border-[var(--border-paper)] text-[var(--ink-medium)] hover:border-[var(--accent-gold)]'
                                                }`}>
                                                <span className="text-lg">{token.icon}</span>
                                                <div>
                                                    <span className="block text-sm font-medium">{token.symbol}</span>
                                                    <span className="block text-xs opacity-60">{token.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {walletAddress && form.tokenAddress && (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--paper-bg)] rounded-lg border border-[var(--border-paper)]">
                                            <span className="text-xs text-[var(--ink-light)]">Wallet balance:</span>
                                            {balanceLoading ? (
                                                <span className="text-xs text-[var(--ink-light)] animate-pulse">Loading...</span>
                                            ) : tokenBalance !== null ? (
                                                <span className="text-sm font-mono font-medium text-[var(--ink-dark)]">
                                                    {formatTokenAmount(tokenBalance, decimals)} {selectedToken?.symbol ?? customTokenSymbol ?? ''}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-[var(--ink-light)]">--</span>
                                            )}
                                        </div>
                                    )}
                                    <button type="button" onClick={() => setCustomToken(true)}
                                        className="text-xs text-[var(--accent-gold)] hover:underline">
                                        Use custom token address
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <input type="text" value={form.tokenAddress}
                                        onChange={(e) => updateField('tokenAddress', e.target.value)}
                                        placeholder="0x... or opt1..." required className={inputCls} />
                                    {form.tokenAddress && !tokenValidation.isValid && tokenValidation.error && (
                                        <p className="text-xs text-[var(--stamp-red)]">{tokenValidation.error}</p>
                                    )}
                                    {walletAddress && form.tokenAddress && tokenValidation.isValid && (
                                        <div className="flex items-center justify-between px-3 py-2 bg-[var(--paper-bg)] rounded-lg border border-[var(--border-paper)]">
                                            <div className="flex items-center gap-2">
                                                {balanceLoading ? (
                                                    <span className="text-xs text-[var(--ink-light)] animate-pulse">Loading token info...</span>
                                                ) : customTokenName ? (
                                                    <span className="text-sm font-medium text-[var(--ink-dark)]">
                                                        {customTokenName}{customTokenSymbol ? ` (${customTokenSymbol})` : ''}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-[var(--ink-light)]">Unknown token</span>
                                                )}
                                            </div>
                                            <div>
                                                {balanceLoading ? null : tokenBalance !== null ? (
                                                    <span className="text-sm font-mono font-medium text-[var(--ink-dark)]">
                                                        {formatTokenAmount(tokenBalance, decimals)} {customTokenSymbol ?? ''}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-[var(--ink-light)]">--</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <button type="button" onClick={() => { setCustomToken(false); updateField('tokenAddress', ''); }}
                                        className="text-xs text-[var(--accent-gold)] hover:underline">
                                        Back to token list
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Recipient */}
                        <div>
                            <label htmlFor="recipient" className={labelCls}>Recipient</label>
                            <input id="recipient" type="text" value={form.recipient}
                                onChange={(e) => updateField('recipient', e.target.value)}
                                placeholder="opt1... or 0x..." required className={inputCls} />
                            {form.recipient && !recipientValidation.isValid && recipientValidation.error && (
                                <p className="text-xs text-[var(--stamp-red)] mt-1">{recipientValidation.error}</p>
                            )}
                        </div>

                        {/* Total Deposit */}
                        <div>
                            <label htmlFor="totalAmount" className={labelCls}>
                                Total Deposit {tokenSymbol ? `(${tokenSymbol})` : ''}
                            </label>
                            <input id="totalAmount" type="text" inputMode="decimal"
                                value={form.totalAmount}
                                onChange={(e) => updateField('totalAmount', e.target.value)}
                                placeholder="0.00" required
                                className={inputCls + ' text-2xl font-mono font-medium'} />
                        </div>

                        {/* Rate per block */}
                        <div>
                            <label htmlFor="ratePerBlock" className={labelCls}>
                                Rate per Block {tokenSymbol ? `(${tokenSymbol})` : ''}
                            </label>
                            <input id="ratePerBlock" type="text" inputMode="decimal"
                                value={form.ratePerBlock}
                                onChange={(e) => updateField('ratePerBlock', e.target.value)}
                                placeholder="0.00" required className={inputCls + ' font-mono'} />
                            <p className="text-xs text-[var(--ink-light)] mt-1.5">
                                ~{BLOCKS_PER_HOUR} blocks/hour &middot; ~{BLOCKS_PER_DAY} blocks/day &middot; ~{BLOCKS_PER_MONTH.toLocaleString()} blocks/month
                            </p>
                            {parsedRate > 0n && (
                                <div className="mt-2 px-3 py-2 bg-[var(--paper-bg)] rounded-lg border border-[var(--border-paper)]">
                                    <p className="text-xs text-[var(--ink-medium)]">
                                        ≈ {formatTokenAmount(ratePerHour, decimals)} ${tokenSymbol}/hr
                                        &middot; {formatTokenAmount(ratePerDay, decimals)} ${tokenSymbol}/day
                                        &middot; {formatTokenAmount(ratePerMonth, decimals)} ${tokenSymbol}/month
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Duration */}
                        <div>
                            <label className={labelCls}>Duration</label>
                            <div className="flex gap-2 mb-3">
                                <button type="button"
                                    onClick={() => updateField('durationType', 'infinite')}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        form.durationType === 'infinite'
                                            ? 'bg-[var(--accent-gold)] text-white'
                                            : 'border border-[var(--border-paper)] text-[var(--ink-medium)] hover:border-[var(--accent-gold)]'
                                    }`}>
                                    Until Exhausted
                                </button>
                                <button type="button"
                                    onClick={() => updateField('durationType', 'fixed')}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        form.durationType === 'fixed'
                                            ? 'bg-[var(--accent-gold)] text-white'
                                            : 'border border-[var(--border-paper)] text-[var(--ink-medium)] hover:border-[var(--accent-gold)]'
                                    }`}>
                                    Fixed Duration
                                </button>
                            </div>
                            {form.durationType === 'fixed' && (
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        {DURATION_PRESETS.map((p) => (
                                            <button key={p.key} type="button"
                                                onClick={() => setDurationPreset(p.key)}
                                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                                    durationPreset === p.key
                                                        ? 'bg-[var(--accent-gold)] text-white'
                                                        : 'border border-[var(--border-paper)] text-[var(--ink-medium)] hover:border-[var(--accent-gold)]'
                                                }`}>
                                                {p.label}
                                            </button>
                                        ))}
                                        <button type="button"
                                            onClick={() => setDurationPreset('custom')}
                                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                                durationPreset === 'custom'
                                                    ? 'bg-[var(--accent-gold)] text-white'
                                                    : 'border border-[var(--border-paper)] text-[var(--ink-medium)] hover:border-[var(--accent-gold)]'
                                            }`}>
                                            Custom
                                        </button>
                                    </div>
                                    {durationPreset === 'custom' && (
                                        <input id="durationBlocks" type="number" value={form.durationBlocks}
                                            onChange={(e) => updateField('durationBlocks', e.target.value)}
                                            placeholder="Number of blocks" min="1" className={inputCls + ' font-mono text-sm'} />
                                    )}
                                    {durationBlocks > 0 && (
                                        <p className="text-xs text-[var(--ink-medium)] mt-1">
                                            <span className="font-mono font-medium">{durationBlocks.toLocaleString()} blocks</span>
                                            {durationTimeEstimate && (
                                                <span className="text-[var(--ink-light)]"> ({durationTimeEstimate})</span>
                                            )}
                                            <span className="text-[var(--ink-light)]"> from confirmation</span>
                                        </p>
                                    )}
                                    <p className="text-xs text-[var(--ink-light)] italic">
                                        Block times average ~10 min but vary. Duration is approximate.
                                    </p>
                                </div>
                            )}
                            {form.durationType === 'infinite' && (
                                <div className="px-3 py-2.5 bg-[var(--paper-bg)] rounded-lg border border-[var(--border-paper)] space-y-1.5">
                                    <p className="text-xs text-[var(--ink-medium)]">
                                        Streams until deposit runs out or you cancel. No fixed end block.
                                    </p>
                                    {estimatedBlocks > 0n && (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm text-[var(--ink-dark)] font-medium font-mono">
                                                {estimatedBlocks.toString()} blocks
                                            </span>
                                            {estimatedTimeLabel && (
                                                <span className="text-xs text-[var(--ink-light)] italic">
                                                    ({estimatedTimeLabel})
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {estimatedBlocks > 0n && (
                                        <p className="text-[10px] text-[var(--ink-light)]">
                                            Time is estimated — block intervals average ~10 min but vary.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Memo (encrypted, off-chain) */}
                        <div>
                            <label htmlFor="memo" className={labelCls}>Memo <span className="text-[var(--ink-light)] font-normal">(optional)</span></label>
                            <textarea id="memo" value={form.memo}
                                onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value.slice(0, 200) }))}
                                placeholder="Private note for the recipient…"
                                rows={2}
                                className={inputCls + ' resize-none'} />
                            <p className="mt-1 text-[10px] text-[var(--ink-light)] flex items-center gap-1">
                                <span>🔒</span>
                                Encrypted — only you and the recipient can read this memo.
                                <span className="ml-auto font-mono">{form.memo.length}/200</span>
                            </p>
                        </div>

                        {/* Fee breakdown — fee is added on top, recipient receives the full amount */}
                        {parsedAmount > 0n && (
                            <div className="px-4 py-3 bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded-lg space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--ink-medium)]">Recipient receives</span>
                                    <span className="font-mono font-medium text-[var(--ink-dark)]">
                                        {formatTokenAmount(parsedAmount, decimals)} {tokenSymbol}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-[var(--ink-light)]">
                                    <span>Platform fee ({FEE_PERCENT})</span>
                                    <span className="font-mono">+{formatTokenAmount(feeAmount, decimals)} {tokenSymbol}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-1.5 border-t border-dashed border-[var(--border-paper)]">
                                    <span className="text-[var(--ink-dark)] font-medium">Total debited</span>
                                    <span className="font-mono font-semibold text-[var(--ink-dark)]">
                                        {formatTokenAmount(grossAmount, decimals)} {tokenSymbol}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Submit + Draft */}
                        <div className="pt-4 border-t border-[var(--border-paper)] space-y-3">
                            {/* Save Draft link */}
                            <button type="button" onClick={handleSaveDraft}
                                disabled={!form.tokenAddress && !form.recipient && !form.totalAmount}
                                className="w-full text-center text-sm text-[var(--accent-gold)] hover:text-[var(--accent-gold-light)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                {editingDraftId ? '💾 Update Draft' : '💾 Save as Draft'}
                            </button>
                            {!approved ? (
                                <>
                                    {approveStatus !== 'broadcast' && (
                                        <label className="flex items-center gap-2 cursor-pointer px-1">
                                            <input type="checkbox" checked={unlimitedApproval}
                                                onChange={(e) => setUnlimitedApproval(e.target.checked)}
                                                className="w-3.5 h-3.5 accent-[var(--accent-gold)] cursor-pointer" />
                                            <span className="text-xs text-[var(--ink-light)]">
                                                Unlimited approval <span className="italic">(skip this step for future streams)</span>
                                            </span>
                                        </label>
                                    )}
                                    <button type="submit"
                                        disabled={!walletAddress || approveStatus === 'processing' || approveStatus === 'broadcast' || !form.tokenAddress || !form.totalAmount || !form.ratePerBlock || !form.recipient}
                                        className="w-full py-3.5 bg-[var(--accent-gold)] text-white font-medium rounded-lg text-lg hover:bg-[var(--accent-gold-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]">
                                        {approveStatus === 'processing' ? 'Sending Approval...'
                                            : approveStatus === 'broadcast' ? 'Waiting for Confirmation...'
                                            : approveStatus === 'error' ? 'Retry Approval'
                                            : 'Step 1: Approve Token'}
                                    </button>
                                    {approveStatus === 'broadcast' && (
                                        <p className="text-xs text-[var(--accent-gold)] text-center animate-pulse">
                                            Approval broadcast — waiting for block confirmation (~10 min)
                                        </p>
                                    )}
                                </>
                            ) : (
                                <button type="submit"
                                    disabled={!walletAddress || submitting}
                                    className="w-full py-3.5 bg-[var(--stamp-green)] text-white font-medium rounded-lg text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]">
                                    {submitting ? 'Creating Stream...' : 'Step 2: Create Stream'}
                                </button>
                            )}
                            <div className="flex items-center gap-3 justify-center">
                                <div className={`w-3 h-3 rounded-full border-2 ${
                                    approved ? 'border-[var(--stamp-green)] bg-[var(--stamp-green)]'
                                    : approveStatus === 'broadcast' ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)] animate-pulse'
                                    : 'border-[var(--accent-gold)] bg-[var(--accent-gold)]'
                                }`} />
                                <div className={`w-8 h-0.5 ${approved ? 'bg-[var(--stamp-green)]' : 'bg-[var(--border-paper)]'}`} />
                                <div className={`w-3 h-3 rounded-full border-2 ${approved ? 'border-[var(--stamp-green)] bg-[var(--stamp-green)]' : 'border-[var(--border-paper)]'}`} />
                            </div>
                        </div>
                    </form>
                </PaperCard>

                {/* Live Preview */}
                <div className="hidden md:block">
                    <div className="sticky top-8">
                        <p className="text-xs uppercase tracking-widest text-[var(--ink-light)] font-medium mb-3 text-center">Live Preview</p>
                        <PaperCard className="relative">
                            <div className="flex items-start justify-between mb-4 pb-3 border-b border-[var(--border-paper)]">
                                <div>
                                    <h3 className="text-xl font-serif text-[var(--ink-dark)]">STREAM</h3>
                                    <p className="text-xs text-[var(--ink-light)] mt-0.5">
                                        From: {walletAddress ? formatAddress(walletAddress) : 'Connect wallet'}
                                    </p>
                                </div>
                                <span className="stamp stamp-pending">DRAFT</span>
                            </div>

                            {/* Stream flow visualization */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-[var(--ink-light)] mb-1">
                                    <span>Progress</span>
                                    <span>0%</span>
                                </div>
                                <div className="w-full h-2.5 bg-[var(--paper-bg)] rounded-full border border-[var(--border-paper)] overflow-hidden">
                                    <div className="stream-progress-bar h-full" style={{ width: '15%' }} />
                                </div>
                            </div>

                            <div className="mb-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--ink-light)]">Token</span>
                                    <span className="font-mono text-[var(--ink-dark)]">
                                        {selectedToken ? (
                                            <span className="flex items-center gap-1"><span>{selectedToken.icon}</span><span>{selectedToken.symbol}</span></span>
                                        ) : customTokenSymbol ? customTokenSymbol
                                        : form.tokenAddress ? formatAddress(form.tokenAddress)
                                        : (<span className="text-[var(--ink-light)] italic">Select token</span>)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-[var(--ink-light)]">Total Deposit</span>
                                    <span className={`font-mono text-right ${parsedAmount > 0n ? 'text-[var(--ink-dark)] font-bold text-xl' : 'text-[var(--ink-light)] italic text-sm'}`}>
                                        {parsedAmount > 0n ? formatTokenAmount(parsedAmount, decimals) : '0.00'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--ink-light)]">Rate</span>
                                    <span className="font-mono text-[var(--ink-dark)]">
                                        {parsedRate > 0n ? `${formatTokenAmount(parsedRate, decimals)}/block` : '--'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-[var(--ink-light)]">To</span>
                                <span className={`text-xs ${form.recipient ? 'font-mono text-[var(--ink-dark)]' : 'text-[var(--ink-light)] italic'}`}>
                                    {form.recipient ? formatAddress(form.recipient) : 'Required'}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-[var(--ink-light)]">Duration</span>
                                <span className="font-mono text-xs text-[var(--ink-dark)]">
                                    {form.durationType === 'infinite'
                                        ? (estimatedBlocks > 0n
                                            ? <>{estimatedBlocks.toString()} blocks <span className="text-[var(--ink-light)] italic">({estimatedTimeLabel})</span></>
                                            : 'Until deposit runs out')
                                        : durationBlocks > 0 ? <>{durationBlocks.toLocaleString()} blocks {durationTimeEstimate && <span className="text-[var(--ink-light)] italic">({durationTimeEstimate})</span>}</> : '--'}
                                </span>
                            </div>

                            {parsedAmount > 0n && (
                                <div className="mt-4 pt-3 border-t border-dashed border-[var(--border-paper)]">
                                    <div className="flex justify-between text-xs text-[var(--ink-light)]">
                                        <span>Fee ({FEE_PERCENT})</span>
                                        <span className="font-mono">+{formatTokenAmount(feeAmount, decimals)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs mt-1">
                                        <span className="text-[var(--ink-dark)] font-medium">Total debited</span>
                                        <span className="font-mono font-semibold text-[var(--ink-dark)]">
                                            {formatTokenAmount(grossAmount, decimals)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Ink flow metaphor */}
                            {parsedRate > 0n && (
                                <div className="mt-4 pt-3 border-t border-[var(--border-paper)]">
                                    <p className="text-[10px] uppercase tracking-widest text-[var(--ink-light)] font-medium mb-2">Streaming Rate</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1 bg-[var(--paper-bg)] rounded-full border border-[var(--border-paper)] overflow-hidden">
                                            <div className="stream-progress-bar h-full" style={{ width: '100%' }} />
                                        </div>
                                        <span className="text-xs font-mono text-[var(--accent-gold)] whitespace-nowrap">
                                            {formatTokenAmount(ratePerDay, decimals)} {tokenSymbol}/day
                                        </span>
                                    </div>
                                </div>
                            )}
                        </PaperCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
