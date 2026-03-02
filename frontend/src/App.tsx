import { Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { CreateInvoice } from './pages/CreateInvoice';
import { InvoiceView } from './pages/InvoiceView';
import { PayInvoice } from './pages/PayInvoice';
import { Dashboard } from './pages/Dashboard';
import { Receipt } from './pages/Receipt';
import { HowTo } from './pages/HowTo';
import { PaperCard } from './components/common/PaperCard';

function NotFound(): React.JSX.Element {
    return (
        <div className="max-w-2xl mx-auto text-center py-20">
            <PaperCard>
                <h1 className="text-6xl font-serif text-[var(--accent-gold)] mb-4">404</h1>
                <p className="text-lg text-[var(--ink-medium)] mb-6 font-serif">Page not found</p>
                <Link to="/" className="inline-flex items-center px-6 py-3 bg-[var(--accent-gold)] text-white font-medium rounded-lg hover:bg-[var(--accent-gold-light)] transition-colors shadow-md">
                    Back to Home
                </Link>
            </PaperCard>
        </div>
    );
}

function App(): React.JSX.Element {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/create" element={<CreateInvoice />} />
                <Route path="/invoice/:id" element={<InvoiceView />} />
                <Route path="/pay/:id" element={<PayInvoice />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/invoice/:id/receipt" element={<Receipt />} />
                <Route path="/guide" element={<HowTo />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Layout>
    );
}

export default App;
