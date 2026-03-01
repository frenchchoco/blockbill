import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WalletConnectProvider } from '@btc-vision/walletconnect';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ToastProvider } from './components/common/Toast';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
    <StrictMode>
        <WalletConnectProvider>
            <BrowserRouter>
                <App />
                <ToastProvider />
            </BrowserRouter>
        </WalletConnectProvider>
    </StrictMode>
);
