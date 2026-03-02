import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the createStream function call.
 */
export type CreateStream = CallResult<
    {
        streamId: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the withdraw function call.
 */
export type Withdraw = CallResult<
    {
        amount: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the withdrawTo function call.
 */
export type WithdrawTo = CallResult<
    {
        amount: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the topUp function call.
 */
export type TopUp = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the cancelStream function call.
 */
export type CancelStream = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the pauseStream function call.
 */
export type PauseStream = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the resumeStream function call.
 */
export type ResumeStream = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the setFeeRecipient function call.
 */
export type SetFeeRecipient = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getStream function call.
 */
export type GetStream = CallResult<
    {
        sender: Address;
        recipient: Address;
        token: Address;
        totalDeposited: bigint;
        totalWithdrawn: bigint;
        ratePerBlock: bigint;
        startBlock: bigint;
        endBlock: bigint;
        lastWithdrawBlock: bigint;
        pausedAtBlock: bigint;
        accumulatedBeforePause: bigint;
        status: number;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getWithdrawable function call.
 */
export type GetWithdrawable = CallResult<
    {
        withdrawable: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getStreamsBySender function call.
 */
export type GetStreamsBySender = CallResult<
    {
        count: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getStreamsByRecipient function call.
 */
export type GetStreamsByRecipient = CallResult<
    {
        count: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getStreamCount function call.
 */
export type GetStreamCount = CallResult<
    {
        count: bigint;
    },
    OPNetEvent<never>[]
>;

// ------------------------------------------------------------------
// IBlockBillStreamContract
// ------------------------------------------------------------------
export interface IBlockBillStreamContract extends IOP_NETContract {
    createStream(
        recipient: Address,
        token: Address,
        totalAmount: bigint,
        ratePerBlock: bigint,
        endBlock: bigint,
    ): Promise<CreateStream>;
    withdraw(streamId: bigint): Promise<Withdraw>;
    withdrawTo(streamId: bigint, to: Address): Promise<WithdrawTo>;
    topUp(streamId: bigint, amount: bigint): Promise<TopUp>;
    cancelStream(streamId: bigint): Promise<CancelStream>;
    pauseStream(streamId: bigint): Promise<PauseStream>;
    resumeStream(streamId: bigint): Promise<ResumeStream>;
    setFeeRecipient(newFeeRecipient: Address): Promise<SetFeeRecipient>;
    getStream(streamId: bigint): Promise<GetStream>;
    getWithdrawable(streamId: bigint): Promise<GetWithdrawable>;
    getStreamsBySender(sender: Address): Promise<GetStreamsBySender>;
    getStreamsByRecipient(recipient: Address): Promise<GetStreamsByRecipient>;
    getStreamCount(): Promise<GetStreamCount>;
}
