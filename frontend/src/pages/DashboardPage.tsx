import { useSearchParams } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { StreamDashboard } from './StreamDashboard';

type DashboardTab = 'invoices' | 'streams';

export function DashboardPage(): React.JSX.Element {
    const [searchParams, setSearchParams] = useSearchParams();
    const tab: DashboardTab = searchParams.get('tab') === 'streams' ? 'streams' : 'invoices';

    return (
        <>
            <div className="max-w-4xl mx-auto mb-6">
                <h1 className="text-3xl font-serif text-[var(--ink-dark)] mb-6 text-center">Dashboard</h1>
                <div className="flex justify-center">
                    <div className="inline-flex bg-[var(--paper-bg)] border border-[var(--border-paper)] rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => setSearchParams({})}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                                tab === 'invoices'
                                    ? 'bg-[var(--paper-card)] text-[var(--ink-dark)] shadow-sm font-semibold'
                                    : 'text-[var(--ink-light)] hover:text-[var(--ink-medium)]'
                            }`}
                        >
                            Invoices
                        </button>
                        <button
                            type="button"
                            onClick={() => setSearchParams({ tab: 'streams' })}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                                tab === 'streams'
                                    ? 'bg-[var(--paper-card)] text-[var(--ink-dark)] shadow-sm font-semibold'
                                    : 'text-[var(--ink-light)] hover:text-[var(--ink-medium)]'
                            }`}
                        >
                            Streams
                        </button>
                    </div>
                </div>
            </div>
            {tab === 'invoices' ? <Dashboard /> : <StreamDashboard />}
        </>
    );
}
