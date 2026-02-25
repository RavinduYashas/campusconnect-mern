import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ManageUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser] = useState(JSON.parse(localStorage.getItem('user')));

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/users/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchUsers();
    }, [currentUser, navigate]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(users.filter(user => user._id !== id));
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    if (loading) return <div className="text-center py-20 font-bold text-primary">Loading Management Data...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-main font-heading leading-tight">User Management</h1>
                    <p className="text-text-secondary text-sm">View and manage all registered platform users</p>
                </div>
                <div className="flex items-center gap-4">
                    {error && <span className="text-error text-sm font-bold">{error}</span>}
                    <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
                        + Add New User
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-text-secondary uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-sm font-bold text-text-secondary uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-sm font-bold text-text-secondary uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-sm font-bold text-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-text-main flex items-center gap-2">
                                        {user.name}
                                        {user._id === currentUser._id && (
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">YOU</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-text-secondary">{user.field || 'General'}</div>
                                </td>
                                <td className="px-6 py-4 text-text-secondary">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-red-50 text-error' :
                                        user.role === 'expert' ? 'bg-green-50 text-green-600' :
                                            'bg-blue-50 text-primary'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-3">
                                        <button className="text-primary hover:underline font-bold text-sm">Edit</button>
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="text-error hover:underline font-bold text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;
