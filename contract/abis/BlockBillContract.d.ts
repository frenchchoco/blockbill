import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the createInvoice function call.
 */
export type CreateInvoice = CallResult<
    {
        invoiceId: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the payInvoice function call.
 */
export type PayInvoice = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the cancelInvoice function call.
 */
export type CancelInvoice = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the markAsPaidBTC function call.
 */
export type MarkAsPaidBTC = CallResult<
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
 * @description Represents the result of the getInvoice function call.
 */
export type GetInvoice = CallResult<
    {
        creator: Address;
        token: Address;
        totalAmount: bigint;
        recipient: Address;
        status: number;
        deadline: bigint;
        taxBps: number;
        createdAtBlock: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getLineItems function call.
 */
export type GetLineItems = CallResult<
    {
        count: number;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getInvoicesByCreator function call.
 */
export type GetInvoicesByCreator = CallResult<
    {
        count: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getInvoicesByRecipient function call.
 */
export type GetInvoicesByRecipient = CallResult<
    {
        count: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getInvoiceCount function call.
 */
export type GetInvoiceCount = CallResult<
    {
        count: bigint;
    },
    OPNetEvent<never>[]
>;

// ------------------------------------------------------------------
// IBlockBillContract
// ------------------------------------------------------------------
export interface IBlockBillContract extends IOP_NETContract {
    createInvoice(
        token: Address,
        totalAmount: bigint,
        recipient: Address,
        memo: string,
        deadline: bigint,
        taxBps: number,
        lineItemCount: number,
    ): Promise<CreateInvoice>;
    payInvoice(invoiceId: bigint): Promise<PayInvoice>;
    cancelInvoice(invoiceId: bigint): Promise<CancelInvoice>;
    markAsPaidBTC(invoiceId: bigint, btcTxHash: string): Promise<MarkAsPaidBTC>;
    setFeeRecipient(newFeeRecipient: Address): Promise<SetFeeRecipient>;
    getInvoice(invoiceId: bigint): Promise<GetInvoice>;
    getLineItems(invoiceId: bigint): Promise<GetLineItems>;
    getInvoicesByCreator(creator: Address): Promise<GetInvoicesByCreator>;
    getInvoicesByRecipient(recipient: Address): Promise<GetInvoicesByRecipient>;
    getInvoiceCount(): Promise<GetInvoiceCount>;
}
