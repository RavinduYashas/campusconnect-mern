import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const onLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md py-4 px-6 mb-8 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <Link to="/" className="text-2xl font-bold text-primary font-heading">CampusConnect</Link>
                <ul className="hidden md:flex items-center gap-6 text-text-secondary font-medium">
                    <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                    <li><Link to="/profiles" className="hover:text-primary transition-colors">Network</Link></li>
                    <li><Link to="/clubs" className="hover:text-primary transition-colors">Clubs</Link></li>
                    <li><Link to="/skills" className="hover:text-primary transition-colors">Skill Exchange</Link></li>
                    <li><Link to="/sports" className="hover:text-primary transition-colors">Sports</Link></li>
                    <li><Link to="/groups" className="hover:text-primary transition-colors">Study Groups</Link></li>
                </ul>
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-4">
                        <Link to="/profiles" className="flex items-center gap-2 group">
                            <img
                                src={user.avatar || '/avatars/avatar1.png'}
                                alt="profile"
                                className="w-10 h-10 rounded-full border-2 border-primary group-hover:scale-110 transition-transform"
                            />
                            <span className="text-sm font-bold text-text-main hidden sm:block">{user.name}</span>
                        </Link>
                        <button
                            onClick={onLogout}
                            className="text-sm text-error font-bold hover:underline"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-text-secondary font-bold hover:text-primary transition-colors">Login</Link>
                        <Link
                            to="/register"
                            className="bg-primary text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-primary-dark transition-all transform hover:-translate-y-0.5"
                        >
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
