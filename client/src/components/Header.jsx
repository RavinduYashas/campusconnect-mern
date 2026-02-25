import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <header className="bg-primary text-white shadow-md sticky top-0 z-50 font-heading">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold tracking-wide hover:text-accent transition-colors">
                    CampusConnect
                </Link>

                <nav className="hidden md:flex space-x-8 text-sm font-medium">
                    <Link to="/" className="hover:text-accent transition-colors">Home</Link>
                    <Link to="/skills" className="hover:text-accent transition-colors">Skills</Link>
                    <Link to="/groups" className="hover:text-accent transition-colors">Study Groups</Link>
                    <Link to="/clubs" className="hover:text-accent transition-colors">Clubs</Link>
                    <Link to="/sports" className="hover:text-accent transition-colors">Sports</Link>
                    <Link to="/qa" className="hover:text-accent transition-colors">Q&A</Link>
                </nav>

                <div className="flex items-center space-x-5">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {user.role === 'admin' && (
                                <Link
                                    to="/admin/dashboard"
                                    className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all group flex items-center justify-center relative shadow-lg hover:scale-110 active:scale-95 border border-white/5"
                                    title="Admin Dashboard"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#EA580C] rounded-full border-2 border-primary shadow-[0_0_8px_rgba(234,88,12,0.6)] animate-pulse"></span>
                                </Link>
                            )}
                            <Link
                                to="/profiles"
                                className={`flex items-center gap-2 group p-1 pr-4 rounded-full transition-all ${user.role === 'admin'
                                    ? 'bg-white/5 border border-[#EA580C]/20 hover:bg-white/10'
                                    : 'hover:bg-white/5'
                                    }`}
                            >
                                <div className="relative shrink-0">
                                    <img
                                        src={user.role === 'admin' ? "/src/assets/images/avatars/admin.png" : (user.avatar || "/src/assets/images/avatars/avatar1.png")}
                                        alt="Profile"
                                        className={`w-9 h-9 rounded-full border-2 object-cover transition-all ${user.role === 'admin'
                                            ? 'border-[#EA580C] shadow-sm'
                                            : 'border-white'
                                            }`}
                                    />
                                    {user.role === 'admin' && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#EA580C] rounded-full border-2 border-primary flex items-center justify-center text-[7px] font-black text-white">
                                            ✓
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-sm font-bold group-hover:text-accent transition-colors">
                                        {user.name.split(' ')[0]}
                                    </span>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-accent' : 'opacity-70 text-white'}`}>
                                        {user.role}
                                    </span>
                                </div>
                            </Link>
                        </div>

                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-sm font-bold hover:text-accent transition-colors">
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="bg-white text-primary px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-md"
                            >
                                Join Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
