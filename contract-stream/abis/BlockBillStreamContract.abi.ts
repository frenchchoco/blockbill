import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const BlockBillStreamContractEvents = [];

export const BlockBillStreamContractAbi = [
    {
        name: 'createStream',
        inputs: [
            { name: 'recipient', type: ABIDataTypes.ADDRESS },
            { name: 'token', type: ABIDataTypes.ADDRESS },
            { name: 'totalAmount', type: ABIDataTypes.UINT256 },
            { name: 'ratePerBlock', type: ABIDataTypes.UINT256 },
            { name: 'endBlock', type: ABIDataTypes.UINT64 },
        ],
        outputs: [{ name: 'streamId', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'withdraw',
        inputs: [{ name: 'streamId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'withdrawTo',
        inputs: [
            { name: 'streamId', type: ABIDataTypes.UINT256 },
            { name: 'to', type: ABIDataTypes.ADDRESS },
        ],
        outputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'topUp',
        inputs: [
            { name: 'streamId', type: ABIDataTypes.UINT256 },
            { name: 'amount', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'cancelStream',
        inputs: [{ name: 'streamId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'pauseStream',
        inputs: [{ name: 'streamId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'resumeStream',
        inputs: [{ name: 'streamId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'setFeeRecipient',
        inputs: [{ name: 'newFeeRecipient', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getStream',
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
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getWithdrawable',
        inputs: [{ name: 'streamId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'withdrawable', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getStreamsBySender',
        inputs: [{ name: 'sender', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getStreamsByRecipient',
        inputs: [{ name: 'recipient', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getStreamCount',
        inputs: [],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    ...BlockBillStreamContractEvents,
    ...OP_NET_ABI,
];

export default BlockBillStreamContractAbi;
