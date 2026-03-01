import { networks } from '@btc-vision/bitcoin';
import type { Network } from '@btc-vision/bitcoin';
import { networkKey } from './networks';

export interface TokenInfo {
    readonly address: string;
    readonly symbol: string;
    readonly name: string;
    readonly decimals: number;
    readonly icon: string;
}

const MOTO_TOKEN_TESTNET: TokenInfo = {
    address: '0xfd4473840751d58d9f8b73bdd57d6c5260453d5518bd7cd02d0a4cf3df9bf4dd',
    symbol: 'MOTO',
    name: 'MOTO Token',
    decimals: 8,
    icon: '\uD83C\uDFCD',
};

const BLOCK_TOKEN_TESTNET: TokenInfo = {
    address: '0x62b1338225dfce319f56600d8de6ce34e3e141c970a91f39f7ce2d5cd6d23076',
    symbol: 'BLOCK',
    name: 'BLOCK Token',
    decimals: 8,
    icon: '\uD83E\uDDF1',
};

const TESTNET_TOKENS: readonly TokenInfo[] = [
    MOTO_TOKEN_TESTNET,
    BLOCK_TOKEN_TESTNET,
];

const REGTEST_TOKENS: readonly TokenInfo[] = [
    {
        address: '0xfb7df2f08d8042d4df0506c0d4cee3cfa5f2d7b02ef01ec76dd699551393a438',
        symbol: 'PILL',
        name: 'PILL Token',
        decimals: 8,
        icon: '\uD83D\uDC8A',
    },
    {
        address: '0x0a6732489a31e6de07917a28ff7df311fc5f98f6e1664943ac1c3fe7893bdab5',
        symbol: 'MOTO',
        name: 'MOTO Token',
        decimals: 8,
        icon: '\uD83C\uDFCD',
    },
];

const TOKEN_MAP: Record<string, readonly TokenInfo[]> = {
    [networkKey(networks.opnetTestnet)]: TESTNET_TOKENS,
    [networkKey(networks.regtest)]: REGTEST_TOKENS,
    [networkKey(networks.bitcoin)]: [],
};

export function getKnownTokens(network: Network): readonly TokenInfo[] {
    return TOKEN_MAP[networkKey(network)] ?? [];
}

export function findToken(address: string, network: Network): TokenInfo | undefined {
    return getKnownTokens(network).find((t) => t.address === address);
}

export function formatTokenAmount(amount: bigint, decimals: number): string {
    if (decimals === 0) return amount.toString();
    const divisor = 10n ** BigInt(decimals);
    const whole = amount / divisor;
    const frac = amount % divisor;
    const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
    if (fracStr.length === 0) return whole.toString();
    return `${whole.toString()}.${fracStr}`;
}

export function parseTokenAmount(value: string, decimals: number): bigint {
    if (!value || value === '0') return 0n;
    const parts = value.split('.');
    const whole = BigInt(parts[0] || '0');
    const fracStr = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals);
    const frac = BigInt(fracStr);
    return whole * (10n ** BigInt(decimals)) + frac;
}

export function formatAddress(addr: string): string {
    if (!addr || addr.length <= 16) return addr || '--';
    return `${addr.slice(0, 8)}\u2026${addr.slice(-6)}`;
}
