import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManageGroups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroupData, setNewGroupData] = useState({ name: '', description: '' });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

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

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setCreateError(null);
        setCreateLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/qa/admin/groups', newGroupData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowCreateModal(false);
            setNewGroupData({ name: '', description: '' });
            fetchGroups(); // Refresh the list
        } catch (err) {
            setCreateError(err.response?.data?.message || "Failed to create group");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteClick = (group) => {
        setGroupToDelete(group);
        setShowDeleteModal(true);
    };

    const confirmDeleteGroup = async () => {
        if (!groupToDelete) return;
        setDeleteLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/qa/admin/groups/${groupToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Group deleted successfully!");
            setShowDeleteModal(false);
            setGroupToDelete(null);
            fetchGroups(); // Refresh list after deletion
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete group");
        } finally {
            setDeleteLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

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
                        onClick={() => setShowCreateModal(true)}
                        className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-dark transition-colors"
                    >
                        + Create Group
                    </button>
                    <Link to="/admin/qa-dashboard" className="text-primary font-bold flex items-center gap-2 hover:underline">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-text-main">Create New Group</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {createError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{createError}</div>}

                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-1">Group Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newGroupData.name}
                                    onChange={(e) => setNewGroupData({...newGroupData, name: e.target.value})}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="e.g., Computer Science, Engineering"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-secondary mb-1">Description (Optional)</label>
                                <textarea 
                                    value={newGroupData.description}
                                    onChange={(e) => setNewGroupData({...newGroupData, description: e.target.value})}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary h-24 resize-none"
                                    placeholder="Brief description of the group's purpose"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={createLoading}
                                    className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                                >
                                    {createLoading ? 'Creating...' : 'Create Group'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Delete Group Modal */}
            {showDeleteModal && groupToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            </div>
                            <h2 className="text-2xl font-black text-text-main mb-2">Delete Group?</h2>
                            <p className="text-text-secondary mb-6">
                                Are you sure you want to delete the group <span className="font-bold">"{groupToDelete.name}"</span>? This action cannot be undone.
                            </p>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                    disabled={deleteLoading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDeleteGroup}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleteLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((g) => (
                    <div key={g._id} className="relative bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        {/* Delete Button Top Right */}
                        <button
                            onClick={() => handleDeleteClick(g)}
                            className="absolute top-4 right-4 w-8 h-8 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-full flex items-center justify-center transition-all"
                            title="Delete Group"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                                {g.name[0]}
                            </div>
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-text-muted mr-10">
                                Channel
                            </span>
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

                        <div className="flex gap-2 mt-4">
                            <Link 
                                to={`/admin/qa/groups/${g._id}`}
                                className="w-full py-3 bg-gray-50 text-text-main font-bold rounded-xl text-sm border border-gray-100 hover:bg-gray-100 transition-all block text-center"
                            >
                                View Member List
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default ManageGroups;
