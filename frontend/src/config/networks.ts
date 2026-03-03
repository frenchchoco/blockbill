import { networks } from '@btc-vision/bitcoin';
import type { Network } from '@btc-vision/bitcoin';
import { providerService } from '../services/ProviderService';

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

/* ── Dynamic gas parameters (fetched from RPC, cached) ───────── */

export interface LiveFeeRates {
    readonly low: number;
    readonly medium: number;
    readonly high: number;
    readonly fetchedAt: number;
}

interface CachedGasParams {
    rates: LiveFeeRates;
    feeRate: number;
    priorityFee: bigint;
    fetchedAt: number;
}

const GAS_CACHE_TTL = 60_000; // 60 seconds
const gasCache = new Map<string, CachedGasParams>();

const FALLBACK_FEE_RATE = 2;
const FALLBACK_PRIORITY_FEE = 1_000n;
const FALLBACK_RATES: LiveFeeRates = { low: FALLBACK_FEE_RATE, medium: FALLBACK_FEE_RATE, high: FALLBACK_FEE_RATE, fetchedAt: 0 };

/** Fetch gas parameters from the RPC and cache them.
 *  Called automatically by getTxGasParams; can also be called eagerly. */
export async function refreshGasParams(network: Network): Promise<void> {
    const key = networkKey(network);
    try {
        const provider = providerService.getProvider(network);
        const gas = await provider.gasParameters();
        const prioritySats = gas.gasPerSat > 0n
            ? gas.baseGas / gas.gasPerSat
            : FALLBACK_PRIORITY_FEE;
        const now = Date.now();
        gasCache.set(key, {
            rates: {
                low: Math.ceil(gas.bitcoin.recommended.low),
                medium: Math.ceil(gas.bitcoin.recommended.medium),
                high: Math.ceil(gas.bitcoin.recommended.high),
                fetchedAt: now,
            },
            feeRate: Math.ceil(gas.bitcoin.recommended.medium),
            priorityFee: prioritySats > 0n ? prioritySats : FALLBACK_PRIORITY_FEE,
            fetchedAt: now,
        });
    } catch {
        /* RPC unreachable — keep stale cache or use fallbacks */
    }
}

/** Force-refresh and return live fee rates from the RPC (bypasses cache TTL). */
export async function fetchLiveFeeRates(network: Network): Promise<LiveFeeRates> {
    await refreshGasParams(network);
    const cached = gasCache.get(networkKey(network));
    return cached?.rates ?? FALLBACK_RATES;
}

function getCachedGasParams(network: Network): CachedGasParams {
    const key = networkKey(network);
    const cached = gasCache.get(key);
    if (cached && Date.now() - cached.fetchedAt < GAS_CACHE_TTL) return cached;
    // Trigger async refresh (non-blocking)
    void refreshGasParams(network);
    // Return stale cache if available, otherwise fallbacks
    return cached ?? { rates: FALLBACK_RATES, feeRate: FALLBACK_FEE_RATE, priorityFee: FALLBACK_PRIORITY_FEE, fetchedAt: 0 };
}

/* ── Convenience: all gas params for sendTransaction ─────────── */

/** Returns gas params ready to spread into sendTransaction().
 *  Uses RPC-fetched values when available, user overrides take precedence. */
export function getTxGasParams(network: Network): {
    maximumAllowedSatToSpend: bigint;
    feeRate: number;
    priorityFee: bigint;
} {
    const cached = getCachedGasParams(network);
    return {
        maximumAllowedSatToSpend: getMaxGasSats(network),
        feeRate: getFeeRateOverride(network) ?? cached.feeRate,
        priorityFee: cached.priorityFee,
    };
}
