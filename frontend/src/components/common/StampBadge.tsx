import { InvoiceStatus, getStatusLabel, getStampClass } from '../../types/invoice';

interface StampBadgeProps {
    readonly status: InvoiceStatus;
    readonly size?: 'sm' | 'md' | 'lg';
    readonly expired?: boolean;
}

export function StampBadge({ status, size = 'md', expired }: StampBadgeProps): React.JSX.Element {
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5 border-2',
        md: 'text-sm px-3 py-1 border-3',
        lg: 'text-lg px-4 py-2 border-4',
    };

    return (
        <span className={`${getStampClass(status, expired)} ${sizeClasses[size]}`}>
            {getStatusLabel(status, expired)}
        </span>
    );
}
