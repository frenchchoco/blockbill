import {
    ABIDataTypes,
    BitcoinAbiTypes,
} from 'opnet';
import type {
    BitcoinInterfaceAbi,
    CallResult,
    BaseContractProperties,
} from 'opnet';
import type { Address } from '@btc-vision/transaction';

export const BLOCKBILL_STREAM_ABI: BitcoinInterfaceAbi = [
    // =====================================================
    // Write methods
    // =====================================================
    {
        name: 'createStream',
        type: BitcoinAbiTypes.Function,
        inputs: [
            { name: 'recipient', type: ABIDataTypes.ADDRESS },
            { name: 'token', type: ABIDataTypes.ADDRESS },
            { name: 'totalAmount', type: ABIDataTypes.UINT256 },
            { name: 'ratePerBlock', type: ABIDataTypes.UINT256 },
            { name: 'endBlock', type: ABIDataTypes.UINT64 },
        ],
        outputs: [{ name: 'streamId', type: ABIDataTypes.UINT256 }],
    },
    {
        name: 'withdraw',
        type: BitcoinAbiTypes.Function,
        inputs: [{ name: 'streamId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
    },
    {
        name: 'withdrawTo',
        type: BitcoinAbiTypes.Function,
        inputs: [
            { name: 'streamId', type: ABIDataTypes.UINT256 },
            { name: 'to', type: ABIDataTypes.ADDRESS },
        ],
        outputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
    },
    {
        name: 'topUp',
        type: BitcoinAbiTypes.Function,
        inputs: [
            { name: 'streamId', type: ABIDataTypes.UINT256 },
            { name: 'amount', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
    {
        name: 'cancelStream',
        type: BitcoinAbiTypes.Function,
        inputs: [{ name: 'streamId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
    {
        name: 'pauseStream',
        type: BitcoinAbiTypes.Function,
        inputs: [{ name: 'streamId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
    {
        name: 'resumeStream',
        type: BitcoinAbiTypes.Function,
        inputs: [{ name: 'streamId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
    {
        name: 'setFeeRecipient',
        type: BitcoinAbiTypes.Function,
        inputs: [{ name: 'newFeeRecipient', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
    // =====================================================
    // Read methods (constant: true)
    // =====================================================
    {
        name: 'getStream',
        type: BitcoinAbiTypes.Function,
        constant: true,
        inputs: [{ name: 'streamId', type: ABIDataTypes.UINT256 }],
        outputs: [
            { name: 'sender', type: ABIDataTypes.ADDRESS },
            { name: 'recipient', type: ABIDataTypes.ADDRESS },
            { name: 'token', type: ABIDataTypes.ADDRESS },
            { name: 'totalDeposited', type: ABIDataTypes.UINT256 },
            { name: 'totalWithdrawn', type: ABIDataTypes.UINT256 },
            { name: 'ratePerBlock', type: ABIDataTypes.UINT256 },
            { name: 'startBlock', type: ABIDataTypes.UINT64 },
            { name: 'endBlock', type: ABIDataTypes.UINT64 },
            { name: 'lastWithdrawBlock', type: ABIDataTypes.UINT64 },
            { name: 'pausedAtBlock', type: ABIDataTypes.UINT64 },
            { name: 'accumulatedBeforePause', type: ABIDataTypes.UINT256 },
            { name: 'status', type: ABIDataTypes.UINT8 },
        ],
    },
    {
        name: 'getWithdrawable',
        type: BitcoinAbiTypes.Function,
        constant: true,
        inputs: [{ name: 'streamId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'withdrawable', type: ABIDataTypes.UINT256 }],
    },
    {
        name: 'getStreamsBySender',
        type: BitcoinAbiTypes.Function,
        constant: true,
        inputs: [{ name: 'sender', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
    },
    {
        name: 'getStreamsByRecipient',
        type: BitcoinAbiTypes.Function,
        constant: true,
        inputs: [{ name: 'recipient', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
    },
    {
        name: 'getStreamCount',
        type: BitcoinAbiTypes.Function,
        constant: true,
        inputs: [],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
    },
];

// TypeScript interface for type-safe contract interaction
// All ABIDataTypes.ADDRESS params MUST be Address objects at runtime.
export interface IBlockBillStreamContract extends BaseContractProperties {
    createStream(
        recipient: Address, token: Address, totalAmount: bigint,
        ratePerBlock: bigint, endBlock: bigint
    ): Promise<CallResult<{ streamId: bigint }, []>>;

    withdraw(streamId: bigint): Promise<CallResult<{ amount: bigint }, []>>;
    withdrawTo(streamId: bigint, to: Address): Promise<CallResult<{ amount: bigint }, []>>;
    topUp(streamId: bigint, amount: bigint): Promise<CallResult<{ success: boolean }, []>>;
    cancelStream(streamId: bigint): Promise<CallResult<{ success: boolean }, []>>;
    pauseStream(streamId: bigint): Promise<CallResult<{ success: boolean }, []>>;
    resumeStream(streamId: bigint): Promise<CallResult<{ success: boolean }, []>>;
    setFeeRecipient(newFeeRecipient: Address): Promise<CallResult<{ success: boolean }, []>>;

    getStream(streamId: bigint): Promise<CallResult<{
        sender: Address; recipient: Address; token: Address;
        totalDeposited: bigint; totalWithdrawn: bigint; ratePerBlock: bigint;
        startBlock: bigint; endBlock: bigint; lastWithdrawBlock: bigint;
        pausedAtBlock: bigint; accumulatedBeforePause: bigint; status: number;
    }, []>>;

    getWithdrawable(streamId: bigint): Promise<CallResult<{ withdrawable: bigint }, []>>;
    getStreamsBySender(sender: Address): Promise<CallResult<{ count: bigint }, []>>;
    getStreamsByRecipient(recipient: Address): Promise<CallResult<{ count: bigint }, []>>;
    getStreamCount(): Promise<CallResult<{ count: bigint }, []>>;
}
