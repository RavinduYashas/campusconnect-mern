import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const NotificationsDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const { socket } = useSocket();
    const navigate = useNavigate();

    // Fetch initial notifications
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('new_notification', (data) => {
            // Re-fetch to get full populated data (or we could just prepend 'data' if it has all info)
            fetchNotifications();
        });

        return () => {
            socket.off('new_notification');
        };
    }, [socket]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.isRead) {
                const token = localStorage.getItem('token');
                await axios.put(`/api/notifications/${notification._id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Update local state
                setNotifications(prev => prev.map(n =>
                    n._id === notification._id ? { ...n, isRead: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            setIsOpen(false);
            // Navigate to QA page and pass the group ID and question ID in state so QA.jsx can auto-select it
            navigate('/qa', {
                state: {
                    targetGroupId: notification.group?._id || notification.group,
                    targetQuestionId: notification.question?._id || notification.question
                }
            });

        } catch (error) {
            console.error('Error marking notification as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);

        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-white/80 hover:text-white transition-colors focus:outline-none bg-white/5 hover:bg-white/10 rounded-xl border border-white/10"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2.25A6.75 6.75 0 005.25 9v.75a8.967 8.967 0 01-2.312 6.022c-.55.55-.54 1.43.005 1.956.37.36.854.551 1.365.551h15.384c.51 0 .995-.19 1.365-.551.545-.526.555-1.406.005-1.956a8.967 8.967 0 01-2.312-6.022V9A6.75 6.75 0 0012 2.25zM9.75 19.5c0 1.242 1.008 2.25 2.25 2.25s2.25-1.008 2.25-2.25H9.75z" clipRule="evenodd" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-primary shadow-lg animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 flex flex-col"
                    >
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                            <h3 className="font-bold text-text-main">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary font-bold hover:underline"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto custom-scrollbar flex-grow">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-text-muted text-sm font-medium">
                                    No notifications yet.
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 flex gap-3 items-start ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <img
                                            src={`/${notification.sender?.avatar || 'src/assets/images/defaults/avatar.png'}`}
                                            alt=""
                                            className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"
                                        />
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm text-text-main">
                                                <span className="font-bold">{notification.sender?.name}</span>
                                                {notification.type === 'new_question' ? ' asked a new question' : ' answered your question'}
                                            </p>
                                            <p className="text-xs text-text-secondary font-medium truncate mt-0.5">
                                                "{notification.question?.title}"
                                            </p>
                                            <p className="text-[10px] text-text-muted mt-1 font-bold">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationsDropdown;
