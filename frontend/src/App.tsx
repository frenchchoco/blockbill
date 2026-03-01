import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

function App(): React.JSX.Element {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={
                    <div className="text-center py-20">
                        <h1 className="text-4xl font-serif text-[var(--ink-dark)]">BlockBill</h1>
                        <p className="mt-4 text-[var(--ink-medium)]">Trustless Invoicing on Bitcoin L1</p>
                    </div>
                } />
            </Routes>
        </Layout>
    );
}

export default App;
