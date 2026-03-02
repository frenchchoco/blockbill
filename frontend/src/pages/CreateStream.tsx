import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';
import toast from 'react-hot-toast';
import { PaperCard } from '../components/common/PaperCard';
import { StreamStatus, getStreamStatusLabel, getStreamStampClass } from '../types/stream';
import { useNetwork } from '../hooks/useNetwork';
import { useAddressValidation } from '../hooks/useAddressValidation';
import { contractService } from '../services/ContractService';
import { providerService } from '../services/ProviderService';
import { getKnownTokens, findToken, parseTokenAmount, formatTokenAmount, formatAddress } from '../config/tokens';
import type { TokenInfo } from '../config/tokens';
import { friendlyError } from '../utils/errors';

interface StreamFormData {
    readonly tokenAddress: string;
    readonly recipient: string;
    readonly totalAmount: string;
    readonly ratePerBlock: string;
    readonly durationType: 'infinite' | 'fixed';
    readonly durationBlocks: string;
    readonly durationDays: string;
}

const INITIAL_FORM: StreamFormData = {
    tokenAddress: '',
    recipient: '',
    totalAmount: '',
    ratePerBlock: '',
    durationType: 'infinite',
    durationBlocks: '',
    durationDays: '',
};

// Bitcoin block time estimates
const BLOCKS_PER_HOUR = 6;
const BLOCKS_PER_DAY = 144;
const BLOCKS_PER_MONTH = 4320;

export function CreateStream(): React.JSX.Element {
    const { walletAddress, address } = useWalletConnect();
    const { network } = useNetwork();
    const navigate = useNavigate();
    const [form, setForm] = useState<StreamFormData>(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState<'form' | 'approve' | 'create'>('form');
    const [customToken, setCustomToken] = useState(false);
    const [tokenBalance, setTokenBalance] = useState<bigint | null>(null);
    const [onChainDecimals, setOnChainDecimals] = useState<number | null>(null);
    const [customTokenName, setCustomTokenName] = useState<string | null>(null);
    const [customTokenSymbol, setCustomTokenSymbol] = useState<string | null>(null);
    const [balanceLoading, setBalanceLoading] = useState(false);
    const [approving, setApproving] = useState(false);
    const [approved, setApproved] = useState(false);

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
                    : '0x' + (await contractService.resolveAddress(form.tokenAddress, network, true)).toHex();

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
        setApproved(false);
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

    const endBlock = useMemo(() => {
        if (form.durationType === 'infinite') return 0n;
        if (form.durationBlocks) return BigInt(form.durationBlocks);
        if (form.durationDays) return BigInt(Math.round(Number(form.durationDays) * BLOCKS_PER_DAY));
        return 0n;
    }, [form.durationType, form.durationBlocks, form.durationDays]);

    const feeAmount = useMemo(() => parsedAmount * 50n / 10000n, [parsedAmount]);
    const netAmount = useMemo(() => parsedAmount - feeAmount, [parsedAmount, feeAmount]);

    // Rate display helpers
    const ratePerHour = useMemo(() => parsedRate * BigInt(BLOCKS_PER_HOUR), [parsedRate]);
    const ratePerDay = useMemo(() => parsedRate * BigInt(BLOCKS_PER_DAY), [parsedRate]);
    const ratePerMonth = useMemo(() => parsedRate * BigInt(BLOCKS_PER_MONTH), [parsedRate]);

    const tokenSymbol = selectedToken?.symbol ?? customTokenSymbol ?? '';

    const handleApprove = useCallback(async () => {
        if (!walletAddress || !address || !form.tokenAddress || parsedAmount === 0n) return;
        setApproving(true);

        try {
            const resolvedHex = form.tokenAddress.startsWith('0x')
                ? form.tokenAddress
                : '0x' + (await contractService.resolveAddress(form.tokenAddress, network, true)).toHex();

            const { getBlockBillStreamAddress } = await import('../config/contracts');
            const streamContractAddr = getBlockBillStreamAddress(network);

            const tokenContract = contractService.getTokenContract(resolvedHex, network, address);
            const spender = (await import('@btc-vision/transaction')).Address.fromString(streamContractAddr);

            const simulation = await tokenContract.approve(spender, parsedAmount);
            if (simulation.revert) throw new Error(friendlyError(simulation.revert));

            toast.loading('Approve token spending in your wallet...');
            await simulation.sendTransaction({
                signer: null,
                mldsaSigner: null,
                refundTo: walletAddress,
                maximumAllowedSatToSpend: 100_000n,
                network,
            });

            toast.dismiss();
            toast.success('Token approved! Now create the stream.');
            setApproved(true);
            setStep('create');
        } catch (err: unknown) {
            toast.dismiss();
            toast.error(friendlyError(err instanceof Error ? err.message : String(err)));
        } finally {
            setApproving(false);
        }
    }, [walletAddress, address, form.tokenAddress, parsedAmount, network]);

    const handleCreate = useCallback(async () => {
        if (!walletAddress || !address || submitting) return;
        if (parsedAmount === 0n) { toast.error('Amount must be greater than 0'); return; }
        if (parsedRate === 0n) { toast.error('Rate per block must be greater than 0'); return; }
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

            const simulation = await contract.createStream(
                recipientAddr, tokenAddr, parsedAmount, parsedRate, endBlock,
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
                maximumAllowedSatToSpend: 100_000n,
                network,
            });

            toast.dismiss(submitToast);
            toast.success('Stream created! Waiting for confirmation...');

            // Poll for the stream ID
            const txId = receipt.transactionId;
            const provider = providerService.getProvider(network);

            let confirmed = false;
            for (let attempt = 1; attempt <= 12; attempt++) {
                await new Promise((r) => setTimeout(r, 5000));
                try {
                    const tx = await provider.getTransaction(txId);
                    if (tx) { confirmed = true; break; }
                } catch {
                    // polling error, will retry
                }
            }

            if (confirmed) {
                toast.success('Stream confirmed on Bitcoin L1!');
            }
            navigate('/streams');
        } catch (err: unknown) {
            toast.dismiss();
            toast.error(friendlyError(err instanceof Error ? err.message : String(err)));
        } finally {
            setSubmitting(false);
        }
    }, [walletAddress, address, submitting, form, parsedAmount, parsedRate, endBlock, network, customToken, tokenValidation, recipientValidation, navigate]);

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                                        ≈ {formatTokenAmount(ratePerHour, decimals)} {tokenSymbol}/hour
                                        &middot; {formatTokenAmount(ratePerDay, decimals)} {tokenSymbol}/day
                                        &middot; {formatTokenAmount(ratePerMonth, decimals)} {tokenSymbol}/month
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
                                    Infinite
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
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="durationBlocks" className="text-xs text-[var(--ink-light)] mb-1 block">Blocks</label>
                                        <input id="durationBlocks" type="number" value={form.durationBlocks}
                                            onChange={(e) => { updateField('durationBlocks', e.target.value); updateField('durationDays', ''); }}
                                            placeholder="e.g. 1440" min="1" className={inputCls + ' font-mono text-sm'} />
                                    </div>
                                    <div>
                                        <label htmlFor="durationDays" className="text-xs text-[var(--ink-light)] mb-1 block">or Days</label>
                                        <input id="durationDays" type="number" value={form.durationDays}
                                            onChange={(e) => { updateField('durationDays', e.target.value); updateField('durationBlocks', ''); }}
                                            placeholder="e.g. 30" min="1" step="0.1" className={inputCls + ' font-mono text-sm'} />
                                    </div>
                                </div>
                            )}
                            {form.durationType === 'infinite' && (
                                <p className="text-xs text-[var(--ink-light)] italic px-1">
                                    Stream runs until deposit is exhausted or sender cancels.
                                </p>
                            )}
                        </div>

                        {/* Fee preview */}
                        {parsedAmount > 0n && (
                            <div className="px-4 py-3 bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded-lg space-y-1.5">
                                <div className="flex justify-between text-xs text-[var(--ink-light)]">
                                    <span>Platform fee (0.5%)</span>
                                    <span className="font-mono">{formatTokenAmount(feeAmount, decimals)} {tokenSymbol}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--ink-medium)]">Recipient receives</span>
                                    <span className="font-mono font-medium text-[var(--ink-dark)]">
                                        {formatTokenAmount(netAmount, decimals)} {tokenSymbol}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="pt-4 border-t border-[var(--border-paper)] space-y-3">
                            {!approved ? (
                                <button type="submit"
                                    disabled={!walletAddress || approving || !form.tokenAddress || !form.totalAmount || !form.ratePerBlock || !form.recipient}
                                    className="w-full py-3.5 bg-[var(--accent-gold)] text-white font-medium rounded-lg text-lg hover:bg-[var(--accent-gold-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]">
                                    {approving ? 'Approving Token...' : 'Step 1: Approve Token'}
                                </button>
                            ) : (
                                <button type="submit"
                                    disabled={!walletAddress || submitting}
                                    className="w-full py-3.5 bg-[var(--stamp-green)] text-white font-medium rounded-lg text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]">
                                    {submitting ? 'Creating Stream...' : 'Step 2: Create Stream'}
                                </button>
                            )}
                            <div className="flex items-center gap-3 justify-center">
                                <div className={`w-3 h-3 rounded-full border-2 ${!approved ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]' : 'border-[var(--stamp-green)] bg-[var(--stamp-green)]'}`} />
                                <div className={`w-8 h-0.5 ${approved ? 'bg-[var(--stamp-green)]' : 'bg-[var(--border-paper)]'}`} />
                                <div className={`w-3 h-3 rounded-full border-2 ${approved ? 'border-[var(--stamp-green)] bg-[var(--stamp-green)]' : 'border-[var(--border-paper)]'}`} />
                            </div>
                        </div>
                    </form>
                </PaperCard>

                {/* Live Preview */}
                <div className="hidden lg:block">
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
                                <span className={getStreamStampClass(StreamStatus.Active)}>
                                    {getStreamStatusLabel(StreamStatus.Active)}
                                </span>
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
                                    {form.durationType === 'infinite' ? 'Infinite' : endBlock > 0n ? `${endBlock.toString()} blocks` : '--'}
                                </span>
                            </div>

                            {parsedAmount > 0n && (
                                <div className="mt-4 pt-3 border-t border-dashed border-[var(--border-paper)]">
                                    <div className="flex justify-between text-xs text-[var(--ink-light)]">
                                        <span>Platform fee (0.5%)</span>
                                        <span className="font-mono">{formatTokenAmount(feeAmount, decimals)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs mt-1">
                                        <span className="text-[var(--ink-light)]">Net to recipient</span>
                                        <span className="font-mono font-medium text-[var(--ink-dark)]">
                                            {formatTokenAmount(netAmount, decimals)}
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
