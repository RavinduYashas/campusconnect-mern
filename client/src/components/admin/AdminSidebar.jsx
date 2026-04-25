import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSidebar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const IconWrapper = ({ children, isActive }) => (
        <span className={`w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${isActive ? 'text-white' : 'text-[#EA580C]'}`}>
            {children}
        </span>
    );

    // Main nav items (without Groups & Workshops)
    const mainNavItems = [
        {
            title: 'Dashboard',
            path: '/admin/dashboard',
            icon: (active) => (
                <IconWrapper isActive={active}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                </IconWrapper>
            )
        },
        {
            title: 'Students & Q&A',
            path: '/admin/qa-dashboard',
            icon: (active) => (
                <IconWrapper isActive={active}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </IconWrapper>
            )
        },
        {
            title: 'Skills & Events',
            path: '/admin/skills-events',
            icon: (active) => (
                <IconWrapper isActive={active}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </IconWrapper>
            )
        },
        {
            title: 'Clubs',
            path: '/admin/clubs',
            icon: (active) => (
                <IconWrapper isActive={active}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                </IconWrapper>
            )
        },
        {
            title: 'Sports',
            path: '/admin/sports',
            icon: (active) => (
                <IconWrapper isActive={active}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </IconWrapper>
            )
        },
        {
            title: 'Manage Users',
            path: '/admin/users',
            icon: (active) => (
                <IconWrapper isActive={active}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </IconWrapper>
            )
        },
        // {
        //     title: 'Settings',
        //     path: '/admin/settings',
        //     icon: (active) => (
        //         <IconWrapper isActive={active}>
        //             <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        //                 <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        //                 <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        //             </svg>
        //         </IconWrapper>
        //     )
        // },
    ];

    // Dropdown items for Groups & Workshops
    const dropdownItems = [
        {
            title: 'Study Groups',
            path: '/StudyGroups/AdminStudyGroups',
            icon: (active) => (
                <IconWrapper isActive={active}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </IconWrapper>
            )
        },
        {
            title: 'Workshops',
            path: '/Workshops/AdminWorkshops',
            icon: (active) => (
                <IconWrapper isActive={active}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                    </svg>
                </IconWrapper>
            )
        }
    ];

    return (
        <aside className="fixed left-0 top-[72px] h-[calc(100vh-72px)] w-60 bg-gradient-to-b from-white via-white to-gray-50 border-r border-gray-100 shadow-2xl overflow-hidden z-40 hidden md:block">
            <div className="flex flex-col h-full py-6 px-3">
                {/* Logo / Title */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8 px-3"
                >
                    <p className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                        CampusAdmin
                    </p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Control Center</p>
                </motion.div>

                {/* Navigation Links */}
                <nav className="flex-grow space-y-1.5 overflow-y-auto custom-scrollbar">
                    {mainNavItems.map((item, index) => (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden ${
                                        isActive
                                            ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/20'
                                            : 'text-text-secondary hover:bg-primary/5 hover:text-primary'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* Animated background shine */}
                                        {isActive && (
                                            <motion.div 
                                                initial={{ x: '-100%' }}
                                                animate={{ x: '100%' }}
                                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            />
                                        )}
                                        
                                        {item.icon(isActive)}
                                        <span className="text-sm font-semibold">{item.title}</span>

                                        {/* Active Indicator Dot */}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: isActive ? 1 : 0 }}
                                            className={`ml-auto w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-primary'}`}
                                        />
                                    </>
                                )}
                            </NavLink>
                        </motion.div>
                    ))}

                    {/* Dropdown for Groups & Workshops */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: mainNavItems.length * 0.03 }}
                        className="relative"
                        ref={dropdownRef}
                    >
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                                isDropdownOpen 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'text-text-secondary hover:bg-primary/5 hover:text-primary'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </span>
                                <span className="text-sm font-semibold">Groups & Workshops</span>
                            </div>
                            <motion.svg
                                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </motion.svg>
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-6 mt-1 space-y-1 overflow-hidden"
                                >
                                    {dropdownItems.map((item, idx) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsDropdownOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 group ${
                                                    isActive
                                                        ? 'bg-gradient-to-r from-primary to-primary-dark text-white'
                                                        : 'text-text-secondary hover:bg-primary/5 hover:text-primary'
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    {item.icon(isActive)}
                                                    <span className="text-xs font-medium">{item.title}</span>
                                                </>
                                            )}
                                        </NavLink>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </nav>

                {/* Bottom Profile / Quick Info */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-auto pt-4 border-t border-gray-200"
                >
                    <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-white">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xs shadow-md">
                            A
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-text-main truncate">Admin User</p>
                            <p className="text-xs text-text-muted truncate flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                System Administrator
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </aside>
    );
};

export default AdminSidebar;