import {
    ABIDataTypes,
    BitcoinAbiTypes,
} from 'opnet';
import type {
    BitcoinInterfaceAbi,
    CallResult,
    BaseContractProperties,
} from 'opnet';

export const BLOCKBILL_ABI: BitcoinInterfaceAbi = [
    {
        name: 'createInvoice',
        type: BitcoinAbiTypes.Function,
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
    },
    {
        name: 'payInvoice',
        type: BitcoinAbiTypes.Function,
        inputs: [{ name: 'invoiceId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
    {
        name: 'cancelInvoice',
        type: BitcoinAbiTypes.Function,
        inputs: [{ name: 'invoiceId', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
    {
        name: 'markAsPaidBTC',
        type: BitcoinAbiTypes.Function,
        inputs: [
            { name: 'invoiceId', type: ABIDataTypes.UINT256 },
            { name: 'btcTxHash', type: ABIDataTypes.STRING },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
    {
        name: 'setFeeRecipient',
        type: BitcoinAbiTypes.Function,
        inputs: [{ name: 'newFeeRecipient', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
    },
    {
        name: 'getInvoice',
        type: BitcoinAbiTypes.Function,
        constant: true,
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
    },
    {
        name: 'getLineItems',
        type: BitcoinAbiTypes.Function,
        constant: true,
        inputs: [{ name: 'invoiceId', type: ABIDataTypes.UINT256 }],
        outputs: [
            { name: 'count', type: ABIDataTypes.UINT16 },
            { name: 'descriptions', type: ABIDataTypes.STRING },
            { name: 'amounts', type: ABIDataTypes.UINT256 },
        ],
    },
    {
        name: 'getInvoicesByCreator',
        type: BitcoinAbiTypes.Function,
        constant: true,
        inputs: [{ name: 'creator', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
    },
    {
        name: 'getInvoicesByRecipient',
        type: BitcoinAbiTypes.Function,
        constant: true,
        inputs: [{ name: 'recipient', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
    },
    {
        name: 'getInvoiceCount',
        type: BitcoinAbiTypes.Function,
        constant: true,
        inputs: [],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
    },
];

// TypeScript interface for type-safe contract interaction
export interface IBlockBillContract extends BaseContractProperties {
    createInvoice(
        token: string, totalAmount: bigint, recipient: string,
        memo: string, deadline: bigint, taxBps: number, lineItemCount: number
    ): Promise<CallResult<{ invoiceId: bigint }, []>>;

    payInvoice(invoiceId: bigint): Promise<CallResult<{ success: boolean }, []>>;
    cancelInvoice(invoiceId: bigint): Promise<CallResult<{ success: boolean }, []>>;
    markAsPaidBTC(invoiceId: bigint, btcTxHash: string): Promise<CallResult<{ success: boolean }, []>>;
    setFeeRecipient(newFeeRecipient: string): Promise<CallResult<{ success: boolean }, []>>;

    getInvoice(invoiceId: bigint): Promise<CallResult<{
        creator: string; token: string; totalAmount: bigint; recipient: string;
        status: number; deadline: bigint; taxBps: number; createdAtBlock: bigint;
        paidBy: string; paidAtBlock: bigint; memo: string; btcTxHash: string;
        lineItemCount: number;
    }, []>>;

    getLineItems(invoiceId: bigint): Promise<CallResult<{
        count: number; descriptions: string; amounts: bigint;
    }, []>>;

    getInvoicesByCreator(creator: string): Promise<CallResult<{ count: bigint }, []>>;
    getInvoicesByRecipient(recipient: string): Promise<CallResult<{ count: bigint }, []>>;
    getInvoiceCount(): Promise<CallResult<{ count: bigint }, []>>;
}
