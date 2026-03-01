import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { CreateInvoice } from './pages/CreateInvoice';
import { InvoiceView } from './pages/InvoiceView';
import { PayInvoice } from './pages/PayInvoice';
import { Dashboard } from './pages/Dashboard';
import { Receipt } from './pages/Receipt';

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
            </Routes>
        </Layout>
    );
}

export default App;
