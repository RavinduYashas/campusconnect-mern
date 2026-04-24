import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [stats, setStats] = useState({
        users: 0,
        posts: 0,
        events: 0
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
        }
        // Mock stats for now
        setStats({
            users: 12,
            posts: 45,
            events: 8
        });
    }, [user, navigate]);

    // All cards combined under Platform Management
    const allNavItems = [
        {
            title: 'Study Groups',
            path: '/StudyGroups/AdminStudyGroups',
            icon: (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            description: 'Create, moderate, and oversee all study groups on the platform.',
            color: 'from-blue-500 to-indigo-600',
            bgHover: 'hover:border-blue-200'
        },
        {
            title: 'Workshops',
            path: '/Workshops/AdminWorkshops',
            icon: (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                </svg>
            ),
            description: 'Manage workshops, approve requests, and monitor participation.',
            color: 'from-green-500 to-emerald-600',
            bgHover: 'hover:border-green-200'
        },
        {
            title: 'User Management',
            path: '/admin/users',
            icon: (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            description: 'Manage users, roles, permissions, and member accounts.',
            color: 'from-purple-500 to-pink-600',
            bgHover: 'hover:border-purple-200'
        },
        {
            title: 'Skill Exchange',
            path: '/admin/skills-events',
            icon: (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
            description: 'Review and moderate all content across the platform.',
            color: 'from-orange-500 to-red-600',
            bgHover: 'hover:border-orange-200'
        },
        {
            title: 'Q&A Knowledge',
            path: '/admin/qa-dashboard',
            icon: (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            description: 'Monitor discussions, manage groups, and assist students.',
            color: 'from-pink-500 to-rose-600',
            bgHover: 'hover:border-pink-200'
        },
        {
            title: 'Platform Statistics',
            path: '#',
            icon: (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            description: 'View analytics, reports, and platform insights.',
            color: 'from-cyan-500 to-blue-600',
            bgHover: 'hover:border-cyan-200'
        },
        {
            title: 'All Members',
            path: '/admin/all-members',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
                    <path d="M6 21v-2a4 4 0 014-4h4" />
                </svg>
            ),
            description: 'View and manage all registered members.',
            color: 'from-teal-500 to-green-600',
            bgHover: 'hover:border-teal-200'
        },
        {
            title: 'System Settings',
            path: '#',
            icon: (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            description: 'Configure system preferences and global settings.',
            color: 'from-gray-500 to-gray-700',
            bgHover: 'hover:border-gray-300'
        },
    ];

    return (
        <div>
            <header className="mb-8">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-text-main font-heading mb-2"
                >
                    Admin Control Center
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-text-secondary"
                >
                    Welcome back, {user?.name}. Manage your platform from here.
                </motion.p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                {Object.entries(stats).map(([label, value], index) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                    >
                        <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">{label}</div>
                        <div className="text-3xl font-bold text-primary">{value}</div>
                        <div className="mt-2 text-xs text-text-secondary">+12% from last month</div>
                    </motion.div>
                ))}
            </div>

            {/* Platform Management - All Cards */}
            <div>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 mb-5"
                >
                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                    <h2 className="text-xl font-bold text-text-main">Platform Management</h2>
                </motion.div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {allNavItems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -8 }}
                        >
                            <Link to={item.path} className="block h-full group">
                                <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 h-full p-6 transition-all duration-300 hover:shadow-2xl ${item.bgHover} group-hover:border-transparent relative overflow-hidden`}>
                                    {/* Gradient overlay on hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                                    
                                    {/* Icon with animated background */}
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg bg-gradient-to-br ${item.color}`}>
                                        <div className="text-white [&>svg]:w-7 [&>svg]:h-7">
                                            {item.icon}
                                        </div>
                                    </div>
                                    
                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-text-main mb-2 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    
                                    {/* Description */}
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        {item.description}
                                    </p>
                                    
                                    {/* Arrow indicator */}
                                    <div className="mt-4 flex items-center gap-1 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                                        <span>Manage</span>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;