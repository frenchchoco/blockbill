import { useState, useCallback, useEffect } from 'react';
import { useWalletConnect } from '@btc-vision/walletconnect';
import toast from 'react-hot-toast';
import { PaperCard } from '../components/common/PaperCard';
import { useNetwork } from '../hooks/useNetwork';
import { contractService } from '../services/ContractService';
import { providerService } from '../services/ProviderService';
import { friendlyError, isUserCancel } from '../utils/errors';
import { useSendTransaction } from '../hooks/useSendTransaction';

export function Admin(): React.JSX.Element {
    const { walletAddress, address } = useWalletConnect();
    const { network } = useNetwork();

    const [newRecipient, setNewRecipient] = useState('');
    const [addrActive, setAddrActive] = useState<'idle' | 'checking' | 'active' | 'inactive'>('idle');
    const [invoiceStatus, setInvoiceStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
    const [streamStatus, setStreamStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
    const [invoiceTxId, setInvoiceTxId] = useState<string | null>(null);
    const [streamTxId, setStreamTxId] = useState<string | null>(null);
    const { sendWithFeeSelector, FeeSheet } = useSendTransaction();

    /* ── Validate target address is active on OPNet ──────────── */
    useEffect(() => {
        if (!newRecipient.trim()) {
            setAddrActive('idle');
            return;
        }
        let cancelled = false;
        setAddrActive('checking');

        const check = async (): Promise<void> => {
            try {
                const provider = providerService.getProvider(network);
                const infoMap = await provider.getPublicKeysInfo(newRecipient.trim(), false);
                if (cancelled) return;
                const hasKey = Object.keys(infoMap).length > 0;
                setAddrActive(hasKey ? 'active' : 'inactive');
            } catch {
                if (!cancelled) setAddrActive('inactive');
            }
        };

        const timer = setTimeout(() => void check(), 500);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [newRecipient, network]);

    /* ── Set fee recipient on Invoice contract ───────────────── */
    const setOnInvoice = useCallback(async () => {
        if (!walletAddress || !address || addrActive !== 'active') return;
        setInvoiceStatus('sending');
        setInvoiceTxId(null);
        try {
            const recipientAddr = await contractService.resolveAddress(newRecipient.trim(), network, false);
            const contract = contractService.getBlockBillContract(network, address);
            const simulation = await contract.setFeeRecipient(recipientAddr);
            if (simulation.revert) throw new Error(friendlyError(simulation.revert));
            const receipt = await sendWithFeeSelector(simulation, { refundTo: walletAddress, network });
            setInvoiceTxId(receipt.transactionId);
            setInvoiceStatus('done');
            toast.success('Invoice contract: fee recipient updated!');
        } catch (err: unknown) {
            if (isUserCancel(err)) { setInvoiceStatus('idle'); return; }
            setInvoiceStatus('error');
            toast.error(friendlyError(err instanceof Error ? err.message : 'Failed'));
        }
    }, [walletAddress, address, newRecipient, network, addrActive, sendWithFeeSelector]);

    /* ── Set fee recipient on Stream contract ────────────────── */
    const setOnStream = useCallback(async () => {
        if (!walletAddress || !address || addrActive !== 'active') return;
        setStreamStatus('sending');
        setStreamTxId(null);
        try {
            const recipientAddr = await contractService.resolveAddress(newRecipient.trim(), network, false);
            const contract = contractService.getStreamContract(network, address);
            const simulation = await contract.setFeeRecipient(recipientAddr);
            if (simulation.revert) throw new Error(friendlyError(simulation.revert));
            const receipt = await sendWithFeeSelector(simulation, { refundTo: walletAddress, network });
            setStreamTxId(receipt.transactionId);
            setStreamStatus('done');
            toast.success('Stream contract: fee recipient updated!');
        } catch (err: unknown) {
            if (isUserCancel(err)) { setStreamStatus('idle'); return; }
            setStreamStatus('error');
            toast.error(friendlyError(err instanceof Error ? err.message : 'Failed'));
        }
    }, [walletAddress, address, newRecipient, network, addrActive, sendWithFeeSelector]);

    /* ── Both at once ────────────────────────────────────────── */
    const setBoth = useCallback(async () => {
        await setOnInvoice();
        await setOnStream();
    }, [setOnInvoice, setOnStream]);

    /* ── Render ───────────────────────────────────────────────── */
    if (!walletAddress) {
        return (
            <div className="max-w-xl mx-auto py-20 text-center">
                <PaperCard>
                    <p className="text-[var(--ink-medium)] font-serif">Connect your wallet to access admin.</p>
                </PaperCard>
            </div>
        );
    }

    const canSend = addrActive === 'active' && invoiceStatus !== 'sending' && streamStatus !== 'sending';

    return (
        <div className="max-w-xl mx-auto py-10 space-y-6">
            {FeeSheet}
            <PaperCard>
                <h1 className="text-2xl font-serif text-[var(--ink-dark)] mb-1">Admin — Fee Recipient</h1>
                <p className="text-sm text-[var(--ink-light)] mb-2">
                    Redirect the 0.5% platform fee to a new address on both contracts.
                </p>
                <p className="text-xs text-[var(--ink-light)] mb-6 italic">
                    Only the contract owner can execute this. If you're not the owner, the transaction will revert.
                </p>

                {/* ── Address input ──────────────────────────── */}
                <label className="block text-sm font-medium text-[var(--ink-medium)] mb-1">
                    New fee recipient (P2OP / taproot / hex)
                </label>
                <input
                    type="text"
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]/40"
                    placeholder="opt1... or 0x..."
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                />

                {/* ── Active check feedback ──────────────────── */}
                <div className="mt-2 min-h-[20px]">
                    {addrActive === 'checking' && (
                        <p className="text-xs text-[var(--ink-light)] animate-pulse">Checking if address is active on OPNet…</p>
                    )}
                    {addrActive === 'inactive' && (
                        <p className="text-xs text-[var(--stamp-red)]">
                            ✕ This address is not active on OPNet. Redirecting fees here will cause all future transactions to revert.
                        </p>
                    )}
                    {addrActive === 'active' && (
                        <p className="text-xs text-[var(--stamp-green)]">✓ Address is active on OPNet</p>
                    )}
                </div>

                {/* ── Action buttons ─────────────────────────── */}
                <div className="mt-6 space-y-3">
                    <button
                        onClick={setBoth}
                        disabled={!canSend}
                        className="w-full py-3 rounded-lg font-medium text-white bg-[var(--accent-gold)] hover:bg-[var(--accent-gold-light)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {invoiceStatus === 'sending' || streamStatus === 'sending'
                            ? 'Sending…'
                            : 'Set on both contracts'}
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={setOnInvoice}
                            disabled={!canSend}
                            className="flex-1 py-2 rounded-lg text-sm font-medium border border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Invoice only
                        </button>
                        <button
                            onClick={setOnStream}
                            disabled={!canSend}
                            className="flex-1 py-2 rounded-lg text-sm font-medium border border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Stream only
                        </button>
                    </div>
                </div>

                {/* ── TX results ──────────────────────────────── */}
                {(invoiceTxId || streamTxId) && (
                    <div className="mt-6 space-y-2 text-xs">
                        {invoiceTxId && (
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--stamp-green)]">✓ Invoice:</span>
                                <a
                                    href={`https://mempool.opnet.org/fr/testnet4/tx/${invoiceTxId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-[var(--accent-gold)] hover:underline truncate"
                                >
                                    {invoiceTxId.slice(0, 12)}…{invoiceTxId.slice(-6)}
                                </a>
                            </div>
                        )}
                        {streamTxId && (
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--stamp-green)]">✓ Stream:</span>
                                <a
                                    href={`https://mempool.opnet.org/fr/testnet4/tx/${streamTxId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-[var(--accent-gold)] hover:underline truncate"
                                >
                                    {streamTxId.slice(0, 12)}…{streamTxId.slice(-6)}
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </PaperCard>
        </div>
    );
}
