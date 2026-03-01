import { useState, useCallback } from 'react';
import { useWalletConnect } from '@btc-vision/walletconnect';
import { PaperCard } from '../components/common/PaperCard';

interface FormLineItem {
    readonly description: string;
    readonly amount: string;
}

interface InvoiceFormData {
    readonly tokenAddress: string;
    readonly totalAmount: string;
    readonly recipient: string;
    readonly memo: string;
    readonly deadline: string;
    readonly taxRate: string;
    readonly lineItems: readonly FormLineItem[];
}

const INITIAL_FORM: InvoiceFormData = {
    tokenAddress: '',
    totalAmount: '',
    recipient: '',
    memo: '',
    deadline: '',
    taxRate: '',
    lineItems: [],
};

const MAX_LINE_ITEMS = 10;

export function CreateInvoice(): React.JSX.Element {
    const { walletAddress } = useWalletConnect();
    const [form, setForm] = useState<InvoiceFormData>(INITIAL_FORM);
    const [showDetails, setShowDetails] = useState(false);

    const updateField = useCallback(<K extends keyof InvoiceFormData>(
        field: K,
        value: InvoiceFormData[K],
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const addLineItem = useCallback(() => {
        setForm((prev) => {
            if (prev.lineItems.length >= MAX_LINE_ITEMS) return prev;
            return {
                ...prev,
                lineItems: [...prev.lineItems, { description: '', amount: '' }],
            };
        });
    }, []);

    const removeLineItem = useCallback((index: number) => {
        setForm((prev) => ({
            ...prev,
            lineItems: prev.lineItems.filter((_, i) => i !== index),
        }));
    }, []);

    const updateLineItem = useCallback((index: number, field: keyof FormLineItem, value: string) => {
        setForm((prev) => ({
            ...prev,
            lineItems: prev.lineItems.map((item, i) =>
                i === index ? { ...item, [field]: value } : item,
            ),
        }));
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        if (!walletAddress) {
            return;
        }

        console.log('Invoice Form Data:', {
            tokenAddress: form.tokenAddress,
            totalAmount: form.totalAmount,
            recipient: form.recipient || '(open invoice)',
            memo: form.memo,
            deadline: form.deadline || '0',
            taxRate: form.taxRate || '0',
            lineItems: form.lineItems,
        });
    }, [walletAddress, form]);

    const inputClasses =
        'w-full px-4 py-2.5 bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded-lg text-[var(--ink-dark)] placeholder:text-[var(--ink-light)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors';

    const labelClasses = 'block text-sm font-serif font-medium text-[var(--ink-dark)] mb-1.5';

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-serif text-[var(--ink-dark)] mb-8 text-center">
                Create Invoice
            </h1>

            {!walletAddress && (
                <div className="mb-6 px-4 py-3 bg-[var(--paper-card-dark)] border border-[var(--stamp-orange)] rounded-lg text-center text-[var(--stamp-orange)] text-sm">
                    Please connect your wallet to create an invoice.
                </div>
            )}

            <PaperCard>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Required Fields */}
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="tokenAddress" className={labelClasses}>
                                OP-20 Token Address
                            </label>
                            <input
                                id="tokenAddress"
                                type="text"
                                value={form.tokenAddress}
                                onChange={(e) => updateField('tokenAddress', e.target.value)}
                                placeholder="tb1q...token"
                                required
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label htmlFor="totalAmount" className={labelClasses}>
                                Amount
                            </label>
                            <input
                                id="totalAmount"
                                type="number"
                                value={form.totalAmount}
                                onChange={(e) => updateField('totalAmount', e.target.value)}
                                placeholder="0"
                                required
                                min="0"
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    {/* Collapsible Details Section */}
                    <div className="border-t border-[var(--border-paper)] pt-4">
                        <button
                            type="button"
                            onClick={() => setShowDetails((prev) => !prev)}
                            className="flex items-center gap-2 text-sm font-serif font-medium text-[var(--ink-medium)] hover:text-[var(--accent-gold)] transition-colors w-full"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                            Details
                        </button>

                        {showDetails && (
                            <div className="mt-4 space-y-5">
                                <div>
                                    <label htmlFor="recipient" className={labelClasses}>
                                        Recipient Address
                                    </label>
                                    <input
                                        id="recipient"
                                        type="text"
                                        value={form.recipient}
                                        onChange={(e) => updateField('recipient', e.target.value)}
                                        placeholder="Leave empty for open invoice"
                                        className={inputClasses}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="memo" className={labelClasses}>
                                        Memo
                                    </label>
                                    <textarea
                                        id="memo"
                                        value={form.memo}
                                        onChange={(e) => updateField('memo', e.target.value)}
                                        placeholder="Invoice description or reference"
                                        rows={3}
                                        className={inputClasses + ' resize-none'}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="deadline" className={labelClasses}>
                                            Deadline Block Number
                                        </label>
                                        <input
                                            id="deadline"
                                            type="number"
                                            value={form.deadline}
                                            onChange={(e) => updateField('deadline', e.target.value)}
                                            placeholder="0 = no deadline"
                                            min="0"
                                            className={inputClasses}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="taxRate" className={labelClasses}>
                                            Tax Rate (basis points)
                                        </label>
                                        <input
                                            id="taxRate"
                                            type="number"
                                            value={form.taxRate}
                                            onChange={(e) => updateField('taxRate', e.target.value)}
                                            placeholder="e.g. 2000 = 20%"
                                            min="0"
                                            max="10000"
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>

                                {/* Line Items */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className={labelClasses + ' mb-0'}>
                                            Line Items
                                        </span>
                                        <button
                                            type="button"
                                            onClick={addLineItem}
                                            disabled={form.lineItems.length >= MAX_LINE_ITEMS}
                                            className="text-sm text-[var(--accent-gold)] hover:text-[var(--accent-gold-light)] disabled:text-[var(--ink-light)] disabled:cursor-not-allowed transition-colors"
                                        >
                                            + Add Line Item
                                        </button>
                                    </div>

                                    {form.lineItems.length === 0 && (
                                        <p className="text-sm text-[var(--ink-light)] italic">
                                            No line items added. Click &quot;Add Line Item&quot; to add details.
                                        </p>
                                    )}

                                    {form.lineItems.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 p-3 bg-[var(--paper-bg)] rounded-lg border border-[var(--border-paper)]"
                                        >
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) =>
                                                        updateLineItem(index, 'description', e.target.value)
                                                    }
                                                    placeholder="Description"
                                                    className={inputClasses}
                                                />
                                                <input
                                                    type="number"
                                                    value={item.amount}
                                                    onChange={(e) =>
                                                        updateLineItem(index, 'amount', e.target.value)
                                                    }
                                                    placeholder="Amount"
                                                    min="0"
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeLineItem(index)}
                                                className="mt-1 p-1.5 text-[var(--stamp-red)] hover:bg-[var(--paper-card-dark)] rounded transition-colors"
                                                aria-label="Remove line item"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="pt-4 border-t border-[var(--border-paper)]">
                        <button
                            type="submit"
                            disabled={!walletAddress}
                            className="w-full py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg text-lg hover:bg-[var(--accent-gold-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                        >
                            Create Invoice
                        </button>
                    </div>
                </form>
            </PaperCard>
        </div>
    );
}
