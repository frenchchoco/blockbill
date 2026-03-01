import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { Address } from '@btc-vision/transaction';
import toast from 'react-hot-toast';
import { PaperCard } from '../components/common/PaperCard';
import { StampBadge } from '../components/common/StampBadge';
import { SealAnimation } from '../components/common/SealAnimation';
import { InvoiceStatus } from '../types/invoice';
import { useNetwork } from '../hooks/useNetwork';
import { contractService } from '../services/ContractService';
import { getKnownTokens, findToken, parseTokenAmount, formatTokenAmount, formatAddress, isBtcToken } from '../config/tokens';
import type { TokenInfo } from '../config/tokens';

interface FormLineItem {
    readonly description: string;
    readonly amount: string;
}

interface InvoiceFormData {
    readonly tokenAddress: string;
    readonly totalAmount: string;
    readonly recipient: string;
    readonly memo: string;
    readonly deadline: string;
    readonly taxPercent: string;
    readonly lineItems: readonly FormLineItem[];
}

const INITIAL_FORM: InvoiceFormData = {
    tokenAddress: '',
    totalAmount: '',
    recipient: '',
    memo: '',
    deadline: '',
    taxPercent: '',
    lineItems: [],
};

const MAX_LINE_ITEMS = 10;

export function CreateInvoice(): React.JSX.Element {
    const { walletAddress, address } = useWalletConnect();
    const { network } = useNetwork();
    const navigate = useNavigate();
    const [form, setForm] = useState<InvoiceFormData>(INITIAL_FORM);
    const [showDetails, setShowDetails] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [customToken, setCustomToken] = useState(false);
    const [showSeal, setShowSeal] = useState(false);
    const [tokenBalance, setTokenBalance] = useState<bigint | null>(null);
    const [onChainDecimals, setOnChainDecimals] = useState<number | null>(null);
    const [balanceLoading, setBalanceLoading] = useState(false);

    const knownTokens = useMemo(() => getKnownTokens(network), [network]);

    const selectedToken: TokenInfo | undefined = useMemo(
        () => findToken(form.tokenAddress, network),
        [form.tokenAddress, network],
    );

    // Use on-chain decimals when available, fallback to config
    const decimals = onChainDecimals ?? selectedToken?.decimals ?? 8;

    const updateField = useCallback(<K extends keyof InvoiceFormData>(
        field: K, value: InvoiceFormData[K],
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const addLineItem = useCallback(() => {
        setForm((prev) => {
            if (prev.lineItems.length >= MAX_LINE_ITEMS) return prev;
            return { ...prev, lineItems: [...prev.lineItems, { description: '', amount: '' }] };
        });
    }, []);

    const removeLineItem = useCallback((index: number) => {
        setForm((prev) => ({
            ...prev, lineItems: prev.lineItems.filter((_, i) => i !== index),
        }));
    }, []);

    const updateLineItem = useCallback((index: number, field: keyof FormLineItem, value: string) => {
        setForm((prev) => ({
            ...prev,
            lineItems: prev.lineItems.map((item, i) => i === index ? { ...item, [field]: value } : item),
        }));
    }, []);

    const taxBps = useMemo(() => Math.round(parseFloat(form.taxPercent || '0') * 100), [form.taxPercent]);

    const parsedAmount = useMemo(
        () => parseTokenAmount(form.totalAmount || '0', decimals),
        [form.totalAmount, decimals],
    );

    const lineItemsTotal = useMemo(() => {
        return form.lineItems.reduce((sum, item) => sum + parseTokenAmount(item.amount || '0', decimals), 0n);
    }, [form.lineItems, decimals]);

    const isBtc = isBtcToken(form.tokenAddress);

    // Fetch token balance and on-chain decimals when token or wallet changes
    useEffect(() => {
        setTokenBalance(null);
        setOnChainDecimals(null);
        if (!address || !form.tokenAddress || isBtcToken(form.tokenAddress)) return;

        let cancelled = false;
        setBalanceLoading(true);

        const fetchBalance = async (): Promise<void> => {
            try {
                // Resolve the token address to hex if needed (e.g. custom P2OP input)
                const resolvedHex = form.tokenAddress.startsWith('0x')
                    ? form.tokenAddress
                    : '0x' + (await contractService.resolveAddress(form.tokenAddress, network, true)).toHex();

                const tokenContract = contractService.getTokenContract(resolvedHex, network);

                // Fetch on-chain decimals first
                const decimalsResult = await tokenContract.decimals();
                if (!cancelled && decimalsResult?.properties) {
                    setOnChainDecimals(decimalsResult.properties.decimals);
                }

                // Fetch balance
                const result = await tokenContract.balanceOf(address);
                if (!cancelled && result?.properties) {
                    setTokenBalance(result.properties.balance ?? 0n);
                }
            } catch (err: unknown) {
                console.error('[BlockBill] Balance fetch failed:', err);
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

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletAddress || submitting) return;
        if (parsedAmount === 0n) { toast.error('Amount must be greater than 0'); return; }
        if (!form.tokenAddress) { toast.error('Please select a token'); return; }

        setSubmitting(true);
        const loadingToast = toast.loading('Creating invoice on-chain...');

        try {
            // Resolve token address to Address object
            const tokenAddr = await contractService.resolveAddress(form.tokenAddress, network, true);

            // Resolve recipient: if empty, use a zero-address placeholder
            const recipientAddr = form.recipient
                ? await contractService.resolveAddress(form.recipient, network, false)
                : Address.dead();

            const contract = contractService.getBlockBillContract(network, address ?? undefined);
            const sim = await contract.createInvoice(
                tokenAddr, parsedAmount, recipientAddr, form.memo || '',
                BigInt(form.deadline || '0'), taxBps, form.lineItems.length,
            );

            await sim.sendTransaction({
                signer: null, mldsaSigner: null,
                refundTo: walletAddress, maximumAllowedSatToSpend: 50000n, network,
            });

            toast.dismiss(loadingToast);
            setShowSeal(true);
        } catch (err: unknown) {
            toast.dismiss(loadingToast);
            toast.error(err instanceof Error ? err.message : 'Transaction failed');
        } finally {
            setSubmitting(false);
        }
    }, [walletAddress, address, submitting, form, parsedAmount, taxBps, network, navigate]);

    const inputCls = 'w-full px-4 py-2.5 bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded-lg text-[var(--ink-dark)] placeholder:text-[var(--ink-light)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors';
    const labelCls = 'block text-sm font-serif font-medium text-[var(--ink-dark)] mb-1.5';

    return (
        <>
        {showSeal && <SealAnimation onComplete={() => navigate('/dashboard')} />}
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-serif text-[var(--ink-dark)] mb-8 text-center">Create Invoice</h1>

            {!walletAddress && (
                <div className="mb-6 px-4 py-3 bg-[var(--paper-card-dark)] border border-[var(--stamp-orange)] rounded-lg text-center text-[var(--stamp-orange)] text-sm">
                    Connect your wallet to create an invoice.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <PaperCard>
                    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
                        {/* Token */}
                        <div>
                            <label className={labelCls}>Payment Token</label>
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
                                                    <span className="block text-xs opacity-60">{isBtcToken(token.address) ? 'Manual settlement' : token.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {/* Token balance display */}
                                    {walletAddress && form.tokenAddress && !isBtc && (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--paper-bg)] rounded-lg border border-[var(--border-paper)]">
                                            <span className="text-xs text-[var(--ink-light)]">Wallet balance:</span>
                                            {balanceLoading ? (
                                                <span className="text-xs text-[var(--ink-light)] animate-pulse">Loading...</span>
                                            ) : tokenBalance !== null ? (
                                                <span className="text-sm font-mono font-medium text-[var(--ink-dark)]">
                                                    {formatTokenAmount(tokenBalance, decimals)} {selectedToken?.symbol ?? ''}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-[var(--ink-light)]">--</span>
                                            )}
                                        </div>
                                    )}
                                    {isBtc && (
                                        <div className="px-3 py-2 bg-[var(--stamp-orange)]/10 border border-[var(--stamp-orange)]/30 rounded-lg">
                                            <p className="text-xs text-[var(--stamp-orange)]">
                                                BTC invoices use manual settlement. The payer sends BTC off-chain, then you mark it as paid with the tx hash.
                                            </p>
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
                                    <button type="button" onClick={() => { setCustomToken(false); updateField('tokenAddress', ''); }}
                                        className="text-xs text-[var(--accent-gold)] hover:underline">
                                        Back to token list
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Amount */}
                        <div>
                            <label htmlFor="totalAmount" className={labelCls}>
                                Amount {selectedToken ? `(${selectedToken.symbol})` : ''}
                            </label>
                            <input id="totalAmount" type="text" inputMode="decimal"
                                value={form.totalAmount}
                                onChange={(e) => updateField('totalAmount', e.target.value)}
                                placeholder="0.00" required
                                className={inputCls + ' text-2xl font-mono font-medium'} />
                        </div>

                        {/* Details Toggle */}
                        <div className="border-t border-[var(--border-paper)] pt-4">
                            <button type="button" onClick={() => setShowDetails(p => !p)}
                                className="flex items-center gap-2 text-sm font-serif font-medium text-[var(--ink-medium)] hover:text-[var(--accent-gold)] transition-colors w-full">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                                Advanced Details
                            </button>

                            {showDetails && (
                                <div className="mt-4 space-y-5">
                                    <div>
                                        <label htmlFor="recipient" className={labelCls}>
                                            Recipient <span className="text-xs font-normal text-[var(--ink-light)]">(empty = open invoice)</span>
                                        </label>
                                        <input id="recipient" type="text" value={form.recipient}
                                            onChange={(e) => updateField('recipient', e.target.value)}
                                            placeholder="opt1... or leave empty" className={inputCls} />
                                    </div>
                                    <div>
                                        <label htmlFor="memo" className={labelCls}>Memo</label>
                                        <textarea id="memo" value={form.memo}
                                            onChange={(e) => updateField('memo', e.target.value)}
                                            placeholder="e.g. Web design project - March 2026"
                                            rows={2} maxLength={200} className={inputCls + ' resize-none'} />
                                        <span className="text-xs text-[var(--ink-light)] mt-1 block text-right">{form.memo.length}/200</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="deadline" className={labelCls}>
                                                Deadline (block #) <span className="text-xs font-normal text-[var(--ink-light)]">optional</span>
                                            </label>
                                            <input id="deadline" type="number" value={form.deadline}
                                                onChange={(e) => updateField('deadline', e.target.value)}
                                                placeholder="No deadline" min="0" className={inputCls} />
                                        </div>
                                        <div>
                                            <label htmlFor="taxPercent" className={labelCls}>
                                                Tax Rate <span className="text-xs font-normal text-[var(--ink-light)]">%</span>
                                            </label>
                                            <input id="taxPercent" type="number" value={form.taxPercent}
                                                onChange={(e) => updateField('taxPercent', e.target.value)}
                                                placeholder="0" min="0" max="100" step="0.01" className={inputCls} />
                                        </div>
                                    </div>
                                    {/* Line Items */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className={labelCls + ' mb-0'}>Line Items</span>
                                            <button type="button" onClick={addLineItem}
                                                disabled={form.lineItems.length >= MAX_LINE_ITEMS}
                                                className="text-sm text-[var(--accent-gold)] hover:text-[var(--accent-gold-light)] disabled:text-[var(--ink-light)] disabled:cursor-not-allowed transition-colors">
                                                + Add Item
                                            </button>
                                        </div>
                                        {form.lineItems.map((item, index) => (
                                            <div key={index} className="flex items-start gap-2 p-3 bg-[var(--paper-bg)] rounded-lg border border-[var(--border-paper)]">
                                                <span className="text-xs text-[var(--ink-light)] mt-3 w-4">{index + 1}</span>
                                                <div className="flex-1 space-y-2">
                                                    <input type="text" value={item.description}
                                                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                                        placeholder="Description" className={inputCls + ' text-sm'} />
                                                    <input type="text" inputMode="decimal" value={item.amount}
                                                        onChange={(e) => updateLineItem(index, 'amount', e.target.value)}
                                                        placeholder="Amount" className={inputCls + ' text-sm font-mono'} />
                                                </div>
                                                <button type="button" onClick={() => removeLineItem(index)}
                                                    className="mt-2 p-1 text-[var(--stamp-red)] hover:bg-[var(--paper-card-dark)] rounded transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="pt-4 border-t border-[var(--border-paper)]">
                            <button type="submit"
                                disabled={!walletAddress || submitting || !form.tokenAddress || !form.totalAmount}
                                className="w-full py-3.5 bg-[var(--accent-gold)] text-white font-medium rounded-lg text-lg hover:bg-[var(--accent-gold-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]">
                                {submitting ? 'Creating...' : 'Create Invoice'}
                            </button>
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
                                    <h3 className="text-xl font-serif text-[var(--ink-dark)]">INVOICE</h3>
                                    <p className="text-xs text-[var(--ink-light)] mt-0.5">
                                        From: {walletAddress ? formatAddress(walletAddress) : 'Connect wallet'}
                                    </p>
                                </div>
                                <StampBadge status={InvoiceStatus.Pending} size="sm" />
                            </div>
                            <div className="mb-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--ink-light)]">Token</span>
                                    <span className="font-mono text-[var(--ink-dark)]">
                                        {selectedToken ? (<span className="flex items-center gap-1"><span>{selectedToken.icon}</span><span>{selectedToken.symbol}</span></span>)
                                            : form.tokenAddress ? formatAddress(form.tokenAddress)
                                            : (<span className="text-[var(--ink-light)] italic">Select token</span>)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-[var(--ink-light)]">Amount</span>
                                    <span className={`font-mono text-right ${parsedAmount > 0n ? 'text-[var(--ink-dark)] font-bold text-xl' : 'text-[var(--ink-light)] italic text-sm'}`}>
                                        {parsedAmount > 0n ? formatTokenAmount(parsedAmount, decimals) : '0.00'}
                                    </span>
                                </div>
                            </div>
                            {form.recipient && (
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-[var(--ink-light)]">To</span>
                                    <span className="font-mono text-[var(--ink-dark)] text-xs">{formatAddress(form.recipient)}</span>
                                </div>
                            )}
                            {form.memo && (
                                <div className="mb-4 p-3 bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded">
                                    <p className="text-xs text-[var(--ink-medium)] italic leading-relaxed">&ldquo;{form.memo}&rdquo;</p>
                                </div>
                            )}
                            {taxBps > 0 && (
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-[var(--ink-light)]">Tax</span>
                                    <span className="font-mono text-[var(--ink-dark)]">{(taxBps / 100).toFixed(taxBps % 100 === 0 ? 0 : 2)}%</span>
                                </div>
                            )}
                            {form.lineItems.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-[var(--border-paper)]">
                                    <p className="text-xs uppercase tracking-wider text-[var(--ink-light)] font-medium mb-2">Line Items</p>
                                    {form.lineItems.map((item, i) => (
                                        <div key={i} className="flex justify-between text-xs py-1">
                                            <span className="text-[var(--ink-medium)] truncate mr-4">{item.description || `Item ${i + 1}`}</span>
                                            <span className="font-mono text-[var(--ink-dark)] shrink-0">{item.amount || '0'}</span>
                                        </div>
                                    ))}
                                    {lineItemsTotal > 0n && parsedAmount > 0n && lineItemsTotal !== parsedAmount && (
                                        <p className="text-xs text-[var(--stamp-orange)] mt-1">Line items total differs from invoice amount</p>
                                    )}
                                </div>
                            )}
                            {parsedAmount > 0n && (
                                <div className="mt-4 pt-3 border-t border-dashed border-[var(--border-paper)]">
                                    <div className="flex justify-between text-xs text-[var(--ink-light)]">
                                        <span>Platform fee (0.5%)</span>
                                        <span className="font-mono">{formatTokenAmount(parsedAmount * 50n / 10000n, decimals)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs mt-1">
                                        <span className="text-[var(--ink-light)]">You receive</span>
                                        <span className="font-mono font-medium text-[var(--ink-dark)]">
                                            {formatTokenAmount(parsedAmount - (parsedAmount * 50n / 10000n), decimals)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </PaperCard>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
