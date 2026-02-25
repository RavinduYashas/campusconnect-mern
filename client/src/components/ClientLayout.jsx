import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const ClientLayout = () => {
    return (
        <div className="app-container min-h-screen flex flex-col bg-bg-main">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-8">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default ClientLayout;
