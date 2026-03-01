interface PaperCardProps {
    readonly children: React.ReactNode;
    readonly className?: string;
}

export function PaperCard({ children, className = '' }: PaperCardProps): React.JSX.Element {
    return (
        <div className={`bg-[var(--paper-card)] border border-[var(--border-paper)] rounded-lg shadow-md p-6 paper-texture ${className}`}>
            {children}
        </div>
    );
}
