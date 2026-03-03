import { networks } from '@btc-vision/bitcoin';
import type { Network } from '@btc-vision/bitcoin';

export interface NetworkConfig {
    readonly name: string;
    readonly rpcUrl: string;
    readonly explorerUrl: string;
    /** Max sats the wallet may spend on gas per transaction. */
    readonly maxGasSats: bigint;
}

/** Stable string key for Network objects — avoids reference equality issues with Map<Network>. */
export function networkKey(n: Network): string {
    return n.bech32Opnet ?? n.bech32;
}

const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
    [networkKey(networks.bitcoin)]: {
        name: 'Mainnet',
        rpcUrl: 'https://mainnet.opnet.org',
        explorerUrl: 'https://explorer.opnet.org',
        maxGasSats: 800_000n, // 0.008 BTC — headroom for fee spikes
    },
    [networkKey(networks.opnetTestnet)]: {
        name: 'OPNet Testnet',
        rpcUrl: 'https://testnet.opnet.org',
        explorerUrl: 'https://testnet-explorer.opnet.org',
        maxGasSats: 1_000_000n,
    },
    [networkKey(networks.regtest)]: {
        name: 'Regtest',
        rpcUrl: 'http://localhost:9001',
        explorerUrl: 'http://localhost:3000',
        maxGasSats: 100_000n,
    },
};

export function getRpcUrl(network: Network): string {
    const config = NETWORK_CONFIGS[networkKey(network)];
    if (!config) {
        throw new Error(`Unsupported network (key=${networkKey(network)})`);
    }
    return config.rpcUrl;
}

export function getNetworkName(network: Network): string {
    return NETWORK_CONFIGS[networkKey(network)]?.name ?? 'Unknown';
}

export function getExplorerUrl(network: Network): string {
    return NETWORK_CONFIGS[networkKey(network)]?.explorerUrl ?? '';
}

/** localStorage key for user gas override. */
function gasOverrideKey(network: Network): string {
    return `bb_gas_override_${networkKey(network)}`;
}

/** Return the default (config-level) max gas sats — used by the UI presets. */
export function getDefaultMaxGasSats(network: Network): bigint {
    return NETWORK_CONFIGS[networkKey(network)]?.maxGasSats ?? 100_000n;
}

/** Max sats the wallet is allowed to spend on gas for a single transaction.
 *  Reads a user override from localStorage first, falls back to network default. */
export function getMaxGasSats(network: Network): bigint {
    try {
        const raw = localStorage.getItem(gasOverrideKey(network));
        if (raw) {
            const parsed = BigInt(raw);
            if (parsed >= 10_000n && parsed <= 10_000_000n) return parsed;
        }
    } catch {
        /* ignore invalid values */
    }
    return getDefaultMaxGasSats(network);
}

/** Persist a user-chosen gas override. */
export function setMaxGasSatsOverride(network: Network, sats: bigint): void {
    localStorage.setItem(gasOverrideKey(network), sats.toString());
}

/** Remove the user override so the network default is used. */
export function clearMaxGasSatsOverride(network: Network): void {
    localStorage.removeItem(gasOverrideKey(network));
}

/* ── Fee Rate (sats/vByte) ────────────────────────────────────── */

function feeRateOverrideKey(network: Network): string {
    return `bb_feerate_override_${networkKey(network)}`;
}

/** Get the user-chosen fee rate in sats/vByte, or undefined to let the wallet decide. */
export function getFeeRateOverride(network: Network): number | undefined {
    try {
        const raw = localStorage.getItem(feeRateOverrideKey(network));
        if (raw) {
            const parsed = Number(raw);
            if (parsed >= 1 && parsed <= 2000 && Number.isFinite(parsed)) return parsed;
        }
    } catch {
        /* ignore */
    }
    return undefined;
}

/** Persist a fee rate override (sats/vByte). */
export function setFeeRateOverride(network: Network, rate: number): void {
    localStorage.setItem(feeRateOverrideKey(network), rate.toString());
}

/** Remove fee rate override. */
export function clearFeeRateOverride(network: Network): void {
    localStorage.removeItem(feeRateOverrideKey(network));
}

/* ── Convenience: all gas params for sendTransaction ─────────── */

/** Returns gas params ready to spread into sendTransaction().
 *  Includes priorityFee (required by OP_WALLET for OPNet interactions). */
export function getTxGasParams(network: Network): {
    maximumAllowedSatToSpend: bigint;
    feeRate: number;
    priorityFee: bigint;
} {
    const feeRate = getFeeRateOverride(network) ?? 1;
    return {
        maximumAllowedSatToSpend: getMaxGasSats(network),
        feeRate,
        priorityFee: 1_000n,
    };
}
