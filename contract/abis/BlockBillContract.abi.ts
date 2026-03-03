import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const BlockBillContractEvents = [];

export const BlockBillContractAbi = [
    {
        name: 'createInvoice',
        inputs: [
            { name: 'token', type: ABIDataTypes.ADDRESS },
            { name: 'totalAmount', type: ABIDataTypes.UINT256 },
            { name: 'recipient', type: ABIDataTypes.ADDRESS },
            { name: 'memo', type: ABIDataTypes.STRING },
            { name: 'deadline', type: ABIDataTypes.UINT64 },
            { name: 'taxBps', type: ABIDataTypes.UINT16 },
            { name: 'lineItemCount', type: ABIDataTypes.UINT16 },
        ],
        outputs: [{ name: 'invoiceId', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'payInvoice',
        inputs: [{ name: 'invoiceId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'markAsPaidBTC',
        inputs: [
            { name: 'invoiceId', type: ABIDataTypes.UINT256 },
            { name: 'btcTxHash', type: ABIDataTypes.STRING },
        ],
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
        name: 'getInvoice',
        inputs: [{ name: 'invoiceId', type: ABIDataTypes.UINT256 }],
        outputs: [
            { name: 'creator', type: ABIDataTypes.ADDRESS },
            { name: 'token', type: ABIDataTypes.ADDRESS },
            { name: 'totalAmount', type: ABIDataTypes.UINT256 },
            { name: 'recipient', type: ABIDataTypes.ADDRESS },
            { name: 'status', type: ABIDataTypes.UINT8 },
            { name: 'deadline', type: ABIDataTypes.UINT64 },
            { name: 'taxBps', type: ABIDataTypes.UINT16 },
            { name: 'createdAtBlock', type: ABIDataTypes.UINT64 },
            { name: 'paidBy', type: ABIDataTypes.ADDRESS },
            { name: 'paidAtBlock', type: ABIDataTypes.UINT64 },
            { name: 'memo', type: ABIDataTypes.STRING },
            { name: 'btcTxHash', type: ABIDataTypes.STRING },
            { name: 'lineItemCount', type: ABIDataTypes.UINT16 },
        ],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getLineItems',
        inputs: [{ name: 'invoiceId', type: ABIDataTypes.UINT256 }],
        outputs: [
            { name: 'count', type: ABIDataTypes.UINT16 },
            { name: 'descriptions', type: ABIDataTypes.STRING },
            { name: 'amounts', type: ABIDataTypes.UINT256 },
        ],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getInvoicesByCreator',
        inputs: [{ name: 'creator', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getInvoicesByRecipient',
        inputs: [{ name: 'recipient', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getInvoiceCount',
        inputs: [],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    ...BlockBillContractEvents,
    ...OP_NET_ABI,
];

export default BlockBillContractAbi;
