/**
 * Platform fee helpers.
 *
 * The contract deducts 0.5% (50 bps) from the gross amount at execution time.
 * The frontend inflates amounts so the intended net value (what the creator/recipient
 * actually receives) is preserved — the fee is added ON TOP.
 *
 *   gross = net * 10000 / 9950
 *   fee   = gross * 50 / 10000
 *   net   = gross - fee
 */

const FEE_BPS = 50n;
const BPS_DENOMINATOR = 10000n;

/**
 * Given the desired net amount (what the recipient should receive),
 * returns the gross amount that must be sent to the contract.
 *
 * gross = net * 10000 / 9950   →   after 0.5% deduction, the recipient gets `net`.
 */
export function addFeeOnTop(netAmount: bigint): bigint {
    if (netAmount <= 0n) return 0n;
    return (netAmount * BPS_DENOMINATOR) / (BPS_DENOMINATOR - FEE_BPS);
}

/**
 * Calculate the platform fee from a gross amount.
 *
 * fee = gross * 50 / 10000
 */
export function calculateFee(grossAmount: bigint): bigint {
    if (grossAmount <= 0n) return 0n;
    return (grossAmount * FEE_BPS) / BPS_DENOMINATOR;
}

/**
 * Given a gross amount (stored on-chain as totalAmount), returns
 * the net amount the creator/recipient receives after fee deduction.
 *
 * net = gross - fee
 */
export function netFromGross(grossAmount: bigint): bigint {
    return grossAmount - calculateFee(grossAmount);
}

/** Fee rate as a human-readable string. */
export const FEE_PERCENT = '0.5%';
