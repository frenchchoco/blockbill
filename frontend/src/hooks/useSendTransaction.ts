import { useState, useCallback, useRef } from 'react';
import type { Network } from '@btc-vision/bitcoin';
import { fetchLiveFeeRates, getTxGasParams } from '../config/networks';
import type { LiveFeeRates } from '../config/networks';
import { FeeConfirmSheet } from '../components/common/FeeConfirmSheet';

export interface SendOptions {
    readonly refundTo: string;
    readonly network: Network;
    /** Enforce a minimum fee tier (e.g. 'medium' disables Economy). */
    readonly minTier?: 'low' | 'medium' | 'high';
}

/** The minimal shape returned by simulation.sendTransaction(). */
interface SendReceipt {
    readonly transactionId: string;
}

/** The minimal shape of a simulation that can call sendTransaction. */
interface Simulation {
    sendTransaction(params: {
        signer: null;
        mldsaSigner: null;
        refundTo: string;
        feeRate: number;
        priorityFee: bigint;
        maximumAllowedSatToSpend: bigint;
        network: Network;
    }): Promise<SendReceipt>;
}

/** Function signature exposed by this hook — drop-in replacement for sendTransaction. */
export type SendWithFeeSelectorFn = (
    simulation: Simulation,
    options: SendOptions,
) => Promise<SendReceipt>;

interface PendingTx {
    simulation: Simulation;
    options: SendOptions;
    resolve: (receipt: SendReceipt) => void;
    reject: (err: Error) => void;
}

interface UseSendTransactionReturn {
    /** Call this instead of simulation.sendTransaction(). */
    readonly sendWithFeeSelector: SendWithFeeSelectorFn;
    /** Render this JSX element in your component's return. */
    readonly FeeSheet: React.JSX.Element | null;
}

export function useSendTransaction(): UseSendTransactionReturn {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [liveRates, setLiveRates] = useState<LiveFeeRates | null>(null);
    const [defaultRate, setDefaultRate] = useState(15);
    const [minTier, setMinTier] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
    const pendingRef = useRef<PendingTx | null>(null);

    const sendWithFeeSelector: SendWithFeeSelectorFn = useCallback(
        (simulation, options) => {
            return new Promise<SendReceipt>((resolve, reject) => {
                pendingRef.current = { simulation, options, resolve, reject };

                // Get current default rate for pre-selection
                const gasParams = getTxGasParams(options.network);
                setDefaultRate(gasParams.feeRate);
                setMinTier(options.minTier);

                // Open the sheet and fetch live rates
                setLoading(true);
                setLiveRates(null);
                setOpen(true);

                fetchLiveFeeRates(options.network)
                    .then((rates) => { setLiveRates(rates); setLoading(false); })
                    .catch(() => setLoading(false));
            });
        },
        [],
    );

    const handleConfirm = useCallback(async (feeRate: number) => {
        const pending = pendingRef.current;
        if (!pending) return;

        setOpen(false);
        pendingRef.current = null;

        try {
            const gasParams = getTxGasParams(pending.options.network);
            const receipt = await pending.simulation.sendTransaction({
                signer: null,
                mldsaSigner: null,
                refundTo: pending.options.refundTo,
                feeRate,
                priorityFee: gasParams.priorityFee,
                maximumAllowedSatToSpend: gasParams.maximumAllowedSatToSpend,
                network: pending.options.network,
            });
            pending.resolve(receipt);
        } catch (err) {
            pending.reject(err instanceof Error ? err : new Error(String(err)));
        }
    }, []);

    const handleCancel = useCallback(() => {
        setOpen(false);
        const pending = pendingRef.current;
        pendingRef.current = null;
        pending?.reject(new Error('Transaction cancelled'));
    }, []);

    const FeeSheet = FeeConfirmSheet({
        open,
        liveRates,
        loading,
        defaultFeeRate: defaultRate,
        minTier,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
    });

    return { sendWithFeeSelector, FeeSheet };
}
