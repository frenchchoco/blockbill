import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
    readonly children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
    return (
        <div className="min-h-screen flex flex-col relative">
            <Header />
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
}
