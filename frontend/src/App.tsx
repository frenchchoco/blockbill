import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { CreateInvoice } from './pages/CreateInvoice';
import { InvoiceView } from './pages/InvoiceView';

function App(): React.JSX.Element {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/create" element={<CreateInvoice />} />
                <Route path="/invoice/:id" element={<InvoiceView />} />
            </Routes>
        </Layout>
    );
}

export default App;
