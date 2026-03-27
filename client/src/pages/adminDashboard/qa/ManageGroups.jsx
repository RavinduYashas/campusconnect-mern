import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ConfirmModal from '../../../components/ConfirmModal';

const ManageGroups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    
    // Edit/Delete State
    const [editingGroup, setEditingGroup] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ show: false, groupId: null });

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/qa/admin/groups', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(res.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load groups");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleCreateGroup = async (e) => {
        // ... (existing handleCreateGroup logic)
    };

    const handleUpdateGroup = async (e) => {
        e.preventDefault();
        if (!editingGroup.name.trim()) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.put(`/api/qa/admin/groups/${editingGroup._id}`, { name: editingGroup.name }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(groups.map(g => g._id === editingGroup._id ? { ...g, name: editingGroup.name } : g));
            setIsEditModalOpen(false);
            setEditingGroup(null);
            setLoading(false);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update group");
            setLoading(false);
        }
    };

    const handleDeleteGroup = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/qa/admin/groups/${confirmModal.groupId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(groups.filter(g => g._id !== confirmModal.groupId));
            setConfirmModal({ show: false, groupId: null });
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete group");
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-main">Manage QA Groups</h1>
                    <p className="text-text-secondary">Topic-based academic discussion channels.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Group
                    </button>
                    <Link to="/admin/qa-dashboard" className="text-primary font-bold flex items-center gap-2 hover:underline">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((g) => (
                    <div key={g._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                                    {g.name[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-text-muted w-fit mb-1">
                                        Channel
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => {
                                        setEditingGroup(g);
                                        setIsEditModalOpen(true);
                                    }}
                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                    title="Edit Group"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={() => setConfirmModal({ show: true, groupId: g._id })}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="Delete Group"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-text-main mb-1">{g.name}</h3>
                        <p className="text-sm text-text-muted mb-6">{g.members?.length || 0} Platform Members</p>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                             {g.members?.slice(0, 3).map(m => (
                                <div key={m._id} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 -ml-2 first:ml-0 flex items-center justify-center text-[10px] font-bold overflow-hidden" title={m.name}>
                                    {m.avatar ? (
                                        <img 
                                            src={m.avatar.startsWith('/') ? m.avatar : `/${m.avatar}`} 
                                            alt="" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                        />
                                    ) : null}
                                    <span style={{ display: m.avatar ? 'none' : 'block' }}>{m.name?.[0]}</span>
                                </div>
                             ))}
                             {g.members?.length > 3 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 -ml-2 flex items-center justify-center text-[10px] font-bold text-text-muted">
                                    +{g.members.length - 3}
                                </div>
                             )}
                        </div>

                        <Link 
                            to={`/admin/qa/groups/${g._id}`}
                            className="w-full py-3 bg-gray-50 text-text-main font-bold rounded-xl text-sm border border-gray-100 hover:bg-gray-100 transition-all block text-center"
                        >
                            View Member List
                        </Link>
                    </div>
                ))}
            </div>

            {/* Create Group Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-text-main">Create New Group</h2>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={handleCreateGroup} className="space-y-6">
                                    {createError && (
                                        <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 italic">
                                            {createError}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2 ml-1">Group Name</label>
                                        <input
                                            type="text"
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            required
                                            className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                            placeholder="e.g. Physics Core, Web Development"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                                    >
                                        {creating ? 'Creating...' : 'Create Group'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Group Modal */}
            <AnimatePresence>
                {isEditModalOpen && editingGroup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-text-main">Edit Group</h2>
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateGroup} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2 ml-1">Group Name</label>
                                        <input
                                            type="text"
                                            value={editingGroup.name}
                                            onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                                            required
                                            className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal 
                show={confirmModal.show}
                title="Delete Group?"
                message="Are you sure you want to delete this group? All associated metadata will be removed. This action cannot be undone."
                type="delete"
                onConfirm={handleDeleteGroup}
                onCancel={() => setConfirmModal({ show: false, groupId: null })}
            />
        </motion.div>
    );
};

export default ManageGroups;
