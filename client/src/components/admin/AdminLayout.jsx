import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Header from '../Header';
import Footer from '../Footer';

const AdminLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-bg-main">
            <Header />

            <div className="flex flex-grow relative">
                {/* Left Sidebar */}
                <AdminSidebar />

                {/* Main Content Area */}
                <main className="flex-grow md:ml-60 transition-all duration-300 flex flex-col">
                    <div className="p-4 md:p-6 max-w-6xl mx-auto flex-grow w-full">
                        <Outlet />
                    </div>
                    {/* Minimal Admin Footer */}
                    <div className="mt-auto py-6 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
                        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-text-secondary">
                            <p>© {new Date().getFullYear()} CampusConnect Admin Panel. Internal Use Only.</p>
                            <div className="flex gap-6">
                                <a href="#" className="hover:text-primary transition-colors">Support</a>
                                <a href="#" className="hover:text-primary transition-colors">Documentation</a>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
